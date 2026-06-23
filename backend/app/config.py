from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):

    MONGO_URL: str
    DATABASE_NAME: str = "clinic_db"

    # Twilio Settings
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None
    TWILIO_DEFAULT_COUNTRY_CODE: str = "+91"

    class Config:
        env_file = ".env"


settings = Settings()