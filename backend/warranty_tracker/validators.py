"""Input validation utilities for the warranty tracker system."""

import re
from datetime import datetime


ALLOWED_FILE_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]
MAX_FILE_SIZE_MB = 10


def validate_date(date_string: str) -> bool:
    """Validate that a string is a valid ISO date (YYYY-MM-DD).

    Args:
        date_string: The date string to validate.

    Returns:
        True if valid, False otherwise.
    """
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False


def validate_email(email: str) -> bool:
    """Validate an email address format.

    Args:
        email: The email string to validate.

    Returns:
        True if valid, False otherwise.
    """
    if not email or not isinstance(email, str):
        return False
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_required_fields(data: dict, required: list) -> list:
    """Check that all required fields are present and non-empty.

    Args:
        data: The dictionary to check.
        required: List of required field names.

    Returns:
        List of missing field names (empty list if all present).
    """
    missing = []
    for field in required:
        value = data.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            missing.append(field)
    return missing


def validate_file_extension(filename: str) -> bool:
    """Check if a filename has an allowed extension.

    Args:
        filename: The filename to check.

    Returns:
        True if allowed, False otherwise.
    """
    if not filename or not isinstance(filename, str):
        return False
    lower = filename.lower()
    return any(lower.endswith(ext) for ext in ALLOWED_FILE_EXTENSIONS)


def validate_file_size(size_bytes: int) -> bool:
    """Check if a file size is within the allowed limit.

    Args:
        size_bytes: File size in bytes.

    Returns:
        True if within limit, False otherwise.
    """
    if not isinstance(size_bytes, (int, float)) or size_bytes < 0:
        return False
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    return size_bytes <= max_bytes
