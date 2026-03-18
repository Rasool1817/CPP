"""Tests for ReminderScheduler."""

import unittest
from datetime import datetime, timedelta
from warranty_tracker.reminder import ReminderScheduler


class TestReminderScheduler(unittest.TestCase):

    def setUp(self):
        self.scheduler = ReminderScheduler(threshold_days=30)

    def test_find_expiring_warranties(self):
        soon = (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d")
        far = (datetime.utcnow() + timedelta(days=60)).strftime("%Y-%m-%d")
        past = (datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")
        warranties = [
            {"id": "w1", "end_date": soon},
            {"id": "w2", "end_date": far},
            {"id": "w3", "end_date": past},
        ]
        result = self.scheduler.find_expiring_warranties(warranties)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "w1")

    def test_find_expiring_empty_list(self):
        result = self.scheduler.find_expiring_warranties([])
        self.assertEqual(result, [])

    def test_find_expiring_with_invalid_dates(self):
        warranties = [
            {"id": "w1", "end_date": "not-a-date"},
            {"id": "w2", "end_date": ""},
        ]
        result = self.scheduler.find_expiring_warranties(warranties)
        self.assertEqual(result, [])

    def test_generate_notification(self):
        warranty = {
            "product_name": "iPhone 15",
            "provider": "Apple",
            "end_date": "2026-04-01",
            "days_remaining": 15,
        }
        notification = self.scheduler.generate_notification(warranty, "user@example.com")
        self.assertEqual(notification["to"], "user@example.com")
        self.assertIn("iPhone 15", notification["subject"])
        self.assertIn("Apple", notification["body"])
        self.assertIn("15", notification["body"])

    def test_generate_notification_defaults(self):
        warranty = {"end_date": "2026-04-01", "days_remaining": 10}
        notification = self.scheduler.generate_notification(warranty, "test@test.com")
        self.assertIn("your product", notification["subject"])
        self.assertEqual(notification["to"], "test@test.com")

    def test_generate_batch_notifications(self):
        soon = (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d")
        far = (datetime.utcnow() + timedelta(days=60)).strftime("%Y-%m-%d")
        warranties = [
            {"id": "w1", "end_date": soon, "provider": "Samsung", "product_name": "TV"},
            {"id": "w2", "end_date": far, "provider": "LG"},
        ]
        notifications = self.scheduler.generate_batch_notifications(warranties, "user@test.com")
        self.assertEqual(len(notifications), 1)
        self.assertIn("TV", notifications[0]["subject"])

    def test_custom_threshold(self):
        scheduler = ReminderScheduler(threshold_days=7)
        day_10 = (datetime.utcnow() + timedelta(days=10)).strftime("%Y-%m-%d")
        day_5 = (datetime.utcnow() + timedelta(days=5)).strftime("%Y-%m-%d")
        warranties = [
            {"id": "w1", "end_date": day_10},
            {"id": "w2", "end_date": day_5},
        ]
        result = scheduler.find_expiring_warranties(warranties)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "w2")

    def test_days_remaining_in_expiring(self):
        soon = (datetime.utcnow() + timedelta(days=15)).strftime("%Y-%m-%d")
        warranties = [{"id": "w1", "end_date": soon}]
        result = self.scheduler.find_expiring_warranties(warranties)
        self.assertEqual(len(result), 1)
        self.assertIn("days_remaining", result[0])
        self.assertIn(result[0]["days_remaining"], [14, 15])


if __name__ == "__main__":
    unittest.main()
