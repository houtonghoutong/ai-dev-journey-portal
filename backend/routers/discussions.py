"""
社区讨论 API 路由
提供讨论帖子的增删改查功能
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional

from database import SessionLocal
from models import Discussion, Reply
from schemas import (
    DiscussionCreate, DiscussionResponse,
    ReplyCreate, ReplyResponse,
    MessageResponse
)

router = APIRouter(prefix="/discussions", tags=["discussions"])


def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== 讨论帖子 API ====================

@router.get("", response_model=list[DiscussionResponse])
async def get_discussions(
    category: Optional[str] = Query(None, description="分类筛选"),
    sort: str = Query("latest", description="排序方式: latest, popular, active"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """获取讨论列表"""
    query = db.query(Discussion)
    
    # 分类筛选
    if category:
        query = query.filter(Discussion.category == category)
    
    # 排序
    if sort == "popular":
        query = query.order_by(desc(Discussion.is_pinned), desc(Discussion.likes_count))
    elif sort == "active":
        query = query.order_by(desc(Discussion.is_pinned), desc(Discussion.last_reply_at))
    else:  # latest
        query = query.order_by(desc(Discussion.is_pinned), desc(Discussion.created_at))
    
    discussions = query.offset(offset).limit(limit).all()
    return [DiscussionResponse.from_orm_model(d) for d in discussions]


@router.get("/{discussion_id}", response_model=DiscussionResponse)
async def get_discussion(discussion_id: str, db: Session = Depends(get_db)):
    """获取单个讨论详情"""
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    # 增加浏览量
    discussion.views_count += 1
    db.commit()
    db.refresh(discussion)
    
    return DiscussionResponse.from_orm_model(discussion)


@router.post("", response_model=DiscussionResponse)
async def create_discussion(data: DiscussionCreate, db: Session = Depends(get_db)):
    """创建新讨论"""
    discussion = Discussion(
        title=data.title,
        content=data.content,
        category=data.category,
        author_name=data.author_name,
        author_avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.author_name}"
    )
    db.add(discussion)
    db.commit()
    db.refresh(discussion)
    
    return DiscussionResponse.from_orm_model(discussion)


@router.post("/{discussion_id}/like", response_model=dict)
async def like_discussion(discussion_id: str, db: Session = Depends(get_db)):
    """点赞讨论"""
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    discussion.likes_count += 1
    db.commit()
    
    return {"likesCount": discussion.likes_count}


@router.delete("/{discussion_id}", response_model=MessageResponse)
async def delete_discussion(discussion_id: str, db: Session = Depends(get_db)):
    """删除讨论"""
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    db.delete(discussion)
    db.commit()
    
    return MessageResponse(message="讨论已删除", success=True)


# ==================== 回复 API ====================

@router.get("/{discussion_id}/replies", response_model=list[ReplyResponse])
async def get_replies(
    discussion_id: str,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """获取讨论的所有回复"""
    replies = (
        db.query(Reply)
        .filter(Reply.discussion_id == discussion_id)
        .order_by(asc(Reply.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [ReplyResponse.from_orm_model(r) for r in replies]


@router.post("/{discussion_id}/replies", response_model=ReplyResponse)
async def create_reply(
    discussion_id: str,
    data: ReplyCreate,
    db: Session = Depends(get_db)
):
    """创建回复"""
    # 检查讨论是否存在
    discussion = db.query(Discussion).filter(Discussion.id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    if discussion.is_closed:
        raise HTTPException(status_code=400, detail="该讨论已关闭，无法回复")
    
    reply = Reply(
        discussion_id=discussion_id,
        content=data.content,
        author_name=data.author_name,
        author_avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={data.author_name}",
        reply_to_id=data.reply_to_id
    )
    db.add(reply)
    
    # 更新讨论的回复计数和最后回复时间
    discussion.replies_count += 1
    discussion.last_reply_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reply)
    
    return ReplyResponse.from_orm_model(reply)


@router.post("/{discussion_id}/replies/{reply_id}/like", response_model=dict)
async def like_reply(discussion_id: str, reply_id: str, db: Session = Depends(get_db)):
    """点赞回复"""
    reply = db.query(Reply).filter(
        Reply.id == reply_id,
        Reply.discussion_id == discussion_id
    ).first()
    if not reply:
        raise HTTPException(status_code=404, detail="回复不存在")
    
    reply.likes_count += 1
    db.commit()
    
    return {"likesCount": reply.likes_count}


# ==================== 统计 API ====================

@router.get("/stats/overview", response_model=dict)
async def get_discussion_stats(db: Session = Depends(get_db)):
    """获取讨论区统计信息"""
    total_discussions = db.query(Discussion).count()
    total_replies = db.query(Reply).count()
    
    # 获取各分类数量
    categories = {}
    for cat in ["general", "tech", "idea", "help"]:
        count = db.query(Discussion).filter(Discussion.category == cat).count()
        categories[cat] = count
    
    return {
        "totalDiscussions": total_discussions,
        "totalReplies": total_replies,
        "categories": categories
    }
