from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    rutasegura_env: str = "local"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/postgres"
    jwt_secret_key: str = "change-me-in-local-dev"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    web_origin: str = "http://localhost:3000"


settings = Settings()
