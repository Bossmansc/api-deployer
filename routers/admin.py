from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from database import get_db
from models import User, Project, Deployment
from schemas import User as UserSchema, Project as ProjectSchema, Deployment as DeploymentSchema
from dependencies import get_current_user
from config import settings

router = APIRouter(prefix="/admin", tags=["admin"])

def require_admin(current_user: User = Depends(get_current_user)):
    """Check if user is admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/users", response_model=List[UserSchema])
def list_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# ... Rest of admin router logic follows standard patterns ...
