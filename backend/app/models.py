from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_text = Column(Text, nullable=False)
    predicted_department = Column(String(100))
    priority = Column(String(20))
    status = Column(String(20), default="Pending")
    user_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


# ✅ NEW USER MODEL
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    phone = Column(String(20), unique=True, index=True)

    password = Column(String(200))

    role = Column(String(20), default="user")  # user / admin / officer

    department = Column(String(100), nullable=True)  # 🔥 ADD THIS

    created_at = Column(DateTime, default=datetime.utcnow)