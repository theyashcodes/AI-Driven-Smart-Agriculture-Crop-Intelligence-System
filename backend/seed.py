from app.database import SessionLocal
from app.models import User
from sqlalchemy.orm import Session

def seed_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            print("Creating default user...")
            new_user = User(
                id=1,
                username="farmer_john",
                email="john@example.com",
                hashed_password="secretpassword"
            )
            db.add(new_user)
            db.commit()
            print("Default user created!")
        else:
            print("Default user already exists.")
    except Exception as e:
        print(f"Error seeding user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_user()
