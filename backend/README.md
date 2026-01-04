# AI Dev Journey Portal - 后端

这是 AI Dev Journey Portal 的后端 API 服务，基于 FastAPI + SQLite + DeepSeek AI 构建。

## 技术栈

- **框架**: FastAPI
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: SQLAlchemy
- **AI**: DeepSeek (通过 OpenAI SDK 兼容接口)

## 快速开始

### 1. 创建虚拟环境

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

复制 `.env` 文件并配置你的 DeepSeek API Key：

```bash
# .env 已预置，可直接使用
```

### 4. 启动服务

```bash
# 开发模式（热重载）
python main.py

# 或使用 uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 访问 API 文档

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## API 端点

| 方法 | 端点 | 功能 |
|-----|------|------|
| GET | `/api/projects` | 获取所有项目 |
| GET | `/api/projects/{id}` | 获取项目详情 |
| POST | `/api/projects` | 创建项目 |
| PUT | `/api/projects/{id}` | 更新项目 |
| DELETE | `/api/projects/{id}` | 删除项目 |
| POST | `/api/projects/{id}/like` | 点赞/取消点赞 |
| GET | `/api/projects/{id}/comments` | 获取评论 |
| POST | `/api/projects/{id}/comments` | 发表评论 |
| **POST** | `/api/ai/insights` | **AI 生成项目点评** |

## 目录结构

```
backend/
├── main.py               # FastAPI 入口
├── config.py             # 配置管理
├── database.py           # 数据库连接
├── models.py             # SQLAlchemy 模型
├── schemas.py            # Pydantic 模型
├── seed_data.py          # 种子数据
├── routers/
│   ├── projects.py       # 项目 API
│   ├── comments.py       # 评论 API
│   └── ai.py             # AI API
├── services/
│   └── deepseek_service.py  # DeepSeek 服务
├── requirements.txt
└── .env
```
