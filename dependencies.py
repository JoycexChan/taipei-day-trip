import jwt
from jwt import ExpiredSignatureError, PyJWTError, InvalidTokenError, DecodeError
from fastapi import HTTPException, Depends, Request, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

import mysql.connector
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

oauth2_scheme = OptionalOAuth2PasswordBearer(tokenUrl="/api/user/auth", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        # 直接拋出異常，不返回JSONResponse
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登入系統，拒絕存取",
            headers={"WWW-Authenticate": "Bearer"}
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: No user_id",
                headers={"WWW-Authenticate": "Bearer"}
            )
        return user_id
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token error: Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token error: Decode error",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token error: Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

def get_user_from_database(user_id: str):
    # 此函數連接到數據庫並返回用戶數據
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_database_connection():
    return mysql.connector.connect(
        host="localhost",
        user="websiteuser",
        password="WWa@sfDD24531",
        database="TDT",
        charset='utf8mb4'
    )

