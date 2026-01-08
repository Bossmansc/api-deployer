from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Project, User, ProjectStatus
from schemas import ProjectCreate, Project as ProjectSchema, ProjectWithDeployments
from dependencies import get_current_user
from utils.validation import validator

router = APIRouter(prefix="/projects", tags=["projects"])

@router.get("/", response_model=List[ProjectSchema])
def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(
        Project.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate project name
    is_valid_name, name_error = validator.validate_project_name(project.name)
    if not is_valid_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=name_error
        )

    # Validate GitHub URL specifically (Pydantic only checks format, we check domain)
    is_valid_url, url_error = validator.validate_github_url(str(project.github_url))
    if not is_valid_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=url_error
        )

    db_project = Project(
        name=project.name,
        github_url=str(project.github_url),
        user_id=current_user.id,
        status=ProjectStatus.ACTIVE 
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=ProjectWithDeployments)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_update: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Validate updates
    if project_update.name != project.name:
        is_valid_name, name_error = validator.validate_project_name(project_update.name)
        if not is_valid_name:
            raise HTTPException(status_code=400, detail=name_error)
            
    if str(project_update.github_url) != project.github_url:
        is_valid_url, url_error = validator.validate_github_url(str(project_update.github_url))
        if not is_valid_url:
            raise HTTPException(status_code=400, detail=url_error)

    project.name = project_update.name
    project.github_url = str(project_update.github_url)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    db.delete(project)
    db.commit()
    return None
