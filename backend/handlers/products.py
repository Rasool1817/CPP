"""Lambda handlers for Products CRUD operations."""

import uuid
from datetime import datetime

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from utils.db import PRODUCTS_TABLE, put_item, get_item, update_item, delete_item, query_by_index
from utils.auth import get_user_id
from utils.response import success, error, parse_body

from warranty_tracker import ProductManager

product_manager = ProductManager()


def create(event, context):
    """Create a new product."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    body = parse_body(event)
    body["user_id"] = user_id

    validation = product_manager.validate_product_data(body)
    if not validation["valid"]:
        return error("; ".join(validation["errors"]))

    product = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": body["name"],
        "brand": body["brand"],
        "category": body["category"],
        "model_number": body.get("model_number", ""),
        "serial_number": body.get("serial_number", ""),
        "purchase_date": body["purchase_date"],
        "purchase_price": body.get("purchase_price", ""),
        "retailer": body.get("retailer", ""),
        "notes": body.get("notes", ""),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }

    put_item(PRODUCTS_TABLE, product)
    return success(product, 201)


def list(event, context):
    """List all products for the authenticated user."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    items = query_by_index(PRODUCTS_TABLE, "user_id-index", "user_id", user_id)
    return success(items)


def get(event, context):
    """Get a single product by ID."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    product_id = event["pathParameters"]["id"]
    item = get_item(PRODUCTS_TABLE, {"id": product_id})

    if not item:
        return error("Product not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    return success(item)


def update(event, context):
    """Update an existing product."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    product_id = event["pathParameters"]["id"]
    item = get_item(PRODUCTS_TABLE, {"id": product_id})

    if not item:
        return error("Product not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    body = parse_body(event)
    allowed_fields = ["name", "brand", "category", "model_number", "serial_number",
                      "purchase_date", "purchase_price", "retailer", "notes"]
    updates = {k: body[k] for k in allowed_fields if k in body}
    updates["updated_at"] = datetime.utcnow().isoformat()

    updated = update_item(PRODUCTS_TABLE, {"id": product_id}, updates)
    return success(updated)


def delete(event, context):
    """Delete a product."""
    user_id = get_user_id(event)
    if not user_id:
        return error("Unauthorized", 401)

    product_id = event["pathParameters"]["id"]
    item = get_item(PRODUCTS_TABLE, {"id": product_id})

    if not item:
        return error("Product not found", 404)
    if item.get("user_id") != user_id:
        return error("Forbidden", 403)

    delete_item(PRODUCTS_TABLE, {"id": product_id})
    return success({"message": "Product deleted"})
