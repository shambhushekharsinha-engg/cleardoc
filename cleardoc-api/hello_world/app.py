import json
import os
import sys
import uuid
import base64
import re
import logging
from datetime import datetime, timezone

try:
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError
except ImportError:
    boto3 = None

    class BotoCoreError(Exception):
        """Fallback base exception when botocore is not installed."""
        pass

    class ClientError(BotoCoreError):
        """Fallback ClientError exception when botocore is not installed."""
        def __init__(self, error_response=None, operation_name=None):
            self.response = error_response or {"Error": {"Code": "Unknown", "Message": "Mocked error"}}
            self.operation_name = operation_name or "Unknown"
            super().__init__(str(self.response))


class StructuredJsonFormatter(logging.Formatter):
    """Custom logging formatter that outputs structured JSON logs for CloudWatch and audit."""
    def format(self, record):
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        ignored_attrs = {
            'name', 'msg', 'args', 'levelname', 'levelno', 'pathname', 'filename',
            'module', 'exc_info', 'exc_text', 'stack_info', 'lineno', 'funcName',
            'created', 'msecs', 'relativeCreated', 'thread', 'threadName',
            'processName', 'process', 'message'
        }
        for key, val in record.__dict__.items():
            if key not in ignored_attrs and not key.startswith('_'):
                try:
                    json.dumps(val)
                    log_data[key] = val
                except (TypeError, OverflowError):
                    log_data[key] = str(val)
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)


def get_logger():
    logger_instance = logging.getLogger("cleardoc-api")
    log_level = os.environ.get("LOG_LEVEL", "INFO").upper()
    logger_instance.setLevel(getattr(logging, log_level, logging.INFO))
    if not logger_instance.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger_instance.addHandler(handler)
    logger_instance.propagate = False
    return logger_instance


logger = get_logger()

DOCUMENTS_BUCKET = os.environ.get('DOCUMENTS_BUCKET', 'mock-bucket')
TABLE_NAME = os.environ.get('TABLE_NAME', 'mock-table')
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0')

s3_client = boto3.client('s3') if boto3 else None
textract_client = boto3.client('textract') if boto3 else None
bedrock_client = boto3.client('bedrock-runtime') if boto3 else None
dynamodb = boto3.resource('dynamodb') if boto3 else None


def parse_body(event):
    """Safely decode and parse JSON body from API Gateway event."""
    raw_body = event.get('body')
    if not raw_body:
        return {}
    if isinstance(raw_body, dict):
        return raw_body
    if event.get('isBase64Encoded', False):
        try:
            raw_body = base64.b64decode(raw_body).decode('utf-8')
        except Exception as e:
            logger.warning("Failed to decode base64 body", extra={"error": str(e)})
            return None
    try:
        return json.loads(raw_body)
    except (json.JSONDecodeError, TypeError) as e:
        logger.warning("Failed to parse JSON body", extra={"error": str(e)})
        return None


def sanitize_filename(filename):
    """Sanitize filename to prevent path traversal and unsafe characters."""
    if not filename:
        return f"{uuid.uuid4()}.pdf"
    clean = os.path.basename(str(filename)).strip()
    clean = clean.replace('\\', '/').split('/')[-1]
    clean = re.sub(r'[^a-zA-Z0-9._-]', '_', clean)
    if not clean or clean in ('.', '..'):
        return f"{uuid.uuid4()}.pdf"
    return clean


def extract_document_id(object_key, fallback_id=None):
    """Extract document ID from object key if omitted by client."""
    if fallback_id:
        return str(fallback_id)
    if not object_key:
        return str(uuid.uuid4())
    uuid_match = re.search(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', object_key)
    if uuid_match:
        return uuid_match.group(0)
    parts = [p for p in object_key.split('/') if p]
    if parts:
        if parts[0] == 'uploads' and len(parts) > 1:
            return parts[1]
        return parts[0]
    return str(uuid.uuid4())


def clean_markdown_fences(ai_text):
    """Strip markdown code fences (```json ... ```) from Claude response."""
    if not ai_text:
        return ""
    cleaned = ai_text.strip()
    if cleaned.startswith("```"):
        first_newline = cleaned.find("\n")
        if first_newline != -1:
            cleaned = cleaned[first_newline + 1:]
        else:
            cleaned = cleaned.lstrip("`")
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].rstrip()
    return cleaned.strip()


def lambda_handler(event, context=None):
    request_id = (
        getattr(context, 'aws_request_id', None)
        or (event.get('requestContext') or {}).get('requestId')
        or str(uuid.uuid4())
    )
    path = event.get('path', '')
    method = event.get('httpMethod', '').upper()

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

    if method == 'OPTIONS':
        return {"statusCode": 200, "headers": headers, "body": "{}"}

    logger.info("Incoming request", extra={
        "request_id": request_id,
        "path": path,
        "method": method
    })

    try:
        if path == '/upload' and method in ('GET', 'POST'):
            return handle_upload(event, headers, request_id)
        elif path == '/analyze' and method == 'POST':
            return handle_analyze(event, headers, request_id)
        elif path == '/chat' and method == 'POST':
            return handle_chat(event, headers, request_id)
        else:
            logger.warning("Route not found", extra={
                "request_id": request_id,
                "path": path,
                "method": method
            })
            return {"statusCode": 404, "headers": headers, "body": json.dumps({"message": "Not Found"})}
    except Exception as e:
        logger.error("Unhandled error processing request", exc_info=True, extra={
            "request_id": request_id,
            "path": path,
            "method": method,
            "error": str(e)
        })
        return {"statusCode": 500, "headers": headers, "body": json.dumps({"error": str(e)})}


def handle_upload(event, headers, request_id=None):
    request_id = request_id or str(uuid.uuid4())
    query_params = event.get('queryStringParameters') or {}
    body = parse_body(event)
    if body is None:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Invalid JSON in request body"})
        }

    raw_filename = (
        query_params.get('filename')
        or query_params.get('fileName')
        or body.get('filename')
        or body.get('fileName')
    )
    file_name = sanitize_filename(raw_filename)
    content_type = (
        body.get('contentType')
        or body.get('content_type')
        or query_params.get('contentType')
        or query_params.get('content_type')
        or 'application/pdf'
    )
    document_id = str(uuid.uuid4())
    object_key = f"{document_id}/{file_name}"

    logger.info("Generating presigned upload URL", extra={
        "request_id": request_id,
        "document_id": document_id,
        "object_key": object_key,
        "file_name": file_name,
        "content_type": content_type
    })

    is_mock = False
    try:
        s3 = s3_client or (boto3.client('s3') if boto3 else None)
        if not s3:
            raise ClientError(
                {"Error": {"Code": "ClientNotAvailable", "Message": "Boto3 S3 client is unavailable"}},
                "generate_presigned_url"
            )

        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={'Bucket': DOCUMENTS_BUCKET, 'Key': object_key, 'ContentType': content_type},
            ExpiresIn=3600
        )
    except (ClientError, BotoCoreError) as e:
        logger.warning("S3 generate_presigned_url failed, falling back to mock URL", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "s3",
            "is_mock": True
        })
        is_mock = True
        presigned_url = f"https://mock-s3-url/{object_key}"
    except Exception as e:
        logger.warning("Unexpected error generating presigned URL, falling back to mock URL", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "s3",
            "is_mock": True
        })
        is_mock = True
        presigned_url = f"https://mock-s3-url/{object_key}"

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "uploadUrl": presigned_url,
            "documentId": document_id,
            "document_id": document_id,
            "objectKey": object_key,
            "key": object_key,
            "is_mock": is_mock
        })
    }


def handle_analyze(event, headers, request_id=None):
    request_id = request_id or str(uuid.uuid4())
    body = parse_body(event)
    if body is None:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Invalid JSON in request body"})
        }

    query_params = event.get('queryStringParameters') or {}
    object_key = (
        body.get('objectKey')
        or body.get('key')
        or query_params.get('objectKey')
        or query_params.get('key')
    )
    document_id = (
        body.get('documentId')
        or body.get('document_id')
        or query_params.get('documentId')
        or query_params.get('document_id')
    )

    if not object_key:
        logger.warning("Missing objectKey in analyze request", extra={"request_id": request_id})
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Missing objectKey or key"})
        }

    document_id = extract_document_id(object_key, document_id)

    logger.info("Starting document analysis", extra={
        "request_id": request_id,
        "document_id": document_id,
        "object_key": object_key
    })

    # 1. Textract
    is_mock = False
    extracted_text = None
    try:
        textract = textract_client or (boto3.client('textract') if boto3 else None)
        if not textract:
            raise ClientError(
                {"Error": {"Code": "ClientNotAvailable", "Message": "Textract client unavailable"}},
                "detect_document_text"
            )

        response = textract.detect_document_text(
            Document={'S3Object': {'Bucket': DOCUMENTS_BUCKET, 'Name': object_key}}
        )
        lines = [item['Text'] for item in response.get('Blocks', []) if item.get('BlockType') == 'LINE']
        if lines:
            extracted_text = " ".join(lines)
            logger.info("Textract extracted text successfully", extra={
                "request_id": request_id,
                "document_id": document_id,
                "line_count": len(lines)
            })
        else:
            logger.warning("Textract returned 0 text blocks", extra={"request_id": request_id, "document_id": document_id})
            extracted_text = "Mocked extracted text for document."
            is_mock = True
    except (ClientError, BotoCoreError) as e:
        logger.warning("Textract detection failed, falling back to mock text", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "textract",
            "is_mock": True
        })
        extracted_text = "Mocked extracted text for document."
        is_mock = True
    except Exception as e:
        logger.warning("Unexpected error in Textract, falling back to mock text", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "textract",
            "is_mock": True
        })
        extracted_text = "Mocked extracted text for document."
        is_mock = True

    # 2. Bedrock Claude Analysis
    prompt = f"""
Analyze the following legal document carefully. Respond ONLY with a single valid JSON object — no Markdown, no code fences, no preamble.

Required JSON schema:
{{
  "summary": "2-3 sentence plain English summary of what this document is about, who the parties are, and key terms",
  "riskScore": <integer from 0 to 100 indicating overall risk to the weaker party — 0=very safe, 100=extremely risky>,
  "riskLevel": "<one of: Low | Moderate | High | Critical>",
  "redFlags": [
    {{
      "id": "rf-1",
      "title": "Short title of the clause risk",
      "text": "Exact description of the problematic clause",
      "severity": "<critical or warning>",
      "category": "Category label (e.g. Liability Trap, Termination Risk, Privacy Violation)",
      "recommendation": "Specific, actionable negotiation advice to fix this clause"
    }}
  ],
  "greenFlags": [
    {{
      "id": "gf-1",
      "title": "Short title of the protective clause",
      "text": "Description of the favorable clause",
      "benefit": "Why this clause protects the weaker party"
    }}
  ]
}}

Rules:
- Find at least 4 red flags and 3 green flags.
- Mark clauses as "critical" severity if they represent serious financial or legal exposure, and "warning" for cautionary terms.
- For every red flag, provide an actionable "recommendation" on what specific amendment to negotiate.
- For every green flag, provide a "benefit" explaining how it safeguards the tenant or weaker party.
- Provide India-specific legal context where relevant (e.g., Transfer of Property Act 1882, Karnataka Rent Control Act, Model Tenancy Act, local Bangalore rental norms).
- riskScore must be an integer between 0 and 100.
- riskLevel must be exactly one of: "Low", "Moderate", "High", "Critical".

Document Text:
{extracted_text}
"""
    analysis_result = None
    try:
        bedrock = bedrock_client or (boto3.client('bedrock-runtime') if boto3 else None)
        if not bedrock:
            raise ClientError(
                {"Error": {"Code": "ClientNotAvailable", "Message": "Bedrock client unavailable"}},
                "invoke_model"
            )

        bedrock_response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        response_body = json.loads(bedrock_response['body'].read())
        ai_text = response_body['content'][0]['text']

        # Clean markdown fences from Claude's response
        cleaned_text = clean_markdown_fences(ai_text)
        json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
        candidate_json = json_match.group(0) if json_match else cleaned_text

        parsed = json.loads(candidate_json)
        if isinstance(parsed, dict) and "summary" in parsed:
            raw_score = parsed.get("riskScore")
            try:
                risk_score = int(raw_score) if raw_score is not None else 78
            except (ValueError, TypeError):
                risk_score = 78

            risk_level = str(parsed.get("riskLevel", "High"))
            if risk_level not in ("Low", "Moderate", "High", "Critical"):
                risk_level = "High" if risk_score >= 70 else ("Moderate" if risk_score >= 45 else "Low")

            analysis_result = {
                "summary": str(parsed.get("summary", "")),
                "riskScore": risk_score,
                "riskLevel": risk_level,
                "redFlags": list(parsed.get("redFlags", [])),
                "greenFlags": list(parsed.get("greenFlags", []))
            }
            logger.info("Bedrock analysis completed successfully", extra={
                "request_id": request_id,
                "document_id": document_id,
                "red_flag_count": len(analysis_result["redFlags"]),
                "green_flag_count": len(analysis_result["greenFlags"])
            })
        else:
            raise ValueError("Parsed JSON missing required 'summary' key")

    except (ClientError, BotoCoreError) as e:
        logger.warning("Bedrock analysis failed, falling back to mock analysis", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "bedrock",
            "is_mock": True
        })
        is_mock = True
    except (json.JSONDecodeError, ValueError, KeyError, Exception) as e:
        logger.warning("Bedrock response parsing failed, falling back to mock analysis", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "bedrock",
            "is_mock": True
        })
        is_mock = True

    if not analysis_result:
        is_mock = True
        analysis_result = {
            "summary": "This standard 12-month residential lease agreement is for a 2BHK apartment in Koramangala, Bangalore at ₹28,000/month. While some standard protections exist, this agreement contains several highly unfavorable clauses that expose the tenant to disproportionate financial and legal risk — particularly around maintenance liability, notice periods, and landlord entry rights. Legal review or renegotiation is strongly advised before signing.",
            "riskScore": 78,
            "riskLevel": "High",
            "redFlags": [
                {
                    "id": "rf-1",
                    "title": "10-Month Security Deposit Exceeds Market Norms",
                    "text": "Clause 3.1 demands a 10-month security deposit of ₹2,80,000 for a 2BHK in Koramangala, far exceeding standard practice and causing excessive capital lockup.",
                    "severity": "critical",
                    "category": "Deposit Risk",
                    "recommendation": "Negotiate to reduce the deposit to 2–3 months' rent (₹56,000–₹84,000) in accordance with Model Tenancy Act guidelines and modern Bangalore market standards."
                },
                {
                    "id": "rf-2",
                    "title": "Full Structural Maintenance & Painting Liability on Tenant",
                    "text": "Clause 4.2 places ALL maintenance liability on the tenant, including structural repairs, plumbing, electrical wiring, and painting burden — costs that can run into lakhs.",
                    "severity": "critical",
                    "category": "Liability Trap",
                    "recommendation": "Negotiate to cap tenant maintenance to minor repairs under ₹2,000. Under Section 108 of the Transfer of Property Act, 1882, major structural repairs are the landlord's statutory obligation."
                },
                {
                    "id": "rf-3",
                    "title": "3-Month Lock-in Period with Unilateral Deposit Forfeiture",
                    "text": "Clause 7.2 enforces a 3-month lock-in period with full forfeiture of the security deposit if the tenant vacates early, while allowing the landlord termination on 7 days notice.",
                    "severity": "critical",
                    "category": "Termination Risk",
                    "recommendation": "Demand symmetrical 30-day notice periods with zero deposit forfeiture unless there is verified structural physical damage or rent default."
                },
                {
                    "id": "rf-4",
                    "title": "Unregulated 10% Annual Rent Escalation",
                    "text": "Clause 2.3 mandates an automatic 10% annual rent escalation upon renewal, compounding significantly higher than prevailing Bangalore inflation without tenant review rights.",
                    "severity": "warning",
                    "category": "Financial Risk",
                    "recommendation": "Cap annual escalation at 5% with mandatory 60-day advance written notice, or link renewal adjustments to prevailing Koramangala market indices."
                },
                {
                    "id": "rf-5",
                    "title": "Unannounced Landlord Entry Without Prior Notice",
                    "text": "Clause 9.1 permits the landlord or their authorized agents to enter the premises at any time for unannounced inspection without prior written notice.",
                    "severity": "critical",
                    "category": "Privacy Violation",
                    "recommendation": "Amend to mandate at least 24 hours advance written notice (via email or WhatsApp) before any non-emergency landlord entry."
                }
            ],
            "greenFlags": [
                {
                    "id": "gf-1",
                    "title": "Security Deposit Refund Within 7 Bank Working Days",
                    "text": "Clause 3.2 binds the landlord to inspect and refund the full security deposit within 7 bank working days of handover via electronic bank transfer (NEFT/RTGS).",
                    "benefit": "Eliminates prolonged deposit withholding, establishing enforceable bank turnaround timelines post move-out."
                },
                {
                    "id": "gf-2",
                    "title": "Mandatory Formal Rent Receipts for HRA Exemption",
                    "text": "Clause 2.4 requires the landlord to provide signed formal rent receipts and PAN details each month for tenant HRA tax exemption claims.",
                    "benefit": "Guarantees full compliance for claiming House Rent Allowance (HRA) tax deductions under the Income Tax Act."
                },
                {
                    "id": "gf-3",
                    "title": "Explicit Fair Wear and Tear Protection",
                    "text": "Clause 5.4 provides a clear legal distinction between fair wear and tear and tenant damage, explicitly forbidding deductions from the security deposit for repainting or natural aging.",
                    "benefit": "Protects tenant deposit from arbitrary deductions for customary property aging and repainting."
                },
                {
                    "id": "gf-4",
                    "title": "24-Hour Advance Notice for Routine Maintenance",
                    "text": "Clause 8.3 requires the landlord to give at least 24 hours prior written notice before any scheduled routine maintenance or inspection visit.",
                    "benefit": "Protects tenant privacy and prevents unexpected intrusions into the residence."
                }
            ]
        }

    # 3. DynamoDB
    try:
        d_resource = dynamodb or (boto3.resource('dynamodb') if boto3 else None)
        if not d_resource:
            raise ClientError(
                {"Error": {"Code": "ClientNotAvailable", "Message": "DynamoDB resource unavailable"}},
                "put_item"
            )

        table = d_resource.Table(TABLE_NAME)
        table.put_item(Item={
            'document_id': document_id,
            'object_key': object_key,
            'extracted_text': extracted_text,
            'analysis': analysis_result
        })
        logger.info("Saved analysis to DynamoDB", extra={
            "request_id": request_id,
            "document_id": document_id,
            "table_name": TABLE_NAME
        })
    except (ClientError, BotoCoreError) as e:
        logger.warning("DynamoDB put_item failed, proceeding", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "dynamodb"
        })
    except Exception as e:
        logger.warning("Unexpected error during DynamoDB put_item, proceeding", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "dynamodb"
        })

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "documentId": document_id,
            "document_id": document_id,
            "summary": analysis_result.get("summary", ""),
            "riskScore": analysis_result.get("riskScore", 78),
            "riskLevel": analysis_result.get("riskLevel", "High"),
            "redFlags": analysis_result.get("redFlags", []),
            "greenFlags": analysis_result.get("greenFlags", []),
            "is_mock": is_mock
        })
    }


def handle_chat(event, headers, request_id=None):
    request_id = request_id or str(uuid.uuid4())
    body = parse_body(event)
    if body is None:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Invalid JSON in request body"})
        }

    query_params = event.get('queryStringParameters') or {}
    document_id = (
        body.get('documentId')
        or body.get('document_id')
        or query_params.get('documentId')
        or query_params.get('document_id')
    )
    question = body.get('question') or query_params.get('question')

    if not document_id or not question:
        logger.warning("Missing documentId or question in chat request", extra={
            "request_id": request_id,
            "has_document_id": bool(document_id),
            "has_question": bool(question)
        })
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Missing documentId or question"})
        }

    logger.info("Processing chat question", extra={
        "request_id": request_id,
        "document_id": document_id,
        "question": question
    })

    # Get document from DynamoDB
    extracted_text = "Mocked document text."
    try:
        d_resource = dynamodb or (boto3.resource('dynamodb') if boto3 else None)
        if not d_resource:
            raise ClientError(
                {"Error": {"Code": "ClientNotAvailable", "Message": "DynamoDB resource unavailable"}},
                "get_item"
            )

        table = d_resource.Table(TABLE_NAME)
        response = table.get_item(Key={'document_id': document_id})
        item = response.get('Item')
        if item and 'extracted_text' in item:
            extracted_text = item['extracted_text']
            logger.info("Retrieved document from DynamoDB", extra={
                "request_id": request_id,
                "document_id": document_id
            })
        else:
            logger.warning("Document ID not found in DynamoDB, using fallback context", extra={
                "request_id": request_id,
                "document_id": document_id
            })
    except (ClientError, BotoCoreError) as e:
        logger.warning("DynamoDB get_item failed, using fallback context", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "dynamodb"
        })
    except Exception as e:
        logger.warning("Unexpected error retrieving document from DynamoDB, using fallback context", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "dynamodb"
        })

    prompt = f"""
You are an AI assistant answering questions about a legal document.
Document Text:
{extracted_text}

Question:
{question}

Answer in plain, helpful English:
"""

    is_mock = False
    try:
        bedrock = bedrock_client or (boto3.client('bedrock-runtime') if boto3 else None)
        if not bedrock:
            raise ClientError(
                {"Error": {"Code": "ClientNotAvailable", "Message": "Bedrock client unavailable"}},
                "invoke_model"
            )

        bedrock_response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        response_body = json.loads(bedrock_response['body'].read())
        ai_text = response_body['content'][0]['text']
        answer = clean_markdown_fences(ai_text)
        logger.info("Bedrock chat completed successfully", extra={
            "request_id": request_id,
            "document_id": document_id
        })
    except (ClientError, BotoCoreError) as e:
        logger.warning("Bedrock chat failed, falling back to mock answer", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "bedrock",
            "is_mock": True
        })
        is_mock = True
        answer = f"This is a mocked answer for the question: '{question}' based on the document."
    except Exception as e:
        logger.warning("Unexpected error during Bedrock chat, falling back to mock answer", extra={
            "request_id": request_id,
            "document_id": document_id,
            "error": str(e),
            "service": "bedrock",
            "is_mock": True
        })
        is_mock = True
        answer = f"This is a mocked answer for the question: '{question}' based on the document."

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "documentId": document_id,
            "document_id": document_id,
            "question": question,
            "answer": answer,
            "is_mock": is_mock
        })
    }
