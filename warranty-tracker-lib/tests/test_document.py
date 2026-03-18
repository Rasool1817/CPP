"""Tests for DocumentProcessor and validators."""

import unittest
from warranty_tracker.document import DocumentProcessor
from warranty_tracker.validators import (
    validate_date,
    validate_email,
    validate_file_extension,
    validate_file_size,
)


class TestDocumentProcessor(unittest.TestCase):

    def setUp(self):
        self.processor = DocumentProcessor()

    def test_validate_valid_document(self):
        result = self.processor.validate_document("receipt.pdf", 1024 * 1024)
        self.assertTrue(result["valid"])

    def test_validate_invalid_extension(self):
        result = self.processor.validate_document("virus.exe", 1024)
        self.assertFalse(result["valid"])

    def test_validate_oversized_file(self):
        result = self.processor.validate_document("big.pdf", 20 * 1024 * 1024)
        self.assertFalse(result["valid"])

    def test_generate_s3_key(self):
        key = self.processor.generate_s3_key("user1", "warranty1", "receipt.pdf")
        self.assertTrue(key.startswith("documents/user1/warranty1/"))
        self.assertTrue(key.endswith(".pdf"))

    def test_extract_metadata(self):
        meta = self.processor.extract_metadata("receipt.pdf", 2048)
        self.assertEqual(meta["original_filename"], "receipt.pdf")
        self.assertEqual(meta["file_extension"], "pdf")
        self.assertEqual(meta["content_type"], "application/pdf")
        self.assertEqual(meta["size_bytes"], 2048)

    def test_get_content_type_jpg(self):
        ct = self.processor.get_content_type("photo.jpg")
        self.assertEqual(ct, "image/jpeg")


class TestValidators(unittest.TestCase):

    def test_valid_date(self):
        self.assertTrue(validate_date("2025-01-15"))

    def test_invalid_date(self):
        self.assertFalse(validate_date("15-01-2025"))
        self.assertFalse(validate_date("not-a-date"))
        self.assertFalse(validate_date(None))

    def test_valid_email(self):
        self.assertTrue(validate_email("user@example.com"))

    def test_invalid_email(self):
        self.assertFalse(validate_email("not-an-email"))
        self.assertFalse(validate_email(""))
        self.assertFalse(validate_email(None))

    def test_valid_extension(self):
        self.assertTrue(validate_file_extension("doc.pdf"))
        self.assertTrue(validate_file_extension("photo.PNG"))

    def test_invalid_extension(self):
        self.assertFalse(validate_file_extension("script.exe"))
        self.assertFalse(validate_file_extension(""))

    def test_valid_file_size(self):
        self.assertTrue(validate_file_size(5 * 1024 * 1024))

    def test_invalid_file_size(self):
        self.assertFalse(validate_file_size(15 * 1024 * 1024))
        self.assertFalse(validate_file_size(-1))


if __name__ == "__main__":
    unittest.main()
