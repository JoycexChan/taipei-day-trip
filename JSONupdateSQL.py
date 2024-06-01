import json
import mysql.connector
from datetime import datetime
import re

# 連接到 MySQL 數據庫
def connect_to_database():
    return mysql.connector.connect(
        host='localhost',
        user='websiteuser',
        password='websitepassword',
        database='TDT'
    )

# 插入數據到數據庫
def insert_data(data):
    db = connect_to_database()
    cursor = db.cursor()

    insert_stmt = (
        "INSERT INTO attractions (avBegin, avEnd, _id, REF_WP, MEMO_TIME, longitude, latitude, "
        "langinfo, address, POI, RowNumber, CAT, direction, file, images, description, rate, name, "
        "idpt, date, SERIAL_NO, MRT) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    )

    for item in data['result']['results']:
        # 確保各字段不為 None
        memo_time = item.get('MEMO_TIME') or ''
        mrt = item.get('MRT') or ''
        
        # 其他字段處理
        avBegin = datetime.strptime(item['avBegin'], '%Y/%m/%d') if item.get('avBegin') else None
        avEnd = datetime.strptime(item['avEnd'], '%Y/%m/%d') if item.get('avEnd') else None
        date = datetime.strptime(item['date'], '%Y/%m/%d') if item.get('date') else None

        # 儲存所有的 URL
        files = item.get('file', '')
        print(f"Step 1 - files: {files}")
        # 查找符合 jpg/JPG, png/PNG 結尾的網址
        #images = ','.join(['https' + url for url in files.split('https') if url[-3:].lower() in ['jpg', 'png'] and 'http' not in url])
        #正則測試
        imagesRE = re.compile(r'https:\/\/[^\s]+?\.(?:jpg|jpeg|png)', re.IGNORECASE)
        #print(f"Step 2 - imagesRE: {imagesRE}")
        matches = imagesRE.findall(files)
        #print(f"Step 2 - matches: {matches}")
        images = json.dumps(matches)  # 轉換為JSON字符串格式  
        #images = ','.join(matches)
        #print(f"Step 3 - images: {images}")


        values = (
            avBegin, avEnd, item.get('_id'), item.get('REF_WP'), memo_time, item.get('longitude'),
            item.get('latitude'), item.get('langinfo'), item.get('address'), item.get('POI'), item.get('RowNumber'),
            item.get('CAT'), item.get('direction'), files, images, item.get('description'), item.get('rate'),
            item.get('name'), item.get('idpt'), date, item.get('SERIAL_NO'), mrt
        )
        
        cursor.execute(insert_stmt, values)
    
    db.commit()
    cursor.close()
    db.close()

if __name__ == "__main__":
    with open('taipei-attractions.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    insert_data(data)