import io
import json
import pytest
from botocore.exceptions import ClientError
import app


def test_chat_with_camel_case_document_id(mock_dynamodb, mock_bedrock, make_event):
    """Verify POST /chat with camelCase documentId returns assistant response."""
    payload = {
        "documentId": "doc-test-12345",
        "question": "Who is responsible for structural repairs in this lease?"
    }
    event = make_event(
        path="/chat",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert body["documentId"] == "doc-test-12345"
    assert body["question"] == payload["question"]
    assert "answer" in body
    assert "structural" in body["answer"].lower()
    assert body["is_mock"] is False

    # DynamoDB get_item check
    mock_dynamodb.get_item.assert_called_once_with(Key={'document_id': 'doc-test-12345'})

    # Bedrock invoke_model check
    mock_bedrock.invoke_model.assert_called_once()


def test_chat_with_snake_case_document_id(mock_dynamodb, mock_bedrock, make_event):
    """Verify POST /chat with snake_case document_id (frontend dual contract) works seamlessly."""
    payload = {
        "document_id": "doc-test-12345",
        "question": "Is the security deposit refundable?"
    }
    event = make_event(
        path="/chat",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert body["documentId"] == "doc-test-12345"
    assert body["document_id"] == "doc-test-12345"
    assert "answer" in body
    assert body["is_mock"] is False


def test_chat_missing_question_returns_400(make_event):
    """Verify POST /chat with missing question returns HTTP 400."""
    event = make_event(
        path="/chat",
        method="POST",
        body=json.dumps({"documentId": "doc-test-12345"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "error" in body
    assert "Missing documentId or question" in body["error"]


def test_chat_missing_document_id_returns_400(make_event):
    """Verify POST /chat with missing document ID returns HTTP 400."""
    event = make_event(
        path="/chat",
        method="POST",
        body=json.dumps({"question": "Can I have pets?"})
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert "error" in body
    assert "Missing documentId or question" in body["error"]


def test_chat_dynamodb_document_not_found_uses_fallback_context(mock_dynamodb, mock_bedrock, make_event):
    """Verify if DynamoDB does not have the document, a fallback context is used without crashing."""
    mock_dynamodb.get_item.return_value = {}  # No Item found

    payload = {
        "documentId": "nonexistent-doc",
        "question": "What is the penalty for late payment?"
    }
    event = make_event(
        path="/chat",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert "answer" in body
    # Bedrock was still called with fallback context
    mock_bedrock.invoke_model.assert_called_once()


def test_chat_bedrock_client_error_fallback(mock_dynamodb, mock_bedrock, make_event):
    """Verify Bedrock ClientError in /chat falls back to a graceful mock answer with is_mock=True."""
    mock_bedrock.invoke_model.side_effect = ClientError(
        {"Error": {"Code": "ResourceNotFoundException", "Message": "Model not found"}},
        "invoke_model"
    )

    payload = {
        "documentId": "doc-test-12345",
        "question": "Can I sublease the apartment?"
    }
    event = make_event(
        path="/chat",
        method="POST",
        body=json.dumps(payload)
    )
    response = app.lambda_handler(event)

    assert response["statusCode"] == 200
    body = json.loads(response["body"])

    assert body["is_mock"] is True
    assert "mocked answer" in body["answer"]
    assert payload["question"] in body["answer"]
