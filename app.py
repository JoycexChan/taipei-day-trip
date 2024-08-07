
from fastapi import FastAPI, Request, HTTPException, Query, status   
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
import json
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

from user_routes import router as user_router
from booking_routes import router as booking_router

from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from order_number_generator import generate_order_number

from pydantic import BaseModel
import requests

app=FastAPI()
# 服務靜態文件
app.mount("/static", StaticFiles(directory="static"), name="static")
# 包含用戶相關的路由
app.include_router(user_router, prefix="/api")
app.include_router(booking_router, prefix="/api")


# 初始化連接池
db_config = {
    "host": "localhost",
    "user": "websiteuser",
    "password": "WWa@sfDD24531",
    "database": "TDT",
    "pool_name": "mypool",
    "pool_size": 5
}
pool = MySQLConnectionPool(**db_config)

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")




# 連接到 MySQL 數據庫的函數
def get_database_connection():
    return mysql.connector.connect(
        host="localhost",
        user="websiteuser",
        password="WWa@sfDD24531",
        database="TDT",
        charset='utf8mb4'
    )

# 景點列表 API
@app.get("/api/attractions{trailing_slash:path}", response_class=JSONResponse)
async def get_attractions(page: int = Query(0, ge=0), keyword: Optional[str] = None):
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    page_size = 12
    offset = page * page_size

    try:
        query = "SELECT * FROM attractions"
        conditions = []
        params = []

        # 添加條件來同時匹配景點名稱（模糊匹配）和捷運站名稱（精確匹配）
        if keyword:
            condition = "(name LIKE %s OR MRT = %s)"
            conditions.append(condition)
            params.extend(['%' + keyword + '%', keyword])  # 為模糊查找和精確匹配準備參數

        # 構建查詢語句
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY id ASC LIMIT %s, %s"
        params.extend([offset, page_size])

        cursor.execute(query, params)
        attractions = cursor.fetchall()

        # 調整圖片URL，只選擇第一個
        #for attraction in attractions:
        #    if attraction['images']:
        #        # 分割圖片 URLs 並選擇第一個
        #        first_image_url = attraction['images'].split('|')[0]
        #        attraction['images'] = [first_image_url]
        #    # 提取 description 中第一個句點之前的文字
        #    if attraction['description']:
        #        first_sentence = attraction['description'].split('。')[0] + '。'
        #        attraction['description'] = first_sentence
        

        # 重整數據格式
        formatted_attractions = [
            {
                "id": attraction["_id"],
                "name": attraction["name"],
                "category": attraction["CAT"],
                "description": attraction["description"],
                "address": attraction["address"],
                "transport": attraction["direction"],
                "mrt": attraction["MRT"],
                "lat": attraction["latitude"],
                "lng": attraction["longitude"],
                "images": json.loads(attraction["images"]) if attraction["images"] else []
            }
            for attraction in attractions
        ]

        # 計算總數用以決定是否有下一頁
        count_query = "SELECT COUNT(*) FROM attractions"
        if conditions:
            count_query += " WHERE " + " AND ".join(conditions)
        cursor.execute(count_query, params[:-2])
        total = cursor.fetchone()['COUNT(*)']
        next_page = page + 1 if (page + 1) * page_size < total else None

        return {"data": formatted_attractions, "nextPage": next_page}
        #return JSONResponse(status_code=200, content={"nextPage": next_page, "data": formatted_attractions})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    finally:
        cursor.close()
        conn.close()


# 根據景點編號取得景點資料 API
@app.get("/api/attraction/{attractionId}", response_class=JSONResponse)
async def get_attraction(attractionId: int):
    print("Received attractionId:", attractionId)  # 打印接收到的 attractionId
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        query = "SELECT * FROM attractions WHERE _id = %s"
        print("Executing query:", query)  # 打印查詢語句
        print("With parameter:", attractionId)  # 打印查詢參數
        cursor.execute(query, (attractionId,))
        attraction = cursor.fetchone()
        print("Query result:", attraction)  # 打印查詢結果

        if not attraction:
            print("Invalid attraction ID:", attractionId)  # 打印錯誤訊息
            return JSONResponse(status_code=400, content={"error": True, "message": "景點編號不正確"})

        # 調整圖片URL，只選擇第一個
        #if attraction['images']:
        #    first_image_url = attraction['images'].split('|')[0]
        #    attraction['images'] = [first_image_url]
        
        # 提取 description 中第一個句點之前的文字
        #if attraction['description']:
        #    first_sentence = attraction['description'].split('。')[0] + '。'
        #    attraction['description'] = first_sentence
        
        # 重整數據格式
        formatted_attraction = {
            "id": attraction["_id"],
            "name": attraction["name"],
            "category": attraction["CAT"],
            "description": attraction["description"],
            "address": attraction["address"],
            "transport": attraction["direction"],
            "mrt": attraction["MRT"],
            "lat": attraction["latitude"],
            "lng": attraction["longitude"],
            "images": json.loads(attraction["images"]) if attraction["images"] else []
        }

        return {"data": formatted_attraction}

    except Exception as e:
        print("Exception occurred:", str(e))  # 打印異常信息
        return JSONResponse(status_code=500, content={"error": True, "message": "伺服器內部錯誤"})
    finally:
        cursor.close()
        conn.close()




# 捷運站列表 API
@app.get("/api/mrts{trailing_slash:path}")
async def get_mrts():
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT MRT, COUNT(*) AS attractions_count
            FROM attractions
            WHERE MRT IS NOT NULL AND MRT != ''
            GROUP BY MRT
            ORDER BY attractions_count DESC
        """)
#確認景點數量，展示捷運站與景點數量
#        mrt_stations = cursor.fetchall()
#        return JSONResponse(status_code=200, content={"data": mrt_stations})

#僅回傳捷運站名，符合要求
        mrt_stations = cursor.fetchall()
        # 只保留 MRT 字段
        mrt_station_names = [station["MRT"] for station in mrt_stations]

        return JSONResponse(status_code=200, content={"data": mrt_station_names})
    except Exception as e:
        print("Exception occurred:", str(e))  # 打印異常信息
        raise HTTPException(status_code=500, detail={"error": True, "message": "伺服器內部錯誤"})
    finally:
        cursor.close()
        conn.close()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_messages = [{"field": err["loc"][1], "message": err["msg"]} for err in errors]
    return JSONResponse(
        status_code=400,
        content={"error": True, "message": "所有欄位必須填寫完整。", "details": error_messages}
#        content={"error": True, "message": "所有欄位必須填寫完整。"}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail},
        headers=exc.headers
    )


# 定義接收前端支付請求的數據模型
class Cardholder(BaseModel):
    phone_number: str
    name: str
    email: str


class PaymentRequest(BaseModel):
    prime: str
    amount: int
    cardholder: Cardholder

# 定義支付結果的數據模型
class PaymentResponse(BaseModel):
    status: int
    msg: str
    rec_trade_id: str = ""
    bank_transaction_id: str = ""
    auth_code: str = ""
    order_number: str = ""  

@app.post("/api/pay", response_model=PaymentResponse)
def process_payment(payment_request: PaymentRequest):
    conn = get_database_connection()
    cursor = conn.cursor()

    try:
        # 生成訂單號
        order_number = generate_order_number()

        # 將訂單資料插入到 orders 表
        cursor.execute(
            "INSERT INTO orders (order_number, user_id, total_amount, status) VALUES (%s, %s, %s, %s)",
            (order_number, 1, payment_request.amount, 'pending')
        )
        order_id = cursor.lastrowid

        # 設置支付資料
        payment_data = {
            "prime": payment_request.prime,
            "partner_key": "partner_2wSfW6bUI3Mnch2z8LfgtMNKBwN3XugqpgoqcVV1kFnlkBpHPF2cqqqP",
            "merchant_id": "joyce770109_FUBON_POS_1",
            "details": "Order Payment",
            "amount": payment_request.amount,
            "cardholder": payment_request.cardholder.model_dump(),
            "remember": False
        }

        response = requests.post(
            "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
            json=payment_data,
            headers={
                "Content-Type": "application/json",
                "x-api-key": "partner_2wSfW6bUI3Mnch2z8LfgtMNKBwN3XugqpgoqcVV1kFnlkBpHPF2cqqqP"
            }
        )

        result = response.json()
        if result["status"] != 0:
            raise HTTPException(status_code=400, detail=result["msg"])
        
        # 更新訂單狀態
        cursor.execute(
            "UPDATE orders SET status = 'paid' WHERE id = %s",
            (order_id,)
        )

        # 插入支付資料到 payments 表
        cursor.execute(
            "INSERT INTO payments (order_id, prime, rec_trade_id, bank_transaction_id, amount, status, message) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (order_id, payment_request.prime, result.get("rec_trade_id", ""), result.get("bank_transaction_id", ""), payment_request.amount, 'success', result["msg"])
        )

        # 插入持卡人資料到 cardholders 表
        cursor.execute(
            "INSERT INTO cardholders (order_id, phone_number, name, email) VALUES (%s, %s, %s, %s)",
            (order_id, payment_request.cardholder.phone_number, payment_request.cardholder.name, payment_request.cardholder.email)
        )

        conn.commit()

        return PaymentResponse(
            status=result["status"],
            msg=result["msg"],
            rec_trade_id=result.get("rec_trade_id", ""),
            bank_transaction_id=result.get("bank_transaction_id", ""),
            auth_code=result.get("auth_code", ""),
            order_number=order_number
        )
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)