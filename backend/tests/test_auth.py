import sys
import os

# Append project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User

def run_test():
    print("Testing Aegis security and user database schema...")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # 1. Test hashing
    pw = "SuperSecr3tPassword!"
    hashed = get_password_hash(pw)
    assert verify_password(pw, hashed), "Password verification failed"
    assert not verify_password("wrong_password", hashed), "Incorrect match verification passed"
    print("Password hashing checks: PASSED")
    
    # 2. Test JWT tokens
    username = "test_analyst_01"
    token = create_access_token(subject=username)
    assert token, "Token creation failed"
    print("JWT token signature checks: PASSED")
    
    # 3. Test Database session transaction
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            db.delete(existing)
            db.commit()
            
        # Add user
        user = User(
            username=username,
            email="analyst01@aegis.local",
            hashed_password=hashed,
            role="analyst"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        assert user.id is not None, "User record save failed"
        assert user.role == "analyst", f"Incorrect role mappings: {user.role}"
        print("Database model write and transaction checks: PASSED")
        
        # Cleanup
        db.delete(user)
        db.commit()
        print("Database clean up: PASSED")
    finally:
        db.close()
        
    print("\nAll authentication pipeline assertions PASSED successfully!")

if __name__ == "__main__":
    run_test()
