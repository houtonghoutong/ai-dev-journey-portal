"""
SQLAlchemy ORM 数据模型
对应前端 types.ts 中定义的实体
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
import uuid


def generate_uuid():
    """生成 UUID 字符串"""
    return str(uuid.uuid4())


class Project(Base):
    """项目模型"""
    __tablename__ = "projects"
    
    # 基础标识
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False, index=True)
    category = Column(String(50), nullable=False, default="Other")  # Web, AI Tool, Mobile, Other
    
    # 内容描述
    short_description = Column(Text, nullable=False)
    full_description = Column(Text, nullable=False)
    background_story = Column(Text, nullable=False)
    usage_instructions = Column(Text, nullable=False)
    
    # 媒体资源
    thumbnail_url = Column(String(500), nullable=False)
    banner_url = Column(String(500), nullable=False)
    
    # 链接与标签
    external_link = Column(String(500), nullable=False)
    tags = Column(JSON, default=list)  # 存储为 JSON 数组
    
    # 社交统计
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title})>"


class Comment(Base):
    """评论模型"""
    __tablename__ = "comments"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    
    # 评论者信息
    author_name = Column(String(100), nullable=False)
    author_avatar = Column(String(500), default="")
    
    # 评论内容
    content = Column(Text, nullable=False)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    project = relationship("Project", back_populates="comments")
    
    def __repr__(self):
        return f"<Comment(id={self.id}, author={self.author_name})>"


class Like(Base):
    """点赞记录模型 - 用于防止重复点赞"""
    __tablename__ = "likes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, index=True)
    user_identifier = Column(String(100), nullable=False)  # 可以是 IP、session ID 或用户 ID
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Like(project_id={self.project_id}, user={self.user_identifier})>"


class Discussion(Base):
    """社区讨论帖子模型"""
    __tablename__ = "discussions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(300), nullable=False, index=True)
    content = Column(Text, nullable=False)
    
    # 分类：general(综合讨论), tech(技术交流), idea(创意分享), help(求助问答)
    category = Column(String(50), nullable=False, default="general")
    
    # 作者信息
    author_name = Column(String(100), nullable=False)
    author_avatar = Column(String(500), default="")
    
    # 统计数据
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    
    # 状态
    is_pinned = Column(Integer, default=0)  # 是否置顶
    is_closed = Column(Integer, default=0)  # 是否关闭讨论
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_reply_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    replies = relationship("Reply", back_populates="discussion", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Discussion(id={self.id}, title={self.title})>"


class Reply(Base):
    """讨论回复模型"""
    __tablename__ = "replies"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    discussion_id = Column(String(36), ForeignKey("discussions.id"), nullable=False, index=True)
    
    # 回复内容
    content = Column(Text, nullable=False)
    
    # 作者信息
    author_name = Column(String(100), nullable=False)
    author_avatar = Column(String(500), default="")
    
    # 点赞数
    likes_count = Column(Integer, default=0)
    
    # 引用回复（可选）
    reply_to_id = Column(String(36), ForeignKey("replies.id"), nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联关系
    discussion = relationship("Discussion", back_populates="replies")
    
    def __repr__(self):
        return f"<Reply(id={self.id}, author={self.author_name})>"
