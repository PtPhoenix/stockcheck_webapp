from pydantic import BaseSettings


class Settings(BaseSettings):
    app_name: str = "StockCheck"
    secret_key: str = "change-me"
    database_url: str = "sqlite:///./app.db"
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
