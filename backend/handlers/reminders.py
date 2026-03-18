"""Lambda handler for scheduled warranty expiry checks via CloudWatch Events."""

import os

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.db import WARRANTIES_TABLE, PRODUCTS_TABLE, scan_table, get_item

from warranty_tracker import ReminderScheduler

reminder_scheduler = ReminderScheduler(threshold_days=30)


def _get_product_name(product_id):
    """Look up a product name by ID."""
    item = get_item(PRODUCTS_TABLE, {"id": product_id})
    return item.get("name", "Unknown Product") if item else "Unknown Product"


def check_expiring(event, context):
    """Scheduled function: scan all warranties, log expiring ones to CloudWatch.

    Triggered daily by CloudWatch Events.
    Logs warnings for warranties expiring within 30 days.
    """
    all_warranties = scan_table(WARRANTIES_TABLE)

    users = {}
    for w in all_warranties:
        uid = w.get("user_id")
        if uid:
            users.setdefault(uid, []).append(w)

    total_expiring = 0

    for user_id, warranties in users.items():
        expiring = reminder_scheduler.find_expiring_warranties(warranties)
        total_expiring += len(expiring)

        for w in expiring:
            product_name = _get_product_name(w.get("product_id", ""))
            w["product_name"] = product_name

            notification = reminder_scheduler.generate_notification(
                w, w.get("user_email", "")
            )

            print(f"WARNING - Expiring warranty: user={user_id}, "
                  f"product={product_name}, warranty={w.get('id')}, "
                  f"days_remaining={w.get('days_remaining')}, "
                  f"provider={w.get('provider')}, "
                  f"end_date={w.get('end_date')}")

    result = {
        "message": "Warranty expiry check completed",
        "total_warranties_scanned": len(all_warranties),
        "total_expiring": total_expiring,
    }
    print(f"Reminder check result: {result}")
    return result
