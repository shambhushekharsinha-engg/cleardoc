import os
import io
import json
import base64
import pytest
from botocore.exceptions import ClientError
import app


class TestAdversarialPathTraversal:
    """Stress-test filename sanitization and path traversal vectors."""

    def test_relative_traversal_unix(self):
        sanitized = app.sanitize_filename("../../etc/passwd")
        assert sanitized == "passwd"
        assert "/" not in sanitized
        assert ".." not in sanitized

    def test_relative_traversal_windows(self):
        sanitized = app.sanitize_filename("..\\..\\windows\\system32\\cmd.exe")
        assert sanitized == "cmd.exe"
        assert "\\" not in sanitized
        assert ".." not in sanitized

    def test_absolute_path_unix(self):
        sanitized = app.sanitize_filename("/etc/shadow")
        assert sanitized == "shadow"
        assert "/" not in sanitized

    def test_absolute_path_windows(self):
        sanitized = app.sanitize_filename("C:\\Sensitive\\Secret.pdf")
        assert sanitized == "Secret.pdf"
        assert ":" not in sanitized
        assert "\\" not in sanitized

    def test_null_byte_injection(self):
        sanitized = app.sanitize_filename("legit.pdf\x00.exe")
        assert "\x00" not in sanitized
        assert sanitized == "legit.pdf_.exe"

    def test_directory_dots_fallback_to_uuid(self):
        for dot_input in ["..", ".", "../", "..\\"]:
            sanitized = app.sanitize_filename(dot_input)
            assert sanitized.endswith(".pdf")
            assert sanitized not in (".", "..")

    def test_empty_and_whitespace_fallback_to_uuid(self):
        for empty_val in [None, "", "   ", "\t\n"]:
            sanitized = app.sanitize_filename(empty_val)
            assert sanitized.endswith(".pdf")
            assert len(sanitized) == 40

    def test_uri_encoded_traversal(self):
        sanitized = app.sanitize_filename("%2e%2e%2f%2e%2e%2fetc%2fpasswd")
        assert "/" not in sanitized
        assert ".." not in sanitized
        assert sanitized == "_2e_2e_2f_2e_2e_2fetc_2fpasswd"

    def test_extract_document_id_variations(self):
        assert app.extract_document_id("uploads/custom/doc.pdf", fallback_id="explicit-123") == "explicit-123"
        test_uuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        assert app.extract_document_id(f"uploads/{test_uuid}/contract.pdf") == test_uuid
        assert app.extract_document_id("uploads/doc-abc/contract.pdf") == "doc-abc"
        assert len(app.extract_document_id(None)) > 10


class TestAdversarialExtremePayloads:
    """Stress-test malformed, empty, and non-conforming request payloads."""

    def test_analyze_empty_json_returns_400(self, make_event):
        event = make_event(path="/analyze", method="POST", body="{}")
        response = app.lambda_handler(event)
        assert response["statusCode"] == 400
        data = json.loads(response["body"])
        assert "error" in data

    def test_chat_empty_json_returns_400(self, make_event):
        event = make_event(path="/chat", method="POST", body="{}")
        response = app.lambda_handler(event)
        assert response["statusCode"] == 400
        data = json.loads(response["body"])
        assert "error" in data

    def test_analyze_malformed_json_returns_400(self, make_event):
        event = make_event(path="/analyze", method="POST", body="{\"broken\": [1, 2,")
        response = app.lambda_handler(event)
        assert response["statusCode"] == 400
        data = json.loads(response["body"])
        assert data.get("error") == "Invalid JSON in request body"

    def test_chat_malformed_base64_returns_400(self, make_event):
        event = make_event(path="/chat", method="POST", body="???not_valid_b64???", is_base64=True)
        response = app.lambda_handler(event)
        assert response["statusCode"] == 400
        data = json.loads(response["body"])
        assert data.get("error") == "Invalid JSON in request body"

    def test_non_dict_json_payload_handling(self, make_event):
        """Adversarial input: JSON array or primitive instead of object."""
        event = make_event(path="/analyze", method="POST", body="[1, 2, 3]")
        response = app.lambda_handler(event)
        # Should return error status with CORS headers, not unhandled crash
        assert response["statusCode"] in [400, 500]
        assert response["headers"]["Access-Control-Allow-Origin"] == "*"


class TestAdversarialClaudeResponses:
    """Stress-test erratic formatting from Claude Bedrock responses."""

    def test_clean_markdown_fences_varieties(self):
        standard = "```json\n{\"summary\": \"Test\"}\n```"
        assert app.clean_markdown_fences(standard) == "{\"summary\": \"Test\"}"

        no_lang = "```\n{\"summary\": \"Test\"}\n```"
        assert app.clean_markdown_fences(no_lang) == "{\"summary\": \"Test\"}"

        already_clean = "{\"summary\": \"Test\"}"
        assert app.clean_markdown_fences(already_clean) == "{\"summary\": \"Test\"}"

    def test_claude_conversational_wrapping(self, mock_textract, mock_bedrock, mock_dynamodb, make_event, monkeypatch):
        """Claude wraps JSON in explanatory conversational paragraphs and fences."""
        ai_wrapped = (
            "Here is the detailed legal analysis of your contract:\n"
            "```json\n"
            "{\n"
            '  "summary": "Full commercial lease agreement.",\n'
            '  "redFlags": ["Section 9 indemnification without limit."],\n'
            '  "greenFlags": ["Term is 2 years with fixed rent."]\n'
            "}\n"
            "```\n"
            "Let me know if you would like me to clarify any clause."
        )
        body_response = {
            "content": [{"type": "text", "text": ai_wrapped}]
        }
        mock_bedrock.invoke_model.side_effect = None
        mock_bedrock.invoke_model.return_value = {
            "body": io.BytesIO(json.dumps(body_response).encode("utf-8"))
        }

        event = make_event(path="/analyze", method="POST", body=json.dumps({"objectKey": "test/doc.pdf"}))
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["summary"] == "Full commercial lease agreement."
        assert data["redFlags"] == ["Section 9 indemnification without limit."]
        assert data["greenFlags"] == ["Term is 2 years with fixed rent."]
        assert data["is_mock"] is False

    def test_claude_refusal_falls_back_to_mock(self, mock_textract, mock_bedrock, mock_dynamodb, make_event):
        """Claude responds with refusal text and no JSON."""
        body_response = {
            "content": [{"type": "text", "text": "I am an AI and cannot give legal advice on this document."}]
        }
        mock_bedrock.invoke_model.side_effect = None
        mock_bedrock.invoke_model.return_value = {
            "body": io.BytesIO(json.dumps(body_response).encode("utf-8"))
        }

        event = make_event(path="/analyze", method="POST", body=json.dumps({"objectKey": "test/doc.pdf"}))
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["is_mock"] is True
        assert "standard 12-month residential lease" in data["summary"]

    def test_claude_missing_summary_falls_back_to_mock(self, mock_textract, mock_bedrock, mock_dynamodb, make_event):
        """Claude returns JSON missing required summary key."""
        body_response = {
            "content": [{"type": "text", "text": "{\"redFlags\": [\"Risk 1\"], \"greenFlags\": []}"}]
        }
        mock_bedrock.invoke_model.side_effect = None
        mock_bedrock.invoke_model.return_value = {
            "body": io.BytesIO(json.dumps(body_response).encode("utf-8"))
        }

        event = make_event(path="/analyze", method="POST", body=json.dumps({"objectKey": "test/doc.pdf"}))
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["is_mock"] is True


class TestAdversarialClientErrorHandling:
    """Stress-test AWS SDK ClientError edge cases across all services."""

    def test_s3_access_denied_fallback(self, mock_s3, make_event):
        mock_s3.generate_presigned_url.side_effect = ClientError(
            {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
            "generate_presigned_url"
        )
        event = make_event(path="/upload", method="GET", query_params={"filename": "lease.pdf"})
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["is_mock"] is True
        assert "mock-s3-url" in data["uploadUrl"]

    def test_textract_unsupported_document_fallback(self, mock_textract, mock_bedrock, mock_dynamodb, make_event):
        mock_textract.detect_document_text.side_effect = ClientError(
            {"Error": {"Code": "UnsupportedDocumentException", "Message": "Image format not supported"}},
            "detect_document_text"
        )
        event = make_event(path="/analyze", method="POST", body=json.dumps({"objectKey": "test/corrupt.bin"}))
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert "summary" in data

    def test_bedrock_throttling_fallback(self, mock_textract, mock_bedrock, mock_dynamodb, make_event):
        mock_bedrock.invoke_model.side_effect = ClientError(
            {"Error": {"Code": "ThrottlingException", "Message": "Rate limit exceeded"}},
            "invoke_model"
        )
        event = make_event(path="/analyze", method="POST", body=json.dumps({"objectKey": "test/doc.pdf"}))
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert data["is_mock"] is True

    def test_dynamodb_put_failure_non_blocking(self, mock_textract, mock_bedrock, mock_dynamodb, make_event):
        mock_dynamodb.put_item.side_effect = ClientError(
            {"Error": {"Code": "ProvisionedThroughputExceededException", "Message": "Throughput exceeded"}},
            "put_item"
        )
        event = make_event(path="/analyze", method="POST", body=json.dumps({"objectKey": "test/doc.pdf"}))
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert "summary" in data

    def test_dynamodb_get_failure_chat_fallback(self, mock_bedrock, mock_dynamodb, make_event):
        mock_dynamodb.get_item.side_effect = ClientError(
            {"Error": {"Code": "ResourceNotFoundException", "Message": "Table not found"}},
            "get_item"
        )
        event = make_event(
            path="/chat",
            method="POST",
            body=json.dumps({"documentId": "missing-id", "question": "What is the rent?"})
        )
        response = app.lambda_handler(event)
        assert response["statusCode"] == 200
        data = json.loads(response["body"])
        assert "answer" in data


class TestAdversarialSAMTemplate:
    """Stress-test SAM template configuration, IAM policies, and CORS."""

    @pytest.fixture(scope="class")
    def template_text(self):
        path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "template.yaml")
        )
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def test_template_header_and_transform(self, template_text):
        assert "AWSTemplateFormatVersion: '2010-09-09'" in template_text
        assert "Transform: AWS::Serverless-2016-10-31" in template_text

    def test_s3_encryption_and_public_block(self, template_text):
        assert "BlockPublicAcls: true" in template_text
        assert "BlockPublicPolicy: true" in template_text
        assert "IgnorePublicAcls: true" in template_text
        assert "RestrictPublicBuckets: true" in template_text
        assert "SSEAlgorithm: AES256" in template_text

    def test_dynamodb_sse_and_billing(self, template_text):
        assert "BillingMode: PAY_PER_REQUEST" in template_text
        assert "SSEEnabled: true" in template_text

    def test_iam_policies_scoped(self, template_text):
        assert "S3ReadPolicy:" in template_text
        assert "S3WritePolicy:" in template_text
        assert "DynamoDBReadPolicy:" in template_text
        assert "DynamoDBWritePolicy:" in template_text
        assert "anthropic.claude-3-haiku-20240307-v1:0" in template_text

    def test_cors_and_endpoints(self, template_text):
        assert "AllowOrigin: \"'*'\"" in template_text
        assert "Path: /upload" in template_text
        assert "Path: /analyze" in template_text
        assert "Path: /chat" in template_text
