"""Tests for WarrantyManager."""

import unittest
from datetime import datetime, timedelta
from warranty_tracker.warranty import WarrantyManager


class TestWarrantyManager(unittest.TestCase):

    def setUp(self):
        self.manager = WarrantyManager()

    def test_validate_valid_warranty(self):
        data = {
            "product_id": "p1",
            "provider": "Samsung",
            "start_date": "2025-01-01",
            "end_date": "2026-01-01",
        }
        result = self.manager.validate_warranty_data(data)
        self.assertTrue(result["valid"])
        self.assertEqual(result["errors"], [])

    def test_validate_missing_fields(self):
        data = {"product_id": "p1"}
        result = self.manager.validate_warranty_data(data)
        self.assertFalse(result["valid"])
        self.assertTrue(any("Missing" in e for e in result["errors"]))

    def test_validate_invalid_dates(self):
        data = {
            "product_id": "p1",
            "provider": "Samsung",
            "start_date": "not-a-date",
            "end_date": "2026-01-01",
        }
        result = self.manager.validate_warranty_data(data)
        self.assertFalse(result["valid"])

    def test_validate_end_before_start(self):
        data = {
            "product_id": "p1",
            "provider": "Samsung",
            "start_date": "2026-06-01",
            "end_date": "2025-01-01",
        }
        result = self.manager.validate_warranty_data(data)
        self.assertFalse(result["valid"])
        self.assertTrue(any("after" in e for e in result["errors"]))

    def test_status_active(self):
        future = (datetime.utcnow() + timedelta(days=60)).strftime("%Y-%m-%d")
        self.assertEqual(self.manager.calculate_status(future), "active")

    def test_status_expiring(self):
        soon = (datetime.utcnow() + timedelta(days=15)).strftime("%Y-%m-%d")
        self.assertEqual(self.manager.calculate_status(soon), "expiring")

    def test_status_expired(self):
        past = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")
        self.assertEqual(self.manager.calculate_status(past), "expired")

    def test_days_until_expiry(self):
        future = (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d")
        days = self.manager.days_until_expiry(future)
        self.assertIn(days, [9, 10])

    def test_warranty_duration(self):
        days = self.manager.calculate_warranty_duration("2025-01-01", "2026-01-01")
        self.assertEqual(days, 365)

    def test_enrich_warranty(self):
        future = (datetime.utcnow() + timedelta(days=60)).strftime("%Y-%m-%d")
        warranty = {"id": "w1", "end_date": future}
        enriched = self.manager.enrich_warranty(warranty)
        self.assertEqual(enriched["status"], "active")
        self.assertIn("days_remaining", enriched)


if __name__ == "__main__":
    unittest.main()
