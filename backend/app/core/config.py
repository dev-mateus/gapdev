"""Application configuration."""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
	"""Runtime settings loaded from environment variables."""

	database_url: str = "sqlite:///./app.db"
	secret_key: str = "troque-esta-chave-em-producao"
	access_token_expire_minutes: int = 1440

	model_config = SettingsConfigDict(
		env_file=str(BASE_DIR / ".env"),
		env_file_encoding="utf-8",
		extra="ignore",
	)


settings = Settings()
