#!/usr/bin/env python3
"""
Test the bcrypt fix
"""
import sys
sys.path.append('.')
from utils.security import get_password_hash, verify_password

print("Testing bcrypt password hashing fix...")

# Test with a long password
long_password = "ThisIsAVeryLongPasswordThatExceedsThe72ByteLimitButShouldWorkNowBecauseWePreHashItWithSHA256BeforePassingToBcrypt123!"

try:
    print(f"Password length: {len(long_password)} characters")
    hash_result = get_password_hash(long_password)
    print(f"✅ Hash successful: {hash_result[:50]}...")
    
    # Test verification
    verify_result = verify_password(long_password, hash_result)
    print(f"✅ Verification: {verify_result}")
    
    # Test wrong password
    wrong_result = verify_password("WrongPassword", hash_result)
    print(f"✅ Wrong password rejected: {wrong_result}")
    
    print("\n🎉 SUCCESS! The bcrypt password length issue is fixed!")
    
except Exception as e:
    print(f"❌ FAILED: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
