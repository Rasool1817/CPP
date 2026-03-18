"""Lambda handlers for Warranties CRUD operations."""

import uuid
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.db import WARRANTIES_TABLE, put_item, get_item, update_item, delete_item, query_by_index
from utils.auth import get_user_id
from utils.response import success, error, parse_body

from warranty_tracker import WarrantyManager

warranty_manager = WarrantyManager()


def create(event, context):
    """Create a new warranty."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    body = parse_body(event)

    validation = warranty_manager.validate_warranty_data(body)
    if not validation["valid"]:
        return error("; ".join(validation["errors"]))

    warranty = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "product_id": body["product_id"],
        "provider": body["provider"],
        "start_date": body["start_date"],
        "end_date": body["end_date"],
        "warranty_type": body.get("warranty_type", "manufacturer"),
        "coverage_details": body.get("coverage_details", ""),
        "document_key": body.get("document_key", ""),
        "notes": body.get("notes", ""),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    put_item(WARRANTIES_TABLE, warranty)

    enriched = warranty_manager.enrich_warranty(warranty)
    return success(enriched, 201)


def list(event, context):
    """List all warranties for the authenticated user."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    items = query_by_index(WARRANTIES_TABLE, "user_id-index", "user_id", user_id)

    enriched = [warranty_manager.enrich_warranty(w) for w in items]
    return success(enriched)


def get(event, context):
    """Get a single warranty by ID."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    warranty_id = event["pathParameters"]["id"]
    item = get_item(WARRANTIES_TABLE, {"id": warranty_id})

    if not item:
        return error("Warranty not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    enriched = warranty_manager.enrich_warranty(item)
    return success(enriched)


def update(event, context):
    """Update an existing warranty."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    warranty_id = event["pathParameters"]["id"]
    item = get_item(WARRANTIES_TABLE, {"id": warranty_id})

    if not item:
        return error("Warranty not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    body = parse_body(event)
    allowed_fields = ["provider", "start_date", "end_date", "warranty_type",
                      "coverage_details", "document_key", "notes"]
    updates = {k: body[k] for k in allowed_fields if k in body}
    updates["updated_at"] = datetime.utcnow().isoformat()

    updated = update_item(WARRANTIES_TABLE, {"id": warranty_id}, updates)
    enriched = warranty_manager.enrich_warranty(updated)
    return success(enriched)


def delete(event, context):
    """Delete a warranty."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    warranty_id = event["pathParameters"]["id"]
    item = get_item(WARRANTIES_TABLE, {"id": warranty_id})

    if not item:
        return error("Warranty not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    delete_item(WARRANTIES_TABLE, {"id": warranty_id})
    return success({"message": "Warranty deleted"})
