"""Document processing: file validation, S3 key generation, and metadata."""

import uuid
from datetime import datetime
from warranty_tracker.validators import validate_file_extension, validate_file_size


class DocumentProcessor:
    """Handles warranty document validation and storage key generation.

    Supports file types: PDF, JPG, JPEG, PNG, DOC, DOCX
    Maximum file size: 10 MB
    """

    def validate_document(self, filename: str, size_bytes: int) -> dict:
        """Validate a document file for upload.

        Args:
            filename: Original filename.
            size_bytes: File size in bytes.

        Returns:
            Dict with 'valid' (bool) and 'errors' (list of str).
        """
        errors = []

        if not validate_file_extension(filename):
            errors.append(
                f"Invalid file type. Allowed: PDF, JPG, JPEG, PNG, DOC, DOCX"
            )

        if not validate_file_size(size_bytes):
            errors.append("File size exceeds the 10 MB limit.")

        return {"valid": len(errors) == 0, "errors": errors}

    def generate_s3_key(self, user_id: str, warranty_id: str, filename: str) -> str:
        """Generate a unique S3 object key for storing a document.

        Format: documents/{user_id}/{warranty_id}/{uuid}.{ext}

        Args:
            user_id: The owner's user ID.
            warranty_id: The associated warranty ID.
            filename: Original filename (used for extension).

        Returns:
            S3 object key string.
        """
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "pdf"
        unique_id = uuid.uuid4().hex[:12]
        return f"documents/{user_id}/{warranty_id}/{unique_id}.{ext}"

    def extract_metadata(self, filename: str, size_bytes: int) -> dict:
        """Build a metadata dictionary for a document.

        Args:
            filename: Original filename.
            size_bytes: File size in bytes.

        Returns:
            Dictionary of metadata fields.
        """
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown"
        content_types = {
            "pdf": "application/pdf",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
        return {
            "original_filename": filename,
            "file_extension": ext,
            "content_type": content_types.get(ext, "application/octet-stream"),
            "size_bytes": size_bytes,
            "size_mb": round(size_bytes / (1024 * 1024), 2),
            "uploaded_at": datetime.utcnow().isoformat(),
        }

    def get_content_type(self, filename: str) -> str:
        """Determine the MIME content type from a filename.

        Args:
            filename: The filename.

        Returns:
            MIME type string.
        """
        metadata = self.extract_metadata(filename, 0)
        return metadata["content_type"]
