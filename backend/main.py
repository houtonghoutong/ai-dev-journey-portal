"""
AI Dev Journey Portal - 后端 API 入口
FastAPI 应用主文件
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import init_db
from routers import projects, comments, ai, discussions
from seed_data import seed_database

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    print("🚀 正在启动 AI Dev Journey Portal 后端...")
    init_db()
    seed_database()
    print("✅ 数据库初始化完成")
    yield
    # 关闭时清理资源
    print("👋 后端服务已关闭")


# 创建 FastAPI 应用实例
app = FastAPI(
    title="AI Dev Journey Portal API",
    description="一个展示 AI 辅助开发项目的门户网站后端 API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# 配置 CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(projects.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(discussions.router, prefix="/api")


@app.get("/")
async def root():
    """根路径健康检查"""
    return {
        "message": "AI Dev Journey Portal API",
        "status": "running",
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
