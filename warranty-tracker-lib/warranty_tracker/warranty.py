"""Warranty management: expiry calculation and status classification."""

from datetime import datetime, timedelta
from warranty_tracker.validators import validate_date, validate_required_fields


class WarrantyManager:
    """Manages warranty lifecycle including expiry and status tracking.

    Status classifications:
        - active:   More than 30 days until expiry
        - expiring: 30 days or fewer until expiry
        - expired:  Past the expiry date
    """

    EXPIRING_THRESHOLD_DAYS = 30
    REQUIRED_FIELDS = ["product_id", "provider", "start_date", "end_date"]

    def __init__(self):
        """Initialise the WarrantyManager."""
        self._warranties = {}

    def validate_warranty_data(self, data: dict) -> dict:
        """Validate warranty input data.

        Args:
            data: Dictionary with warranty fields.

        Returns:
            Dict with 'valid' (bool) and 'errors' (list of str).
        """
        errors = []
        missing = validate_required_fields(data, self.REQUIRED_FIELDS)
        if missing:
            errors.append(f"Missing required fields: {', '.join(missing)}")

        if data.get("start_date") and not validate_date(data["start_date"]):
            errors.append("Invalid start_date format. Use YYYY-MM-DD.")

        if data.get("end_date") and not validate_date(data["end_date"]):
            errors.append("Invalid end_date format. Use YYYY-MM-DD.")

        if (
            data.get("start_date")
            and data.get("end_date")
            and validate_date(data["start_date"])
            and validate_date(data["end_date"])
        ):
            start = datetime.strptime(data["start_date"], "%Y-%m-%d")
            end = datetime.strptime(data["end_date"], "%Y-%m-%d")
            if end <= start:
                errors.append("end_date must be after start_date.")

        return {"valid": len(errors) == 0, "errors": errors}

    def calculate_status(self, end_date: str) -> str:
        """Determine warranty status based on the end date.

        Args:
            end_date: Expiry date as YYYY-MM-DD.

        Returns:
            One of 'active', 'expiring', or 'expired'.
        """
        expiry = datetime.strptime(end_date, "%Y-%m-%d")
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        delta = (expiry - today).days

        if delta < 0:
            return "expired"
        elif delta <= self.EXPIRING_THRESHOLD_DAYS:
            return "expiring"
        else:
            return "active"

    def days_until_expiry(self, end_date: str) -> int:
        """Calculate days remaining until warranty expiry.

        Args:
            end_date: Expiry date as YYYY-MM-DD.

        Returns:
            Number of days (negative if expired).
        """
        expiry = datetime.strptime(end_date, "%Y-%m-%d")
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        return (expiry - today).days

    def calculate_warranty_duration(self, start_date: str, end_date: str) -> int:
        """Calculate total warranty duration in days.

        Args:
            start_date: Start date as YYYY-MM-DD.
            end_date: End date as YYYY-MM-DD.

        Returns:
            Total number of days.
        """
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        return (end - start).days

    def enrich_warranty(self, warranty: dict) -> dict:
        """Add computed fields (status, days_remaining) to a warranty dict.

        Args:
            warranty: Dictionary with at least 'end_date'.

        Returns:
            New dictionary with added 'status' and 'days_remaining' fields.
        """
        enriched = dict(warranty)
        end_date = warranty.get("end_date", "")
        if validate_date(end_date):
            enriched["status"] = self.calculate_status(end_date)
            enriched["days_remaining"] = self.days_until_expiry(end_date)
        else:
            enriched["status"] = "unknown"
            enriched["days_remaining"] = None
        return enriched
