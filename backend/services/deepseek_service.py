"""
DeepSeek AI 服务
使用 OpenAI SDK 兼容接口调用 DeepSeek API
"""

from openai import OpenAI
from config import get_settings

settings = get_settings()

# 初始化 DeepSeek 客户端 (使用 OpenAI SDK 兼容接口)
client = OpenAI(
    api_key=settings.deepseek_api_key,
    base_url=settings.deepseek_base_url
)


async def generate_project_insight(
    title: str,
    background_story: str,
    short_description: str
) -> str:
    """
    生成项目的 AI 视角点评
    
    Args:
        title: 项目名称
        background_story: 项目背景故事
        short_description: 项目简短描述
    
    Returns:
        AI 生成的点评文本
    """
    try:
        prompt = f"""你是一个资深开发者评论家。请根据以下项目信息，提供一个简短且吸引人的"AI 视角点评"，突出它的创新点。

项目名称: {title}
背景: {background_story}
功能: {short_description}

要求：字数在100字以内，语气专业且富有感染力。"""

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个专业的技术评论家，擅长发现项目的亮点和创新之处。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        return response.choices[0].message.content or "暂无 AI 点评。"
    
    except Exception as e:
        print(f"DeepSeek API Error: {e}")
        return "AI 暂时无法提供点评。"


async def chat_completion(
    messages: list[dict],
    model: str = "deepseek-chat",
    max_tokens: int = 1000,
    temperature: float = 0.7
) -> str:
    """
    通用聊天完成接口
    
    Args:
        messages: 消息列表
        model: 模型名称
        max_tokens: 最大 token 数
        temperature: 温度参数
    
    Returns:
        AI 回复文本
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        print(f"DeepSeek API Error: {e}")
        raise e
