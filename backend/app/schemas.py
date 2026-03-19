from pydantic import BaseModel
from datetime import datetime


class ComplaintCreate(BaseModel):
    complaint_text: str
    # user_id: int


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
# NEW USER SCHEMAS
# ======================

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str 


class UserLogin(BaseModel):
    email_or_phone: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True