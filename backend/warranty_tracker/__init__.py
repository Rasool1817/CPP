"""
warranty_tracker - A library for managing product warranties, documents, and reminders.

Classes:
    WarrantyManager  - Warranty expiry calculation and status classification
    ProductManager   - Product validation and categorization
    DocumentProcessor - File validation and S3 key generation
    ReminderScheduler - Expiring warranty detection and notification generation
"""

from warranty_tracker.warranty import WarrantyManager
from warranty_tracker.product import ProductManager
from warranty_tracker.document import DocumentProcessor
from warranty_tracker.reminder import ReminderScheduler
from warranty_tracker.validators import (
    validate_date,
    validate_email,
    validate_required_fields,
    validate_file_extension,
    validate_file_size,
)

__version__ = "1.0.0"
__all__ = [
    "WarrantyManager",
    "ProductManager",
    "DocumentProcessor",
    "ReminderScheduler",
    "validate_date",
    "validate_email",
    "validate_required_fields",
    "validate_file_extension",
    "validate_file_size",
]
