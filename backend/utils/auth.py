"""Cognito authentication helpers for extracting user info from JWT tokens."""


def get_user_id(event):
    """Extract the Cognito user ID (sub) from the API Gateway event.

    Args:
        event: API Gateway Lambda proxy event.

    Returns:
        User ID string or None.
    """
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        return claims.get("sub")
    except (KeyError, TypeError):
        return None


def get_user_email(event):
    """Extract the user's email from the Cognito claims.

    Args:
        event: API Gateway Lambda proxy event.

    Returns:
        Email string or None.
    """
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        return claims.get("email")
    except (KeyError, TypeError):
        return None


def get_user_name(event):
    """Extract the user's name from the Cognito claims.

    Args:
        event: API Gateway Lambda proxy event.

    Returns:
        Name string or None.
    """
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        return claims.get("name", claims.get("cognito:username"))
    except (KeyError, TypeError):
        return None
