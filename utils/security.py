import bcrypt
import hashlib
import secrets
import string
import logging
from typing import Optional, Tuple

# Setup logger
logger = logging.getLogger(__name__)

def _pre_hash(password: str) -> bytes:
    """
    Pre-hash the password using SHA-256.
    This converts any password length into a fixed 64-character hex string,
    which fits perfectly within Bcrypt's 72-byte limit.
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest().encode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    try:
        # Convert hashed_password from string to bytes if needed
        if isinstance(hashed_password, str):
            hashed_password_bytes = hashed_password.encode('utf-8')
        else:
            hashed_password_bytes = hashed_password

        # 1. Try verifying with pre-hashing (Current Standard)
        # This handles new accounts created after the fix
        try:
            hashed_input = _pre_hash(plain_password)
            if bcrypt.checkpw(hashed_input, hashed_password_bytes):
                return True
        except Exception:
            pass

        # 2. Try verifying without pre-hashing (Legacy Support)
        # This handles old accounts created before the fix
        try:
            # Only attempt raw check if length is safe for bcrypt (72 bytes)
            if len(plain_password.encode('utf-8')) <= 72:
                if bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password_bytes):
                    return True
        except Exception:
            pass
            
        return False
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Enforce length limit in our code
    if len(password) > 128:
        raise ValueError("Password must be shorter than 128 characters")
    
    # 1. Pre-hash with SHA-256 to bypass length limit
    hashed_input = _pre_hash(password)
    
    # 2. Salt and hash with Bcrypt directly
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(hashed_input, salt)
    
    # Return as string
    return hashed.decode('utf-8')

def generate_secure_password(length: int = 16) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
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
    dangerous_chars = ['<', '>', '"', "'", ';', '(', ')', '&', '|']
    for char in dangerous_chars:
        input_string = input_string.replace(char, '')
    return input_string.strip()
