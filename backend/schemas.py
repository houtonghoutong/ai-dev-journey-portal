"""
Pydantic 请求/响应模型
用于 API 数据验证和序列化
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


# ==================== 项目相关 ====================

class ProjectBase(BaseModel):
    """项目基础字段"""
    title: str
    category: str = "Other"
    short_description: str = Field(..., alias="shortDescription")
    full_description: str = Field(..., alias="fullDescription")
    background_story: str = Field(..., alias="backgroundStory")
    usage_instructions: str = Field(..., alias="usageInstructions")
    thumbnail_url: str = Field(..., alias="thumbnailUrl")
    banner_url: str = Field(..., alias="bannerUrl")
    external_link: str = Field(..., alias="externalLink")
    tags: list[str] = []


class ProjectCreate(ProjectBase):
    """创建项目请求体"""
    pass


class ProjectUpdate(BaseModel):
    """更新项目请求体 - 所有字段可选"""
    title: Optional[str] = None
    category: Optional[str] = None
    short_description: Optional[str] = Field(None, alias="shortDescription")
    full_description: Optional[str] = Field(None, alias="fullDescription")
    background_story: Optional[str] = Field(None, alias="backgroundStory")
    usage_instructions: Optional[str] = Field(None, alias="usageInstructions")
    thumbnail_url: Optional[str] = Field(None, alias="thumbnailUrl")
    banner_url: Optional[str] = Field(None, alias="bannerUrl")
    external_link: Optional[str] = Field(None, alias="externalLink")
    tags: Optional[list[str]] = None


class ProjectResponse(BaseModel):
    """项目响应体"""
    id: str
    title: str
    category: str
    shortDescription: str
    fullDescription: str
    backgroundStory: str
    usageInstructions: str
    thumbnailUrl: str
    bannerUrl: str
    externalLink: str
    tags: list[str]
    likesCount: int
    commentsCount: int
    createdAt: str
    updatedAt: str
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_model(cls, project):
        """从 ORM 模型转换"""
        return cls(
            id=project.id,
            title=project.title,
            category=project.category,
            shortDescription=project.short_description,
            fullDescription=project.full_description,
            backgroundStory=project.background_story,
            usageInstructions=project.usage_instructions,
            thumbnailUrl=project.thumbnail_url,
            bannerUrl=project.banner_url,
            externalLink=project.external_link,
            tags=project.tags or [],
            likesCount=project.likes_count,
            commentsCount=project.comments_count,
            createdAt=project.created_at.isoformat() if project.created_at else "",
            updatedAt=project.updated_at.isoformat() if project.updated_at else ""
        )


# ==================== 评论相关 ====================

class CommentCreate(BaseModel):
    """创建评论请求体"""
    content: str
    author_name: str = Field(default="匿名访客", alias="author")


class CommentResponse(BaseModel):
    """评论响应体"""
    id: str
    projectId: str
    authorName: str
    authorAvatar: str
    content: str
    createdAt: str
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_model(cls, comment):
        """从 ORM 模型转换"""
        return cls(
            id=comment.id,
            projectId=comment.project_id,
            authorName=comment.author_name,
            authorAvatar=comment.author_avatar or f"https://picsum.photos/seed/{comment.author_name}/100/100",
            content=comment.content,
            createdAt=comment.created_at.isoformat() if comment.created_at else ""
        )


# ==================== 点赞相关 ====================

class LikeToggleRequest(BaseModel):
    """点赞切换请求体"""
    is_liking: bool = Field(..., alias="isLiking")


class LikeResponse(BaseModel):
    """点赞响应体"""
    newLikesCount: int
    isLiked: bool


# ==================== AI 相关 ====================

class AIInsightRequest(BaseModel):
    """AI 点评请求体"""
    title: str
    background_story: str = Field(..., alias="backgroundStory")
    short_description: str = Field(..., alias="shortDescription")


class AIInsightResponse(BaseModel):
    """AI 点评响应体"""
    insight: str


# ==================== 通用响应 ====================

class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str
    success: bool = True


# ==================== 讨论相关 ====================

class DiscussionCreate(BaseModel):
    """创建讨论请求体"""
    title: str
    content: str
    category: str = "general"
    author_name: str = Field(default="匿名用户", alias="authorName")


class DiscussionResponse(BaseModel):
    """讨论响应体"""
    id: str
    title: str
    content: str
    category: str
    authorName: str
    authorAvatar: str
    viewsCount: int
    likesCount: int
    repliesCount: int
    isPinned: bool
    isClosed: bool
    createdAt: str
    updatedAt: str
    lastReplyAt: str
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_model(cls, discussion):
        """从 ORM 模型转换"""
        return cls(
            id=discussion.id,
            title=discussion.title,
            content=discussion.content,
            category=discussion.category,
            authorName=discussion.author_name,
            authorAvatar=discussion.author_avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={discussion.author_name}",
            viewsCount=discussion.views_count,
            likesCount=discussion.likes_count,
            repliesCount=discussion.replies_count,
            isPinned=bool(discussion.is_pinned),
            isClosed=bool(discussion.is_closed),
            createdAt=discussion.created_at.isoformat() if discussion.created_at else "",
            updatedAt=discussion.updated_at.isoformat() if discussion.updated_at else "",
            lastReplyAt=discussion.last_reply_at.isoformat() if discussion.last_reply_at else ""
        )


class ReplyCreate(BaseModel):
    """创建回复请求体"""
    content: str
    author_name: str = Field(default="匿名用户", alias="authorName")
    reply_to_id: Optional[str] = Field(None, alias="replyToId")


class ReplyResponse(BaseModel):
    """回复响应体"""
    id: str
    discussionId: str
    content: str
    authorName: str
    authorAvatar: str
    likesCount: int
    replyToId: Optional[str]
    createdAt: str
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm_model(cls, reply):
        """从 ORM 模型转换"""
        return cls(
            id=reply.id,
            discussionId=reply.discussion_id,
            content=reply.content,
            authorName=reply.author_name,
            authorAvatar=reply.author_avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={reply.author_name}",
            likesCount=reply.likes_count,
            replyToId=reply.reply_to_id,
            createdAt=reply.created_at.isoformat() if reply.created_at else ""
        )
