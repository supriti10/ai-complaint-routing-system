from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Header, Depends
from passlib.context import CryptContext

# =========================
# 🔐 CONFIG
# =========================

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =========================
# 🔑 PASSWORD HASHING
# =========================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


# =========================
# 🔐 CREATE JWT TOKEN
# =========================

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# =========================
# 🔍 GET CURRENT USER
# =========================

def get_current_user(authorization: str = Header(None)):

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.split(" ")[1]

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# =========================
# 🔒 ROLE-BASED ACCESS
# =========================

def get_current_admin(user: dict = Depends(get_current_user)):

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return user


def get_current_officer(user: dict = Depends(get_current_user)):

    if user.get("role") != "officer":
        raise HTTPException(status_code=403, detail="Officer access required")

    return user


def get_current_active_user(user: dict = Depends(get_current_user)):
    return user