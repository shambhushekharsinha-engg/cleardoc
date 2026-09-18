import os
import sys
import io
import json
import pytest
from unittest.mock import MagicMock

# Ensure hello_world is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Set dummy AWS credentials and env vars before importing app
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["DOCUMENTS_BUCKET"] = "test-documents-bucket"
os.environ["TABLE_NAME"] = "test-cleardoc-table"
os.environ["BEDROCK_MODEL_ID"] = "anthropic.claude-3-haiku-20240307-v1:0"

import app


@pytest.fixture(autouse=True)
def reset_environment():
    """Ensure environment variables remain consistent across tests."""
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    os.environ["DOCUMENTS_BUCKET"] = "test-documents-bucket"
    os.environ["TABLE_NAME"] = "test-cleardoc-table"
    os.environ["BEDROCK_MODEL_ID"] = "anthropic.claude-3-haiku-20240307-v1:0"
    yield


@pytest.fixture
def mock_s3(monkeypatch):
    """Fixture to mock boto3 S3 client."""
    mock = MagicMock()
    mock.generate_presigned_url.return_value = (
        "https://test-documents-bucket.s3.amazonaws.com/uploads/sample.pdf?signature=mocked"
    )
    monkeypatch.setattr(app, "s3_client", mock)
    return mock


@pytest.fixture
def mock_textract(monkeypatch):
    """Fixture to mock boto3 Textract client with realistic OCR text."""
    mock = MagicMock()
    mock.detect_document_text.return_value = {
        "Blocks": [
            {"BlockType": "PAGE", "Text": ""},
            {"BlockType": "LINE", "Text": "STANDARD RESIDENTIAL LEASE AGREEMENT"},
            {"BlockType": "LINE", "Text": "1. PARTIES: Landlord rents to Tenant property at 100 Main St."},
            {"BlockType": "LINE", "Text": "2. RENT: Tenant shall pay $2,000 per month on the 1st of every month."},
            {"BlockType": "LINE", "Text": "3. DEPOSIT: Security deposit of $4,000 is held in escrow."},
            {"BlockType": "LINE", "Text": "4. MAINTENANCE: Tenant is responsible for structural and plumbing repairs."},
            {"BlockType": "LINE", "Text": "5. TERMINATION: Landlord may terminate with 7 days notice without cause."},
        ]
    }
    monkeypatch.setattr(app, "textract_client", mock)
    return mock


@pytest.fixture
def mock_bedrock(monkeypatch):
    """Fixture to mock boto3 Bedrock Claude 3 Haiku responses."""
    mock = MagicMock()

    analysis_payload = {
        "summary": "This is a standard 12-month residential lease agreement for 100 Main St with rent of $2,000/month.",
        "redFlags": [
            "Clause 4 requires tenant to pay for structural and roof repairs.",
            "Clause 5 permits landlord termination on only 7 days notice without cause."
        ],
        "greenFlags": [
            "Deposit is held in an escrow account.",
            "Rent amount and payment schedule are clearly defined."
        ]
    }

    def _invoke_model(**kwargs):
        body_input = json.loads(kwargs.get("body", "{}"))
        user_prompt = body_input.get("messages", [{}])[0].get("content", "")

        # Differentiate chat responses from analysis responses
        if "Answer in plain, helpful English" in user_prompt:
            answer_text = "According to clause 4, the tenant is unexpectedly obligated to cover structural and plumbing repairs, which is non-standard."
            body_response = {
                "id": "msg_mock_chat_123",
                "type": "message",
                "role": "assistant",
                "content": [{"type": "text", "text": answer_text}],
                "model": "anthropic.claude-3-haiku-20240307-v1:0"
            }
        else:
            ai_text = json.dumps(analysis_payload)
            body_response = {
                "id": "msg_mock_analysis_123",
                "type": "message",
                "role": "assistant",
                "content": [{"type": "text", "text": ai_text}],
                "model": "anthropic.claude-3-haiku-20240307-v1:0"
            }

        response_stream = io.BytesIO(json.dumps(body_response).encode("utf-8"))
        return {"body": response_stream}

    mock.invoke_model.side_effect = _invoke_model
    monkeypatch.setattr(app, "bedrock_client", mock)
    return mock


@pytest.fixture
def mock_dynamodb(monkeypatch):
    """Fixture to mock DynamoDB table resource."""
    mock_table = MagicMock()
    mock_table.get_item.return_value = {
        "Item": {
            "document_id": "doc-test-12345",
            "object_key": "doc-test-12345/lease.pdf",
            "extracted_text": "STANDARD RESIDENTIAL LEASE AGREEMENT. Clause 4: Tenant covers structural repairs.",
            "analysis": {
                "summary": "Standard residential lease with severe maintenance liability.",
                "redFlags": ["Tenant covers structural repairs."],
                "greenFlags": ["Deposit held in escrow."]
            }
        }
    }
    mock_table.put_item.return_value = {"ResponseMetadata": {"HTTPStatusCode": 200}}

    mock_resource = MagicMock()
    mock_resource.Table.return_value = mock_table
    monkeypatch.setattr(app, "dynamodb", mock_resource)
    return mock_table


@pytest.fixture
def make_event():
    """Factory fixture to create realistic API Gateway proxy integration events."""
    def _factory(
        path="/",
        method="GET",
        body=None,
        query_params=None,
        headers=None,
        is_base64=False,
        request_id="req-test-uuid-123"
    ):
        event = {
            "resource": path,
            "path": path,
            "httpMethod": method,
            "headers": headers or {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            "queryStringParameters": query_params,
            "pathParameters": None,
            "stageVariables": None,
            "requestContext": {
                "resourceId": "res123",
                "resourcePath": path,
                "httpMethod": method,
                "extendedRequestId": "ext-123",
                "requestTime": "18/Sep/2026:18:00:00 +0000",
                "path": path,
                "accountId": "123456789012",
                "protocol": "HTTP/1.1",
                "stage": "Prod",
                "domainPrefix": "api",
                "requestTimeEpoch": 1789754400,
                "requestId": request_id,
                "identity": {
                    "sourceIp": "127.0.0.1",
                    "userAgent": "Mozilla/5.0"
                }
            },
            "body": body,
            "isBase64Encoded": is_base64
        }
        return event

    return _factory
