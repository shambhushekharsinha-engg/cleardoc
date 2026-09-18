import base64
import json
import logging
import io
import pytest
import app


def test_cors_options_preflight(make_event):
    """Verify HTTP OPTIONS preflight request returns 200 with all required CORS headers."""
    event = make_event(
        path="/upload",
        method="OPTIONS"
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    headers = response["headers"]
    assert headers["Access-Control-Allow-Origin"] == "*"
    assert "Access-Control-Allow-Methods" in headers
    assert "OPTIONS" in headers["Access-Control-Allow-Methods"]
    assert "GET" in headers["Access-Control-Allow-Methods"]
    assert "POST" in headers["Access-Control-Allow-Methods"]
    assert "Content-Type" in headers["Access-Control-Allow-Headers"]
    assert response["body"] == "{}"


def test_unknown_path_returns_404(make_event):
    """Verify unknown path returns HTTP 404 with Not Found message."""
    event = make_event(
        path="/nonexistent-route",
        method="GET"
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 404
    body = json.loads(response["body"])
    assert body["message"] == "Not Found"


def test_unknown_method_on_existing_path_returns_404(make_event):
    """Verify unsupported HTTP method (e.g. DELETE /analyze) returns HTTP 404."""
    event = make_event(
        path="/analyze",
        method="DELETE"
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 404
    body = json.loads(response["body"])
    assert body["message"] == "Not Found"


def test_base64_encoded_body_decoding(mock_s3, make_event):
    """Verify API Gateway base64 encoded request bodies are correctly decoded."""
    raw_payload = json.dumps({"filename": "scanned_lease.pdf", "contentType": "application/pdf"})
    encoded_body = base64.b64encode(raw_payload.encode("utf-8")).decode("utf-8")

    event = make_event(
        path="/upload",
        method="POST",
        body=encoded_body,
        is_base64=True
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["objectKey"].endswith("/scanned_lease.pdf")


def test_invalid_base64_encoded_body_returns_400(make_event):
    """Verify invalid base64 body fails safely and returns HTTP 400."""
    event = make_event(
        path="/upload",
        method="POST",
        body="!!!NOT_VALID_BASE64!!!",
        is_base64=True
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "error" in body


def test_structured_json_logging_format():
    """Verify StructuredJsonFormatter emits valid JSON with timestamp, level, message, and extra fields."""
    formatter = app.StructuredJsonFormatter()
    record = logging.LogRecord(
        name="cleardoc-api",
        level=logging.INFO,
        pathname="app.py",
        lineno=100,
        msg="Test structured log event",
        args=(),
        exc_info=None
    )
    record.request_id = "req-test-999"
    record.document_id = "doc-test-888"
    record.custom_metric = 42

    formatted_str = formatter.format(record)
    parsed = json.loads(formatted_str)

    assert parsed["level"] == "INFO"
    assert parsed["message"] == "Test structured log event"
    assert parsed["logger"] == "cleardoc-api"
    assert "timestamp" in parsed
    assert parsed["request_id"] == "req-test-999"
    assert parsed["document_id"] == "doc-test-888"
    assert parsed["custom_metric"] == 42
