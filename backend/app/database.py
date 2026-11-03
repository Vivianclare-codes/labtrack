import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)


class Base(DeclarativeBase):
    pass


try:
    with engine.connect() as connection:
        print("Successfully connected to PostgreSQL!")
except Exception as error:
    print("Database connection failed:", error)


def create_tables():
    Base.metadata.create_all(bind=engine)
