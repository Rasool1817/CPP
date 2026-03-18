"""Tests for ProductManager."""

import unittest
from warranty_tracker.product import ProductManager


class TestProductManager(unittest.TestCase):

    def setUp(self):
        self.manager = ProductManager()

    def test_validate_valid_product(self):
        data = {
            "name": "iPhone 15",
            "brand": "Apple",
            "category": "Electronics",
            "purchase_date": "2025-03-01",
        }
        result = self.manager.validate_product_data(data)
        self.assertTrue(result["valid"])

    def test_validate_missing_fields(self):
        data = {"name": "iPhone 15"}
        result = self.manager.validate_product_data(data)
        self.assertFalse(result["valid"])

    def test_validate_invalid_category(self):
        data = {
            "name": "iPhone",
            "brand": "Apple",
            "category": "InvalidCat",
            "purchase_date": "2025-01-01",
        }
        result = self.manager.validate_product_data(data)
        self.assertFalse(result["valid"])

    def test_validate_negative_price(self):
        data = {
            "name": "iPhone",
            "brand": "Apple",
            "category": "Electronics",
            "purchase_date": "2025-01-01",
            "purchase_price": -100,
        }
        result = self.manager.validate_product_data(data)
        self.assertFalse(result["valid"])

    def test_get_categories(self):
        cats = self.manager.get_categories()
        self.assertIn("Electronics", cats)
        self.assertIn("Other", cats)
        self.assertEqual(len(cats), 8)

    def test_categorize_electronics(self):
        self.assertEqual(self.manager.categorize_product("Gaming Laptop"), "Electronics")

    def test_categorize_appliances(self):
        self.assertEqual(self.manager.categorize_product("Dishwasher Pro"), "Appliances")

    def test_categorize_unknown(self):
        self.assertEqual(self.manager.categorize_product("Random Thing"), "Other")

    def test_format_summary(self):
        product = {"name": "iPhone 15", "brand": "Apple", "category": "Electronics"}
        summary = self.manager.format_product_summary(product)
        self.assertEqual(summary, "iPhone 15 by Apple [Electronics]")


if __name__ == "__main__":
    unittest.main()
