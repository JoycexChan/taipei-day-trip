from fastapi import APIRouter, Depends, Request, HTTPException, status
from pydantic import BaseModel
import mysql.connector
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from jwt import ExpiredSignatureError, PyJWTError  # 確保導入了這些異常
import datetime
from datetime import datetime, timedelta
import logging

from fastapi.responses import JSONResponse
from typing import Optional 


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegistration(BaseModel):
    name: str
    email: str
    password: str

class Booking(BaseModel):
    attraction_id: int
    date: str
    time: str
    price: int

bookings = []

def get_database_connection():
    return mysql.connector.connect(
        host="localhost",
        user="websiteuser",
        password="WWa@sfDD24531",
        database="TDT",
        charset='utf8mb4'
    )

SECRET_KEY = "YOUR_SECRET_KEY"  
ALGORITHM = "HS256"  

class OptionalOAuth2PasswordBearer(OAuth2PasswordBearer):
    def __init__(self, tokenUrl: str, auto_error: bool = False):
        super().__init__(tokenUrl=tokenUrl, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        authorization: str = request.headers.get("Authorization")
        if not authorization:
            return None
        return await super().__call__(request)

# 現在初始化此 schema，並將 auto_error 設置為 False
oauth2_scheme = OptionalOAuth2PasswordBearer(tokenUrl="/api/user/auth", auto_error=False)


# 創建訪問令牌
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta is None:
        expires_delta = timedelta(days=7)
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token is missing",
            headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return get_user_from_database(user_id)
    except (ExpiredSignatureError, PyJWTError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )


def get_user_from_database(user_id: str):
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user





@router.post("/user")
async def register_user(user: UserRegistration):
    conn = get_database_connection()
    cursor = conn.cursor()
    try:
        # Check if the email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            return JSONResponse(status_code=400, content={"error": True, "message": "Email已經註冊帳戶"})

        # Hash password and insert new user
        hashed_password = pwd_context.hash(user.password)
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                       (user.name, user.email, hashed_password))
        conn.commit()
        return JSONResponse(status_code=200, content={"ok": True})
    except mysql.connector.Error:
        conn.rollback()
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    finally:
        cursor.close()
        conn.close()

# 用戶登錄

@router.put("/user/auth")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            return JSONResponse(
                status_code=400, 
                content={"error": True, "message": "帳號或密碼錯誤"}
            )

        access_token_expires = timedelta(days=7)
        access_token = create_access_token(
            data={"user_id": user["id"]}, 
            expires_delta=access_token_expires
        )

        return {"token": access_token}

    except Exception as e:
        logging.error(f"Internal server error: {str(e)}")  # 增加錯誤日誌
        return JSONResponse(
            status_code=500, 
            content={"error": True, "message": "伺服器內部錯誤"}
        )


# 驗證用戶身份
def authenticate_user(email: str, password: str):
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        return False
    if not pwd_context.verify(password, user["password"]):
        return False
    return user

# 獲取當前登入的用戶信息
@router.get("/user/auth")
async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    if token is None:
        return {"data": None}
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            return {"data": None}
        
        # 從數據庫中查找用戶信息
        conn = get_database_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return {"data": user}
        else:
            return {"data": None}
    except jwt.PyJWTError:
        return {"data": None}
    

