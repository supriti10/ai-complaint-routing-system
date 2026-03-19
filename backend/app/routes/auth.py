from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


# ✅ SIGNUP
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(
        (User.email == user.email) | (User.phone == user.phone)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hash_password(user.password),
        role=user.role   # default role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Signup successful",
        "user_id": new_user.id
    }


# ✅ LOGIN (email or phone)
@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(
        (User.email == data.email_or_phone) |
        (User.phone == data.email_or_phone)
    ).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 🔥 TOKEN WITH ALL REQUIRED DATA
    token = create_access_token({
        "sub": str(user.id),   # always string for JWT
        "role": user.role,
        "department": getattr(user, "department", None)
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "role": user.role,
        "user_id": user.id
    }