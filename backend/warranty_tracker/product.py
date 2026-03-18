"""Product management: validation and categorization."""

from warranty_tracker.validators import validate_required_fields


class ProductManager:
    """Handles product validation and categorization.

    Supported categories:
        Electronics, Appliances, Furniture, Automotive,
        Sports & Outdoors, Tools, Clothing, Other
    """

    CATEGORIES = [
        "Electronics",
        "Appliances",
        "Furniture",
        "Automotive",
        "Sports & Outdoors",
        "Tools",
        "Clothing",
        "Other",
    ]

    REQUIRED_FIELDS = ["name", "brand", "category", "purchase_date"]

    def validate_product_data(self, data: dict) -> dict:
        """Validate product input data.

        Args:
            data: Dictionary with product fields.

        Returns:
            Dict with 'valid' (bool) and 'errors' (list of str).
        """
        errors = []
        missing = validate_required_fields(data, self.REQUIRED_FIELDS)
        if missing:
            errors.append(f"Missing required fields: {', '.join(missing)}")

        category = data.get("category", "")
        if category and category not in self.CATEGORIES:
            errors.append(
                f"Invalid category '{category}'. Must be one of: {', '.join(self.CATEGORIES)}"
            )

        price = data.get("purchase_price")
        if price is not None:
            try:
                price_val = float(price)
                if price_val < 0:
                    errors.append("purchase_price cannot be negative.")
            except (ValueError, TypeError):
                errors.append("purchase_price must be a number.")

        return {"valid": len(errors) == 0, "errors": errors}

    def get_categories(self) -> list:
        """Return the list of valid product categories.

        Returns:
            List of category strings.
        """
        return list(self.CATEGORIES)

    def categorize_product(self, name: str) -> str:
        """Suggest a category based on product name keywords.

        Args:
            name: The product name.

        Returns:
            Suggested category string.
        """
        lower = name.lower()
        keyword_map = {
            "Electronics": ["phone", "laptop", "tablet", "tv", "camera", "headphone", "speaker", "monitor", "computer"],
            "Appliances": ["fridge", "washer", "dryer", "oven", "microwave", "dishwasher", "vacuum", "blender"],
            "Furniture": ["desk", "chair", "table", "sofa", "bed", "shelf", "cabinet", "couch"],
            "Automotive": ["car", "tire", "battery", "engine", "brake", "motor"],
            "Sports & Outdoors": ["bike", "tent", "racket", "golf", "ski", "kayak"],
            "Tools": ["drill", "saw", "hammer", "wrench", "screwdriver"],
            "Clothing": ["jacket", "shoe", "boot", "coat", "watch"],
        }
        for category, keywords in keyword_map.items():
            if any(kw in lower for kw in keywords):
                return category
        return "Other"

    def format_product_summary(self, product: dict) -> str:
        """Create a one-line summary string for a product.

        Args:
            product: Dictionary with product fields.

        Returns:
            Formatted summary string.
        """
        name = product.get("name", "Unknown")
        brand = product.get("brand", "Unknown")
        category = product.get("category", "Uncategorized")
        return f"{name} by {brand} [{category}]"
