from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    MONGO_URL: str
    DATABASE_NAME: str = "clinic_db"

    # Twilio Settings
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # SMTP Settings
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM: str = ""

    class Config:
        env_file = ".env"


settings = Settings()