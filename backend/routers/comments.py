"""
评论相关 API 路由
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Comment
from schemas import CommentCreate, CommentResponse, MessageResponse

router = APIRouter(prefix="/projects/{project_id}/comments", tags=["评论"])


@router.get("", response_model=list[CommentResponse])
async def get_comments(project_id: str, db: Session = Depends(get_db)):
    """获取项目的所有评论"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    comments = db.query(Comment).filter(
        Comment.project_id == project_id
    ).order_by(Comment.created_at.desc()).all()
    
    return [CommentResponse.from_orm_model(c) for c in comments]


@router.post("", response_model=CommentResponse)
async def create_comment(
    project_id: str,
    comment_data: CommentCreate,
    db: Session = Depends(get_db)
):
    """发表评论"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    comment = Comment(
        project_id=project_id,
        author_name=comment_data.author_name,
        author_avatar=f"https://picsum.photos/seed/{comment_data.author_name}/100/100",
        content=comment_data.content
    )
    
    db.add(comment)
    
    # 更新项目的评论计数
    project.comments_count += 1
    
    db.commit()
    db.refresh(comment)
    
    return CommentResponse.from_orm_model(comment)


@router.delete("/{comment_id}", response_model=MessageResponse)
async def delete_comment(
    project_id: str,
    comment_id: str,
    db: Session = Depends(get_db)
):
    """删除评论"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.project_id == project_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    
    # 更新项目的评论计数
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.comments_count = max(0, project.comments_count - 1)
    
    db.delete(comment)
    db.commit()
    
    return MessageResponse(message="评论已删除")
