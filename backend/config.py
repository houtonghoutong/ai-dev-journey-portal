"""
应用配置模块
使用 pydantic-settings 管理环境变量
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置类"""
    
    # DeepSeek API 配置
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    
    # 数据库配置
    database_url: str = "sqlite:///./app.db"
    
    # 应用配置
    debug: bool = False
    cors_origins: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """解析 CORS 允许的源列表"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()
