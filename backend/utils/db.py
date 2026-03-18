"""DynamoDB helper functions for CRUD operations."""

import os
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource("dynamodb")

PRODUCTS_TABLE = os.environ.get("PRODUCTS_TABLE", "warranty-tracker-api-products-dev")
WARRANTIES_TABLE = os.environ.get("WARRANTIES_TABLE", "warranty-tracker-api-warranties-dev")
SERVICE_HISTORY_TABLE = os.environ.get("SERVICE_HISTORY_TABLE", "warranty-tracker-api-service-history-dev")


def get_table(table_name):
    """Get a DynamoDB table resource."""
    return dynamodb.Table(table_name)


def put_item(table_name, item):
    """Insert an item into a DynamoDB table."""
    table = get_table(table_name)
    table.put_item(Item=item)
    return item


def get_item(table_name, key):
    """Get a single item by primary key."""
    table = get_table(table_name)
    response = table.get_item(Key=key)
    return response.get("Item")


def update_item(table_name, key, updates):
    """Update specific fields of an item.

    Args:
        table_name: DynamoDB table name.
        key: Primary key dict (e.g., {"id": "abc"}).
        updates: Dict of field_name: new_value.

    Returns:
        Updated item attributes.
    """
    table = get_table(table_name)
    expressions = []
    names = {}
    values = {}

    for i, (field, value) in enumerate(updates.items()):
        attr_name = f"#f{i}"
        attr_val = f":v{i}"
        expressions.append(f"{attr_name} = {attr_val}")
        names[attr_name] = field
        values[attr_val] = value

    response = table.update_item(
        Key=key,
        UpdateExpression="SET " + ", ".join(expressions),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )
    return response.get("Attributes")


def delete_item(table_name, key):
    """Delete an item by primary key."""
    table = get_table(table_name)
    table.delete_item(Key=key)


def query_by_index(table_name, index_name, key_name, key_value):
    """Query a GSI for items matching a partition key.

    Args:
        table_name: DynamoDB table name.
        index_name: Global secondary index name.
        key_name: Partition key attribute name.
        key_value: Partition key value to match.

    Returns:
        List of matching items.
    """
    table = get_table(table_name)
    response = table.query(
        IndexName=index_name,
        KeyConditionExpression=Key(key_name).eq(key_value),
    )
    return response.get("Items", [])


def scan_table(table_name):
    """Scan all items in a table (use sparingly)."""
    table = get_table(table_name)
    response = table.scan()
    items = response.get("Items", [])
    while "LastEvaluatedKey" in response:
        response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
        items.extend(response.get("Items", []))
    return items
