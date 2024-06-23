from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import mysql.connector
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
import datetime
from fastapi.responses import JSONResponse

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserRegistration(BaseModel):
    name: str
    email: str
    password: str

def get_database_connection():
    return mysql.connector.connect(
        host="localhost",
        user="websiteuser",
        password="WWa@sfDD24531",
        database="TDT",
        charset='utf8mb4'
    )

SECRET_KEY = "YOUR_SECRET_KEY"  # 确保一致
ALGORITHM = "HS256"  # 确保一致

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/auth")

# 创建访问令牌
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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
        return JSONResponse(status_code=200, content={"message": "User registered successfully"})
    except mysql.connector.Error as e:
        conn.rollback()
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
    finally:
        cursor.close()
        conn.close()

# 用戶登錄
@router.put("/user/auth")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="電子郵件或者密碼錯誤")
    access_token = create_access_token(data={"user_id": user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}

# 验证用户身份
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

# 获取当前登录的用户信息
@router.get("/user/auth")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        
        conn = get_database_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"data": user}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    finally:
        cursor.close()
        conn.close()
