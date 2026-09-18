import json
import uuid
import pytest
from botocore.exceptions import ClientError
import app


def test_get_upload_with_query_filename(mock_s3, make_event):
    """Verify GET /upload with filename in query parameters returns a presigned URL."""
    event = make_event(
        path="/upload",
        method="GET",
        query_params={"filename": "lease_agreement.pdf", "contentType": "application/pdf"}
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    assert "Access-Control-Allow-Origin" in response["headers"]
    body = json.loads(response["body"])

    assert "uploadUrl" in body
    assert "documentId" in body
    assert "objectKey" in body
    assert "key" in body
    assert body["objectKey"] == body["key"]
    assert body["is_mock"] is False
    assert body["objectKey"].endswith("/lease_agreement.pdf")

    # Verify S3 presigned URL generation was called
    mock_s3.generate_presigned_url.assert_called_once()
    args, kwargs = mock_s3.generate_presigned_url.call_args
    client_method = args[0] if args else kwargs.get("ClientMethod")
    assert client_method == "put_object"
    assert kwargs["Params"]["Bucket"] == "test-documents-bucket"
    assert kwargs["Params"]["Key"] == body["objectKey"]
    assert kwargs["Params"]["ContentType"] == "application/pdf"


def test_post_upload_with_json_body(mock_s3, make_event):
    """Verify POST /upload with JSON body handles dual contract from frontend."""
    payload = {
        "filename": "employment_contract.pdf",
        "contentType": "application/pdf"
    }
    event = make_event(
        path="/upload",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert "uploadUrl" in body
    assert body["uploadUrl"].startswith("https://")
    assert "documentId" in body
    assert body["document_id"] == body["documentId"]
    assert body["objectKey"].endswith("/employment_contract.pdf")
    assert body["is_mock"] is False


def test_upload_directory_traversal_sanitization(mock_s3, make_event):
    """Verify directory traversal attempts in filename are strictly sanitized."""
    malicious_filename = "../../../../../etc/passwd"
    event = make_event(
        path="/upload",
        method="POST",
        body=json.dumps({"filename": malicious_filename})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    # Filename should be sanitized to only the basename "passwd", with no ".."
    assert ".." not in body["objectKey"]
    assert body["objectKey"].endswith("/passwd")

    # Windows-style traversal attempt
    win_traversal = "..\\..\\windows\\system32\\calc.exe"
    event_win = make_event(
        path="/upload",
        method="GET",
        query_params={"filename": win_traversal}
    )
    response_win = app.lambda_handler(event_win)
    assert response_win["statusCode"] == 200
    body_win = json.loads(response_win["body"])
    assert ".." not in body_win["objectKey"]
    assert "\\" not in body_win["objectKey"]
    assert body_win["objectKey"].endswith("/calc.exe")


def test_upload_empty_filename_generates_uuid_pdf(mock_s3, make_event):
    """Verify omitting filename generates a valid random UUID PDF name."""
    event = make_event(
        path="/upload",
        method="GET",
        query_params=None
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["objectKey"].endswith(".pdf")
    # Should not be empty
    assert len(body["objectKey"].split("/")) == 2


def test_upload_s3_client_error_fallback(mock_s3, make_event):
    """Verify that when S3 generate_presigned_url raises ClientError, a mock fallback URL is returned."""
    mock_s3.generate_presigned_url.side_effect = ClientError(
        {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}},
        "generate_presigned_url"
    )

    event = make_event(
        path="/upload",
        method="POST",
        body=json.dumps({"filename": "tenant_agreement.pdf"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert body["is_mock"] is True
    assert "https://mock-s3-url/" in body["uploadUrl"]
    assert body["uploadUrl"].endswith("/tenant_agreement.pdf")
    assert body["documentId"] is not None
    assert body["objectKey"] is not None


def test_upload_malformed_json_body_returns_400(make_event):
    """Verify invalid JSON syntax in body returns HTTP 400."""
    event = make_event(
        path="/upload",
        method="POST",
        body="{ invalid json syntax"
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "error" in body
    assert "Invalid JSON" in body["error"]
