from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    project_name: str = "NexusBiz AI"
    tagline: str = "Your Autonomous AI Business Management Partner"
    database_url: str = "sqlite:///./nexusbiz.db"
    allowed_origins: str = "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000"
    gemini_api_key: str = ""
    openai_api_key: str = ""
    llm_model: str = "gemini-2.5-flash"
    llm_timeout_seconds: int = 30
    jwt_secret_key: str = "nexusbiz-ai-sme-autonomous-management-secret-2026"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 60 * 24 * 7  # 7 days
    debug: bool = True

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
