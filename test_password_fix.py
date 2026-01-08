#!/usr/bin/env python3
"""
Test script to verify password hashing works with long passwords
"""
import sys
sys.path.append('.')
from utils.security import get_password_hash, verify_password

def test_password_hashing():
    print("Testing password hashing with various lengths...")
    
    # Test 1: Short password
    short_password = "Short123!"
    print(f"\n1. Short password ({len(short_password)} chars):")
    hash1 = get_password_hash(short_password)
    print(f"   Hash: {hash1[:50]}...")
    print(f"   Verify: {verify_password(short_password, hash1)}")
    
    # Test 2: Medium password
    medium_password = "ThisIsAMediumLengthPassword123!"
    print(f"\n2. Medium password ({len(medium_password)} chars):")
    hash2 = get_password_hash(medium_password)
    print(f"   Hash: {hash2[:50]}...")
    print(f"   Verify: {verify_password(medium_password, hash2)}")
    
    # Test 3: Long password (should work now)
    long_password = "ThisIsAVeryLongPasswordThatExceedsThe72ByteLimitButShouldWorkNowBecauseWePreHashItWithSHA256BeforePassingToBcrypt123!"
    print(f"\n3. Long password ({len(long_password)} chars):")
    try:
        hash3 = get_password_hash(long_password)
        print(f"   Hash: {hash3[:50]}...")
        print(f"   Verify: {verify_password(long_password, hash3)}")
        print("   ✅ SUCCESS: Long password works!")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 4: Very long password (128 chars max)
    very_long_password = "A" * 128
    print(f"\n4. Very long password ({len(very_long_password)} chars):")
    try:
        hash4 = get_password_hash(very_long_password)
        print(f"   Hash: {hash4[:50]}...")
        print(f"   Verify: {verify_password(very_long_password, hash4)}")
        print("   ✅ SUCCESS: Very long password works!")
    except Exception as e:
        print(f"   ❌ FAILED: {e}")
    
    # Test 5: Wrong password verification
    print(f"\n5. Wrong password verification:")
    print(f"   Verify wrong: {verify_password('WrongPassword123!', hash1)}")
    print(f"   Verify correct: {verify_password(short_password, hash1)}")

if __name__ == "__main__":
    test_password_hashing()
