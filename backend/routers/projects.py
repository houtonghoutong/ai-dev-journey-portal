"""
项目相关 API 路由
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models import Project, Like
from schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    LikeToggleRequest, LikeResponse, MessageResponse
)

router = APIRouter(prefix="/projects", tags=["项目"])


@router.get("", response_model=list[ProjectResponse])
async def get_all_projects(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取所有项目列表，支持按分类筛选"""
    query = db.query(Project)
    
    if category and category != "All":
        query = query.filter(Project.category == category)
    
    projects = query.order_by(Project.created_at.desc()).all()
    return [ProjectResponse.from_orm_model(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """获取单个项目详情"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    return ProjectResponse.from_orm_model(project)


@router.post("", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db)
):
    """创建新项目"""
    project = Project(
        title=project_data.title,
        category=project_data.category,
        short_description=project_data.short_description,
        full_description=project_data.full_description,
        background_story=project_data.background_story,
        usage_instructions=project_data.usage_instructions,
        thumbnail_url=project_data.thumbnail_url,
        banner_url=project_data.banner_url,
        external_link=project_data.external_link,
        tags=project_data.tags
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return ProjectResponse.from_orm_model(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """更新项目信息"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 只更新提供的字段
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return ProjectResponse.from_orm_model(project)


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    """删除项目"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    db.delete(project)
    db.commit()
    
    return MessageResponse(message="项目已删除")


@router.post("/{project_id}/like", response_model=LikeResponse)
async def toggle_like(
    project_id: str,
    request: LikeToggleRequest,
    x_user_identifier: str = Header(default="anonymous", alias="X-User-Identifier"),
    db: Session = Depends(get_db)
):
    """
    切换点赞状态
    使用 X-User-Identifier 头部来标识用户（可以是 session ID、IP 等）
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    # 检查是否已点赞
    existing_like = db.query(Like).filter(
        Like.project_id == project_id,
        Like.user_identifier == x_user_identifier
    ).first()
    
    if request.is_liking:
        # 点赞
        if not existing_like:
            new_like = Like(project_id=project_id, user_identifier=x_user_identifier)
            db.add(new_like)
            project.likes_count += 1
            db.commit()
        is_liked = True
    else:
        # 取消点赞
        if existing_like:
            db.delete(existing_like)
            project.likes_count = max(0, project.likes_count - 1)
            db.commit()
        is_liked = False
    
    return LikeResponse(newLikesCount=project.likes_count, isLiked=is_liked)
