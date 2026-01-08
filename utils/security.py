from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import secrets
import string
import logging
import hashlib
import os

# Setup logger
logger = logging.getLogger(__name__)

# Configure bcrypt with a workaround for the 72-byte limit
# We'll use a custom handler that pre-hashes passwords
class BcryptWithPreHash:
    """Custom bcrypt handler that pre-hashes passwords with SHA-256"""
    
    def __init__(self):
        # Create a regular CryptContext for internal use
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    def _pre_hash(self, password: str) -> str:
        """Pre-hash the password using SHA-256."""
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    def hash(self, password: str) -> str:
        """Hash a password with SHA-256 pre-hashing."""
        hashed_input = self._pre_hash(password)
        return self.pwd_context.hash(hashed_input)
    
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against a hashed password."""
        try:
            hashed_input = self._pre_hash(plain_password)
            return self.pwd_context.verify(hashed_input, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {str(e)}")
            return False

# Create our custom handler instance
bcrypt_handler = BcryptWithPreHash()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return bcrypt_handler.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Enforce length limit in our code
    if len(password) > 128:
        raise ValueError("Password must be shorter than 128 characters")
    return bcrypt_handler.hash(password)

def generate_secure_password(length: int = 16) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    # Updated limit to 128 characters matching schema
    if len(password) > 128:
        return False, "Password must be shorter than 128 characters"
        
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
    if not input_string:
        return ""
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", ';', '(', ')', '&', '|']
    for char in dangerous_chars:
        input_string = input_string.replace(char, '')
    # Trim whitespace
    input_string = input_string.strip()
    return input_string
