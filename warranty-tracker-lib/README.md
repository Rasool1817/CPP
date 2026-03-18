# warranty-tracker-nci

A Python library for managing product warranties, documents, and expiry reminders. Built for the Digital Warranty & Product Tracker cloud application.

## Features

- **WarrantyManager** - Warranty expiry calculation, status classification (active/expiring/expired), and enrichment of warranty data.
- **ProductManager** - Product validation and categorization with support for multiple product categories.
- **DocumentProcessor** - File type validation, file size validation, and S3 key generation for warranty documents.
- **ReminderScheduler** - Finds expiring warranties within a configurable threshold and generates notification data.
- **Validators** - Utility functions for validating dates, required fields, file extensions, and file sizes.

## Installation

```bash
pip install warranty-tracker-nci
```

## Usage

```python
from warranty_tracker import WarrantyManager, ProductManager, DocumentProcessor, ReminderScheduler

# Check warranty status
wm = WarrantyManager()
status = wm.calculate_status("2024-01-01", "2025-12-31")

# Validate a product
pm = ProductManager()
is_valid = pm.validate_product({"name": "MacBook", "brand": "Apple", "category": "Electronics", "purchase_date": "2024-01-01"})

# Generate S3 key for document
dp = DocumentProcessor()
key = dp.generate_s3_key("user123", "warranty456", "receipt.pdf")

# Find expiring warranties
rs = ReminderScheduler(threshold_days=30)
expiring = rs.find_expiring_warranties(warranties_list)
```

## Author

Rasool Basha Durbesula (24205478) - NCI Cloud Platform Programming
