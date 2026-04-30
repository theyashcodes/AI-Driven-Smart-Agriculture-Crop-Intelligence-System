import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine
from sqlalchemy import text

def run():
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("UPDATE users SET is_approved = TRUE WHERE role = 'admin';"))
    print("Migration successful")

if __name__ == '__main__':
    run()
