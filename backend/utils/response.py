"""Standard API response builders for Lambda handlers."""

import json
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    """JSON encoder that handles DynamoDB Decimal types."""

    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
}


def success(body, status_code=200):
    """Return a successful API response.

    Args:
        body: Response body (dict or list).
        status_code: HTTP status code (default 200).

    Returns:
        API Gateway Lambda proxy response dict.
    """
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def error(message, status_code=400):
    """Return an error API response.

    Args:
        message: Error message string.
        status_code: HTTP status code (default 400).

    Returns:
        API Gateway Lambda proxy response dict.
    """
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps({"error": message}),
    }


def parse_body(event):
    """Parse the JSON body from an API Gateway event.

    Args:
        event: API Gateway Lambda proxy event.

    Returns:
        Parsed dict or empty dict if parsing fails.
    """
    try:
        body = event.get("body", "{}")
        if isinstance(body, str):
            return json.loads(body)
        return body or {}
    except (json.JSONDecodeError, TypeError):
        return {}
