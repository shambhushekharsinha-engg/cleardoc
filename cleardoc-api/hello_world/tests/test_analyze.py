import io
import json
import pytest
from botocore.exceptions import ClientError
import app


def test_analyze_standard_contract(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify POST /analyze with objectKey and documentId succeeds with Textract and Bedrock."""
    payload = {
        "objectKey": "123e4567-e89b-12d3-a456-426614174000/rental_agreement.pdf",
        "documentId": "123e4567-e89b-12d3-a456-426614174000"
    }
    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert body["documentId"] == "123e4567-e89b-12d3-a456-426614174000"
    assert body["document_id"] == body["documentId"]
    assert "summary" in body
    assert isinstance(body["redFlags"], list)
    assert len(body["redFlags"]) >= 2
    assert isinstance(body["greenFlags"], list)
    assert len(body["greenFlags"]) >= 2
    assert body["is_mock"] is False

    # Check that Textract was called with correct bucket and key
    mock_textract.detect_document_text.assert_called_once_with(
        Document={'S3Object': {'Bucket': 'test-documents-bucket', 'Name': payload['objectKey']}}
    )

    # Check that Bedrock was invoked
    mock_bedrock.invoke_model.assert_called_once()

    # Check DynamoDB put_item was called
    mock_dynamodb.put_item.assert_called_once()
    saved_item = mock_dynamodb.put_item.call_args[1]["Item"]
    assert saved_item["document_id"] == body["documentId"]
    assert saved_item["object_key"] == payload["objectKey"]
    assert "analysis" in saved_item


def test_analyze_frontend_dual_contract_with_key_only(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify POST /analyze with only `key` extracts documentId from prefix."""
    uuid_str = "abcdef12-3456-7890-abcd-ef1234567890"
    payload = {
        "key": f"{uuid_str}/commercial_lease.pdf"
    }
    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    # Document ID extracted from key path
    assert body["documentId"] == uuid_str
    assert body["is_mock"] is False


def test_analyze_missing_parameters_returns_400(make_event):
    """Verify missing both objectKey and key returns HTTP 400."""
    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"documentId": "some-id"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "error" in body
    assert "Missing objectKey or key" in body["error"]


def test_analyze_bedrock_markdown_fences_stripping(mock_textract, mock_bedrock, mock_dynamodb, make_event, monkeypatch):
    """Verify Bedrock response enclosed in markdown ```json ... ``` code fences is parsed correctly."""
    fenced_response = """```json
{
  "summary": "Plain English summary extracted from markdown code block.",
  "redFlags": ["Arbitration clause in another state."],
  "greenFlags": ["30-day cure period for defaults."]
}
```"""
    body_response = {
        "id": "msg_fenced_123",
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": fenced_response}],
        "model": "anthropic.claude-3-haiku-20240307-v1:0"
    }
    mock_bedrock.invoke_model.side_effect = lambda **kwargs: {
        "body": io.BytesIO(json.dumps(body_response).encode("utf-8"))
    }

    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"objectKey": "uploads/doc-123/agreement.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["summary"] == "Plain English summary extracted from markdown code block."
    assert body["redFlags"] == ["Arbitration clause in another state."]
    assert body["greenFlags"] == ["30-day cure period for defaults."]
    assert body["is_mock"] is False


def test_analyze_textract_client_error_fallback(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify Textract ClientError gracefully falls back to mock text and continues analysis."""
    mock_textract.detect_document_text.side_effect = ClientError(
        {"Error": {"Code": "UnsupportedDocumentException", "Message": "Multi-page PDF not supported"}},
        "detect_document_text"
    )

    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"objectKey": "doc-multipage/doc.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    # Bedrock still processes the fallback text
    assert "summary" in body
    assert len(body["redFlags"]) > 0


def test_analyze_bedrock_client_error_fallback(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify Bedrock ClientError triggers fallback mock analysis with is_mock=True."""
    mock_bedrock.invoke_model.side_effect = ClientError(
        {"Error": {"Code": "ThrottlingException", "Message": "Rate limit exceeded"}},
        "invoke_model"
    )

    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"objectKey": "doc-throttled/doc.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert body["is_mock"] is True
    assert "12-month residential lease agreement" in body["summary"]
    assert any("maintenance" in (flag["text"] if isinstance(flag, dict) else flag).lower() for flag in body["redFlags"])
    assert any("deposit" in (flag["text"] if isinstance(flag, dict) else flag).lower() for flag in body["greenFlags"])
    assert body["riskScore"] == 78
    assert body["riskLevel"] == "High"
    assert len(body["redFlags"]) >= 4
    for flag in body["redFlags"]:
        assert isinstance(flag, dict)
        assert "text" in flag
        assert flag["severity"] in ["critical", "warning"]
        assert "recommendation" in flag
    assert len(body["greenFlags"]) >= 3
    for flag in body["greenFlags"]:
        assert isinstance(flag, dict)
        assert "text" in flag
        assert "benefit" in flag


def test_analyze_dynamodb_failure_does_not_crash_analysis(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify DynamoDB put_item ClientError is logged and does not fail the HTTP 200 response."""
    mock_dynamodb.put_item.side_effect = ClientError(
        {"Error": {"Code": "ProvisionedThroughputExceededException", "Message": "Throughput exceeded"}},
        "put_item"
    )

    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"objectKey": "doc-ddb-err/contract.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert "summary" in body


def test_analyze_enriched_claude_response_preserves_risk_profile(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify Bedrock response with custom riskScore, riskLevel, and structured flags is preserved."""
    enriched_payload = {
        "summary": "Commercial lease for office space in Whitefield, Bangalore.",
        "riskScore": 42,
        "riskLevel": "Moderate",
        "redFlags": [
            {
                "id": "rf-custom-1",
                "title": "Subletting Restriction",
                "text": "Tenant may not sublet any portion of the premises.",
                "severity": "warning",
                "recommendation": "Request permission to sublet to affiliates."
            }
        ],
        "greenFlags": [
            {
                "id": "gf-custom-1",
                "title": "Parking Included",
                "text": "Two reserved basement parking slots provided at no extra charge.",
                "benefit": "Saves ₹8,000 monthly in commercial parking fees."
            }
        ]
    }
    body_response = {
        "id": "msg_enriched_123",
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": json.dumps(enriched_payload)}],
        "model": "anthropic.claude-3-haiku-20240307-v1:0"
    }
    mock_bedrock.invoke_model.side_effect = lambda **kwargs: {
        "body": io.BytesIO(json.dumps(body_response).encode("utf-8"))
    }

    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"objectKey": "uploads/doc-commercial/lease.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["is_mock"] is False
    assert body["riskScore"] == 42
    assert body["riskLevel"] == "Moderate"
    assert len(body["redFlags"]) == 1
    assert body["redFlags"][0]["severity"] == "warning"
    assert body["redFlags"][0]["recommendation"] == "Request permission to sublet to affiliates."
    assert len(body["greenFlags"]) == 1
    assert body["greenFlags"][0]["benefit"] == "Saves ₹8,000 monthly in commercial parking fees."


def test_analyze_claude_response_invalid_score_defaults_safely(mock_textract, mock_bedrock, mock_dynamodb, make_event):
    """Verify Bedrock response with non-integer riskScore defaults safely to 78 and High."""
    payload_with_bad_score = {
        "summary": "Residential agreement with malformed score field.",
        "riskScore": "not-a-number",
        "riskLevel": "InvalidLevel",
        "redFlags": [{"text": "Late fee clause", "severity": "warning", "recommendation": "Negotiate cap"}],
        "greenFlags": [{"text": "Clear notice period", "benefit": "Predictable exit"}]
    }
    body_response = {
        "id": "msg_bad_score_123",
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": json.dumps(payload_with_bad_score)}],
        "model": "anthropic.claude-3-haiku-20240307-v1:0"
    }
    mock_bedrock.invoke_model.side_effect = lambda **kwargs: {
        "body": io.BytesIO(json.dumps(body_response).encode("utf-8"))
    }

    event = make_event(
        path="/analyze",
        method="POST",
        body=json.dumps({"objectKey": "uploads/doc-bad-score/lease.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["is_mock"] is False
    assert body["riskScore"] == 78
    assert body["riskLevel"] == "High"

