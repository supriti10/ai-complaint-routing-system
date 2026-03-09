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