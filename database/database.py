
import sqlite3

def connect_db():
    return sqlite3.connect("agriculture.db")

def create_table():
    conn = connect_db()
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sensor_data (
        temperature REAL,
        humidity REAL,
        soil_moisture REAL
    )
    ''')

    conn.commit()
    conn.close()
