from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime
from typing import Optional, List
import enum


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"


class ProjectBase(BaseModel):
    name: str
    github_url: HttpUrl


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    status: ProjectStatus
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProjectWithDeployments(Project):
    deployments: List["Deployment"] = []


class DeploymentStatus(str, enum.Enum):
    PENDING = "pending"
    BUILDING = "building"
    DEPLOYING = "deploying"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class DeploymentBase(BaseModel):
    pass


class DeploymentCreate(DeploymentBase):
    pass


class Deployment(DeploymentBase):
    id: int
    project_id: int
    status: DeploymentStatus
    logs: str
    started_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class RefreshTokenCreate(BaseModel):
    refresh_token: str


class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    version: str
