from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password = Column(String)

class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True)
    url = Column(String)
    preview = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))