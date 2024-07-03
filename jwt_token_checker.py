import jwt
from jwt import ExpiredSignatureError, DecodeError
from datetime import datetime, timezone

SECRET_KEY = "YOUR_SECRET_KEY"  
ALGORITHM = "HS256"  

token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1NywiZXhwIjoxNzIwMjc2NDA0fQ.MT28uVwH2Z4q0Yzq9DLQllQbkZx0tj3xRXDaU8im1-8"

try:
    # 解碼token
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    exp = payload.get("exp")
    
    # 將UNIX時間戳轉換為datetime對象並設置時區
    expiration_time = datetime.fromtimestamp(exp, tz=timezone.utc)
    print(f"Token will expire at: {expiration_time}")
    
    # 檢查token是否已經過期
    if datetime.now(timezone.utc) > expiration_time:
        print("Token has expired")
    else:
        print("Token is still valid")

except ExpiredSignatureError:
    print("Token has expired")
except DecodeError:
    print("Invalid token")
