import sys
import os

# Add backend directory to sys.path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            print("Creating admin user...")
            new_user = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                role="admin",
                is_approved=True
            )
            db.add(new_user)
            db.commit()
            print("Admin user created successfully! (username: admin, password: admin)")
        else:
            print("Admin user already exists.")
            # Let's fix the password just in case
            user.hashed_password = get_password_hash("admin")
            db.commit()
            print("Admin password reset to 'admin'.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error seeding admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
