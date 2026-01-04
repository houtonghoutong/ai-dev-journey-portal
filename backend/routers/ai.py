"""
AI 相关 API 路由
提供 DeepSeek AI 驱动的智能功能
"""

from fastapi import APIRouter, HTTPException

from schemas import AIInsightRequest, AIInsightResponse
from services.deepseek_service import generate_project_insight

router = APIRouter(prefix="/ai", tags=["AI 服务"])


@router.post("/insights", response_model=AIInsightResponse)
async def get_ai_insight(request: AIInsightRequest):
    """
    获取项目的 AI 视角点评
    
    使用 DeepSeek 模型分析项目信息，生成专业且富有感染力的评价
    """
    try:
        insight = await generate_project_insight(
            title=request.title,
            background_story=request.background_story,
            short_description=request.short_description
        )
        return AIInsightResponse(insight=insight)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI 服务暂时不可用: {str(e)}"
        )
