from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models import User
from app.schemas import UserCreate
from app.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


# ✅ SIGNUP
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(
        (User.email == user.email) |
        (User.phone == user.phone) |
        (User.name == user.username)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    role = user.role if user.role in ["user", "admin", "officer"] else "user"

    new_user = User(
        name=user.username,
        email=user.email,
        phone=user.phone,
        password=hash_password(user.password),
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Signup successful"}


# ✅ LOGIN (SWAGGER COMPATIBLE)
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    identifier = form_data.username
    password = form_data.password

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Missing credentials")

    user = db.query(User).filter(
        or_(
            User.email == identifier,
            User.phone == identifier,
            User.name == identifier
        )
    ).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",  # 🔥 IMPORTANT FOR SWAGGER
        "role": user.role,
        "id": user.id,
        "name": user.name
    }