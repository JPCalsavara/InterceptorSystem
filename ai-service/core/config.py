from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str = "mock-key"
    model_name: str = "gemini-1.5-flash"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
