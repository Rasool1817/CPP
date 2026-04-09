"""Lambda handler for seeding demo data (public, idempotent)."""

import os
import uuid
import json
import boto3
from datetime import datetime

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.db import PRODUCTS_TABLE, WARRANTIES_TABLE, SERVICE_HISTORY_TABLE, put_item, get_item
from utils.response import success, error

DEMO_EMAIL = "demo@warranty.demo"
DEMO_PASSWORD = "Demo1234!"
DEMO_NAME = "Demo User"
DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000000"

cognito = boto3.client("cognito-idp")
USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")


def _ensure_demo_user():
    """Create demo Cognito user if it does not already exist."""
    try:
        cognito.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=DEMO_EMAIL,
        )
        return  # already exists
    except cognito.exceptions.UserNotFoundException:
        pass

    cognito.admin_create_user(
        UserPoolId=USER_POOL_ID,
        Username=DEMO_EMAIL,
        UserAttributes=[
            {"Name": "email", "Value": DEMO_EMAIL},
            {"Name": "email_verified", "Value": "true"},
            {"Name": "name", "Value": DEMO_NAME},
        ],
        TemporaryPassword=DEMO_PASSWORD,
        MessageAction="SUPPRESS",
    )
    # Set the permanent password so the user can log in directly
    cognito.admin_set_user_password(
        UserPoolId=USER_POOL_ID,
        Username=DEMO_EMAIL,
        Password=DEMO_PASSWORD,
        Permanent=True,
    )


def _get_demo_sub():
    """Return the Cognito sub (user_id) for the demo user."""
    resp = cognito.admin_get_user(
        UserPoolId=USER_POOL_ID,
        Username=DEMO_EMAIL,
    )
    for attr in resp["UserAttributes"]:
        if attr["Name"] == "sub":
            return attr["Value"]
    return DEMO_USER_ID


def handler(event, context):
    """Seed demo data -- public endpoint, idempotent."""
    try:
        _ensure_demo_user()
        user_id = _get_demo_sub()
    except Exception as e:
        return error(f"Failed to create demo user: {str(e)}", 500)

    now = datetime.utcnow().isoformat()

    # Fixed IDs for idempotency
    product_ids = [
        "seed-prod-macbook-pro-001",
        "seed-prod-samsung-tv-002",
        "seed-prod-bosch-dishwasher-003",
    ]
    warranty_ids = [
        "seed-warr-macbook-001",
        "seed-warr-samsung-002",
        "seed-warr-bosch-003",
    ]

    # --- Products ---
    products = [
        {
            "id": product_ids[0],
            "user_id": user_id,
            "name": "MacBook Pro 16-inch",
            "brand": "Apple",
            "category": "Electronics",
            "model_number": "MK1E3LL/A",
            "serial_number": "C02ZW1XQMD6T",
            "purchase_date": "2025-06-15",
            "purchase_price": "2499.00",
            "retailer": "Apple Store",
            "notes": "Space Grey, M2 Max, 32GB RAM",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": product_ids[1],
            "user_id": user_id,
            "name": "Samsung QLED 65\" TV",
            "brand": "Samsung",
            "category": "Electronics",
            "model_number": "QN65Q80CAFXZA",
            "serial_number": "H4ZN900123B",
            "purchase_date": "2025-08-20",
            "purchase_price": "1299.99",
            "retailer": "Currys",
            "notes": "4K Smart TV, wall mounted in living room",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": product_ids[2],
            "user_id": user_id,
            "name": "Bosch Series 6 Dishwasher",
            "brand": "Bosch",
            "category": "Appliances",
            "model_number": "SMS6ZDW48G",
            "serial_number": "BSH7834210098",
            "purchase_date": "2025-03-10",
            "purchase_price": "749.00",
            "retailer": "Harvey Norman",
            "notes": "Freestanding, white, 14 place settings",
            "created_at": now,
            "updated_at": now,
        },
    ]

    for p in products:
        existing = get_item(PRODUCTS_TABLE, {"id": p["id"]})
        if not existing:
            put_item(PRODUCTS_TABLE, p)

    # --- Warranties ---
    warranties = [
        {
            "id": warranty_ids[0],
            "user_id": user_id,
            "product_id": product_ids[0],
            "provider": "Apple",
            "start_date": "2025-06-15",
            "end_date": "2026-06-15",
            "warranty_type": "manufacturer",
            "coverage_details": "Standard AppleCare - hardware defects and battery service",
            "document_key": "",
            "notes": "AppleCare+ eligible for upgrade",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": warranty_ids[1],
            "user_id": user_id,
            "product_id": product_ids[1],
            "provider": "Samsung",
            "start_date": "2025-08-20",
            "end_date": "2027-08-20",
            "warranty_type": "manufacturer",
            "coverage_details": "2-year manufacturer warranty - panel and electronics",
            "document_key": "",
            "notes": "Extended warranty available from Currys",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": warranty_ids[2],
            "user_id": user_id,
            "product_id": product_ids[2],
            "provider": "Bosch",
            "start_date": "2025-03-10",
            "end_date": "2027-03-10",
            "warranty_type": "manufacturer",
            "coverage_details": "2-year Bosch warranty covering parts and labour",
            "document_key": "",
            "notes": "Register at bosch-home.co.uk for extended warranty",
            "created_at": now,
            "updated_at": now,
        },
    ]

    for w in warranties:
        existing = get_item(WARRANTIES_TABLE, {"id": w["id"]})
        if not existing:
            put_item(WARRANTIES_TABLE, w)

    return success({
        "message": "Demo data seeded successfully",
        "demo_email": DEMO_EMAIL,
        "demo_password": DEMO_PASSWORD,
        "products_count": len(products),
        "warranties_count": len(warranties),
    })
