"""
Input sanitization utilities to prevent XSS and injection attacks.
"""

import re


def sanitize_string(value: str, max_length: int = 500) -> str:
    """Strip whitespace, remove HTML tags and null bytes, truncate to max_length."""
    value = value.strip()
    value = re.sub(r"<[^>]+>", "", value)
    value = value.replace("\x00", "")
    return value[:max_length]


def sanitize_email(email: str) -> str:
    """Lowercase, strip, and validate an email address."""
    email = email.lower().strip()
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise ValueError("Invalid email format")
    return email
