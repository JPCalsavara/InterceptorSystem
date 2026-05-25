from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = "sk-mock-key"
    model_name: str = "gpt-4o-mini"
    
    class Config:
        env_file = ".env"

settings = Settings()
