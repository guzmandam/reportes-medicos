from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .models import TokenData, User, UserInDB
from .database import users
from .config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user(email: str) -> Optional[UserInDB]:
    if user_dict := users.find_one({"email": email}):
        user_dict["id"] = str(user_dict.pop("_id"))
        if "created_at" not in user_dict:
            user_dict["created_at"] = datetime.utcnow()
        if "is_active" not in user_dict:
            user_dict["is_active"] = True
        
        return UserInDB(**user_dict)
    return None

def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    if user := get_user(email):
        if verify_password(password, user.hashed_password):
            return user
    return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    if user := get_user(token_data.email):
        user_dict = user.model_dump()
        user_dict.pop("hashed_password", None)
        if "_id" in user_dict:
            user_dict["id"] = str(user_dict.pop("_id"))
        return User(**user_dict)
    raise credentials_exception

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user 