import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.database import engine
from sqlalchemy import text

def run():
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR DEFAULT 'free';"))
    print("Migration SaaS successful")

if __name__ == '__main__':
    run()
