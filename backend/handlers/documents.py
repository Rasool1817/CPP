"""Lambda handlers for document upload/download via S3 pre-signed URLs."""

import os
import boto3

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.auth import get_user_id
from utils.response import success, error, parse_body

from warranty_tracker import DocumentProcessor

s3_client = boto3.client("s3")
DOCUMENTS_BUCKET = os.environ.get("DOCUMENTS_BUCKET", "warranty-tracker-api-documents-dev")

doc_processor = DocumentProcessor()


def get_upload_url(event, context):
    """Generate a pre-signed S3 URL for uploading a document."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    body = parse_body(event)
    filename = body.get("filename", "")
    file_size = body.get("file_size", 0)
    warranty_id = body.get("warranty_id", "general")

    validation = doc_processor.validate_document(filename, file_size)
    if not validation["valid"]:
        return error("; ".join(validation["errors"]))

    s3_key = doc_processor.generate_s3_key(user_id, warranty_id, filename)
    content_type = doc_processor.get_content_type(filename)
    metadata = doc_processor.extract_metadata(filename, file_size)

    # Generate presigned PUT URL without ContentType in signature
    # so the browser can upload without a CORS preflight
    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": DOCUMENTS_BUCKET,
            "Key": s3_key,
        },
        ExpiresIn=3600,
    )

    return success({
        "upload_url": presigned_url,
        "s3_key": s3_key,
        "content_type": content_type,
        "metadata": metadata,
    })


def get_download_url(event, context):
    """Generate a pre-signed S3 URL for downloading a document."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    s3_key = event["pathParameters"]["key"]

    if not s3_key.startswith(f"documents/{user_id}/"):
        return error("Forbidden", 403)

    presigned_url = s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": DOCUMENTS_BUCKET,
            "Key": s3_key,
        },
        ExpiresIn=3600,
    )

    return success({"download_url": presigned_url})


def delete_document(event, context):
    """Delete a document from S3."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    s3_key = event["pathParameters"]["key"]

    if not s3_key.startswith(f"documents/{user_id}/"):
        return error("Forbidden", 403)

    s3_client.delete_object(Bucket=DOCUMENTS_BUCKET, Key=s3_key)
    return success({"message": "Document deleted"})
