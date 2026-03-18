"""Lambda handlers for Service History CRUD operations."""

import uuid
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.db import SERVICE_HISTORY_TABLE, put_item, get_item, update_item, delete_item, query_by_index
from utils.auth import get_user_id
from utils.response import success, error, parse_body

from warranty_tracker.validators import validate_required_fields


def create(event, context):
    """Create a new service history record."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    body = parse_body(event)
    required = ["product_id", "service_date", "service_type", "description"]
    missing = validate_required_fields(body, required)
    if missing:
        return error(f"Missing required fields: {', '.join(missing)}")

    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "product_id": body["product_id"],
        "service_date": body["service_date"],
        "service_type": body["service_type"],
        "description": body["description"],
        "provider": body.get("provider", ""),
        "cost": body.get("cost", ""),
        "notes": body.get("notes", ""),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    put_item(SERVICE_HISTORY_TABLE, record)
    return success(record, 201)


def list(event, context):
    """List all service history records for the authenticated user."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    params = event.get("queryStringParameters") or {}
    product_id = params.get("product_id")

    if product_id:
        items = query_by_index(SERVICE_HISTORY_TABLE, "product_id-index", "product_id", product_id)
        items = [i for i in items if i.get("user_id") == user_id]
    else:
        items = query_by_index(SERVICE_HISTORY_TABLE, "user_id-index", "user_id", user_id)

    return success(items)


def get(event, context):
    """Get a single service record by ID."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    record_id = event["pathParameters"]["id"]
    item = get_item(SERVICE_HISTORY_TABLE, {"id": record_id})

    if not item:
        return error("Service record not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    return success(item)


def update(event, context):
    """Update an existing service record."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    record_id = event["pathParameters"]["id"]
    item = get_item(SERVICE_HISTORY_TABLE, {"id": record_id})

    if not item:
        return error("Service record not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    body = parse_body(event)
    allowed_fields = ["service_date", "service_type", "description",
                      "provider", "cost", "notes"]
    updates = {k: body[k] for k in allowed_fields if k in body}
    updates["updated_at"] = datetime.utcnow().isoformat()

    updated = update_item(SERVICE_HISTORY_TABLE, {"id": record_id}, updates)
    return success(updated)


def delete(event, context):
    """Delete a service record."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    record_id = event["pathParameters"]["id"]
    item = get_item(SERVICE_HISTORY_TABLE, {"id": record_id})

    if not item:
        return error("Service record not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    delete_item(SERVICE_HISTORY_TABLE, {"id": record_id})
    return success({"message": "Service record deleted"})
