import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from dependencies import get_current_user, get_database_connection
from fastapi.responses import JSONResponse
import mysql.connector
import json

# 設置基本配置，例如日誌級別，日誌格式等
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter()

class Booking(BaseModel):
    attraction_id: int
    date: str
    time: str
    price: int

bookings = []

@router.post('/booking', status_code=status.HTTP_201_CREATED)
async def create_booking(booking: Booking, user_id: str = Depends(get_current_user)):
    logging.info(f"Received booking data: {booking.model_dump()}")  


    if not user_id:
        logging.warning("Attempt to access booking creation without authentication")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": True, "message": "未登入系統，拒絕存取"}
        )

    conn = get_database_connection()
    cursor = conn.cursor()
    try:
        # 插入預訂資訊到資料庫
        logging.info(f"Preparing to insert booking into database with data: {booking.model_dump()}")
        cursor.execute(
            "INSERT INTO bookings (user_id, attraction_id, date, time, price) VALUES (%s, %s, %s, %s, %s)",
            (user_id, booking.attraction_id, booking.date, booking.time, booking.price)
        )
        conn.commit()  # 確保提交交易
        return {"ok": True, "message": "預訂已創建"}
    except mysql.connector.Error as e:
        conn.rollback()  # 發生錯誤
        logging.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="伺服器內部錯誤")
    finally:
        cursor.close()
        conn.close()

@router.get('/booking')
async def get_booking(user_id: str = Depends(get_current_user)):
    if not user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": True, "message": "未登入系統，拒絕存取"}
        )

    # 從數據庫中檢索用戶的預訂信息
    booking_info = get_latest_booking_from_database(user_id)
    if not booking_info:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"data": None}
        )

    attraction_info = get_attraction_from_database(booking_info['attraction_id'])
    if not attraction_info:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": True, "message": "未找到景點信息"}
        )

    first_image_url = json.loads(attraction_info['images'])[0] if attraction_info['images'] else None

    return {
        "data": {
            "attraction": {
                "id": attraction_info['id'],
                "name": attraction_info['name'],
                "address": attraction_info['address'],
                "image": first_image_url
            },
            "date": booking_info['date'],
            "time": booking_info['time'],
            "price": booking_info['price']
        }
    }

def get_latest_booking_from_database(user_id: str):
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM bookings WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
        return cursor.fetchone()
    finally:
        cursor.close()
        conn.close()


    

def get_booking_from_database(user_id: str):
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM bookings WHERE user_id = %s", (user_id,))
        booking_info = cursor.fetchall()
        if booking_info:
            return booking_info
        else:
            return None
    except mysql.connector.Error as e:
        logging.error(f"Database error during booking retrieval: {e}")
        return None
    finally:
        cursor.close()
        conn.close()



def get_attraction_from_database(attraction_id):
    conn = get_database_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, address, images FROM attractions WHERE id = %s", (attraction_id,))
    return cursor.fetchone()


@router.delete('/booking', status_code=status.HTTP_200_OK)
async def delete_booking(user_id: str = Depends(get_current_user)):
    if not user_id:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": True, "message": "未登入系統，拒絕存取"}
        )

    conn = get_database_connection()
    cursor = conn.cursor(buffered=True)
    try:
        # 檢查是否存在用戶的預訂信息
        cursor.execute("SELECT * FROM bookings WHERE user_id = %s", (user_id,))
        if cursor.fetchone() is None:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"error": True, "message": "未找到预订信息"}
            )
        
        # 刪除預訂信息
        cursor.execute("DELETE FROM bookings WHERE user_id = %s", (user_id,))
        conn.commit()
        return {"ok": True, "message": "预订已删除"}
    except mysql.connector.Error as e:
        conn.rollback()
        logging.error(f"Database error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": True, "message": "伺服器內部錯誤"}
        )
    finally:
        cursor.close()
        conn.close()
