"""Database base declarations."""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so metadata knows all mapped tables before create_all.
from app.models import (
    job,
    job_skill,
    password_reset_token,
    skill,
    skill_alias,
    study_plan,
    user,
    user_skill,
)