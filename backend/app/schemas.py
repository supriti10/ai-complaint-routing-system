from pydantic import BaseModel
from datetime import datetime


# ======================
# COMPLAINT SCHEMAS
# ======================

class ComplaintCreate(BaseModel):
    complaint_text: str


class ComplaintResponse(BaseModel):
    id: int
    complaint_text: str
    predicted_department: str
    priority: str
    status: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StatusUpdate(BaseModel):
    complaint_id: int
    status: str


# ======================
# USER SCHEMAS
# ======================

class UserCreate(BaseModel):
    username: str   # frontend input
    email: str
    phone: str
    password: str
    role: str = "user"   # default safe


class UserLogin(BaseModel):
    username: str   # 🔥 supports username/email/phone
    password: str


class UserResponse(BaseModel):
    id: int
    name: str   # DB field
    email: str
    phone: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True