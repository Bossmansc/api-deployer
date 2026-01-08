from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.types import TypeDecorator
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, validates
import enum
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    projects = relationship("Project", back_populates="owner")
    refresh_tokens = relationship("RefreshToken", back_populates="user")

class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"

class DeploymentStatus(str, enum.Enum):
    PENDING = "pending"
    BUILDING = "building"
    DEPLOYING = "deploying"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Custom TypeDecorator to handle Enum value mapping
class ProjectStatusType(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if isinstance(value, ProjectStatus):
            return value.value
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return ProjectStatus(value)
        return value

class DeploymentStatusType(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if isinstance(value, DeploymentStatus):
            return value.value
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return DeploymentStatus(value)
        return value

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    github_url = Column(String, nullable=False)
    status = Column(ProjectStatusType, default=ProjectStatus.ACTIVE)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="projects")
    deployments = relationship("Deployment", back_populates="project")
    
    @validates('github_url')
    def validate_github_url(self, key, value):
        """Convert HttpUrl to string before storing in database"""
        if hasattr(value, '__str__'):
            return str(value)
        return value
    
    @validates('status')
    def validate_status(self, key, value):
        """Ensure status is a valid ProjectStatus enum value"""
        if isinstance(value, str):
            try:
                return ProjectStatus(value.lower())
            except ValueError:
                return ProjectStatus.ACTIVE
        elif isinstance(value, ProjectStatus):
            return value
        else:
            return ProjectStatus.ACTIVE

class Deployment(Base):
    __tablename__ = "deployments"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    status = Column(DeploymentStatusType, default=DeploymentStatus.PENDING)
    logs = Column(Text, default="")
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    project = relationship("Project", back_populates="deployments")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="refresh_tokens")
