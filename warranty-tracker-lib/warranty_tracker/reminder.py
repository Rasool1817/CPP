"""Reminder scheduling: detect expiring warranties and generate notifications."""

from datetime import datetime
from warranty_tracker.warranty import WarrantyManager


class ReminderScheduler:
    """Scans warranties and produces email notification payloads.

    Generates reminders for warranties expiring within the configured threshold.
    """

    def __init__(self, threshold_days: int = 30):
        """Initialise the ReminderScheduler.

        Args:
            threshold_days: Number of days before expiry to trigger a reminder.
        """
        self.threshold_days = threshold_days
        self._warranty_manager = WarrantyManager()

    def find_expiring_warranties(self, warranties: list) -> list:
        """Filter warranties that are expiring within the threshold.

        Args:
            warranties: List of warranty dicts with 'end_date' fields.

        Returns:
            List of warranty dicts that are 'expiring' status.
        """
        expiring = []
        for warranty in warranties:
            end_date = warranty.get("end_date", "")
            try:
                days = self._warranty_manager.days_until_expiry(end_date)
                if 0 <= days <= self.threshold_days:
                    enriched = dict(warranty)
                    enriched["days_remaining"] = days
                    expiring.append(enriched)
            except (ValueError, TypeError):
                continue
        return expiring

    def generate_notification(self, warranty: dict, user_email: str) -> dict:
        """Build an email notification payload for an expiring warranty.

        Args:
            warranty: Warranty dict with product and expiry info.
            user_email: Recipient email address.

        Returns:
            Dict with 'to', 'subject', and 'body' fields.
        """
        product_name = warranty.get("product_name", "your product")
        provider = warranty.get("provider", "the provider")
        end_date = warranty.get("end_date", "N/A")
        days_remaining = warranty.get(
            "days_remaining",
            self._warranty_manager.days_until_expiry(end_date)
            if end_date != "N/A"
            else "N/A",
        )

        subject = f"Warranty Expiring Soon: {product_name}"
        body = (
            f"Hello,\n\n"
            f"This is a reminder that the warranty for your product "
            f'"{product_name}" (provided by {provider}) '
            f"is expiring on {end_date}.\n\n"
            f"Days remaining: {days_remaining}\n\n"
            f"Please take any necessary action before the warranty expires.\n\n"
            f"Regards,\n"
            f"Warranty Tracker"
        )

        return {
            "to": user_email,
            "subject": subject,
            "body": body,
        }

    def generate_batch_notifications(
        self, warranties: list, user_email: str
    ) -> list:
        """Generate notifications for all expiring warranties.

        Args:
            warranties: List of all warranty dicts.
            user_email: Recipient email address.

        Returns:
            List of notification dicts.
        """
        expiring = self.find_expiring_warranties(warranties)
        return [self.generate_notification(w, user_email) for w in expiring]
