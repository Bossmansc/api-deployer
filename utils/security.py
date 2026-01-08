from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import secrets
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError:
        # Handle "password cannot be longer than 72 bytes" error from bcrypt gracefully
        return False

def get_password_hash(password: str) -> str:
    """Hash a password"""
    if len(password.encode('utf-8')) > 72:
        # Fallback check, though Pydantic should catch this first
        raise ValueError("Password too long")
    return pwd_context.hash(password)

def generate_secure_password(length: int = 16) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if len(password.encode('utf-8')) > 72:
        return False, "Password must be shorter than 72 bytes"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    if not any(c in string.punctuation for c in password):
        return False, "Password must contain at least one special character"
    return True, "Password is strong"

def generate_api_key() -> str:
    """Generate a secure API key"""
    return secrets.token_urlsafe(32)

def sanitize_input(input_string: str) -> str:
    """Basic input sanitization"""
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", ';', '(', ')', '&', '|']
    for char in dangerous_chars:
        input_string = input_string.replace(char, '')
    # Trim whitespace
    input_string = input_string.strip()
    return input_string
