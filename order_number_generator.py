import mysql.connector
from datetime import datetime

db_config = {
    "host": "localhost",
    "user": "websiteuser",
    "password": "WWa@sfDD24531",
    "database": "TDT"
}

def generate_order_number():
    conn = mysql.connector.connect(
        host=db_config['host'],
        user=db_config['user'],
        password=db_config['password'],
        database=db_config['database']
    )
    cursor = conn.cursor(dictionary=True)

    try:
        today_date = datetime.now().date()
        cursor.execute("SELECT sequence FROM daily_sequences WHERE date = %s FOR UPDATE", (today_date,))
        result = cursor.fetchone()

        if result:
            sequence = result['sequence'] + 1
            cursor.execute("UPDATE daily_sequences SET sequence = %s WHERE date = %s", (sequence, today_date))
        else:
            sequence = 1
            cursor.execute("INSERT INTO daily_sequences (date, sequence) VALUES (%s, %s)", (today_date, sequence))

        order_number = f"{today_date.strftime('%Y%m%d')}-{sequence:06d}"
        conn.commit()
        return order_number

    except mysql.connector.Error as err:
        conn.rollback()
        raise err

    finally:
        cursor.close()
        conn.close()
