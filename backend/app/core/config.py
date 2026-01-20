from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "StockCheck"
    secret_key: str = "change-me"
    database_url: str = "sqlite:///./app.db"
    frontend_origin: str = "http://localhost:5173"
    admin_email: str = "admin@example.com"
    admin_password: str = "change-me"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
