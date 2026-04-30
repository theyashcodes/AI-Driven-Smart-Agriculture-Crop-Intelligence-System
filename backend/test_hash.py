import sys
import traceback
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

with open("error.txt", "w") as f:
    try:
        from app.core.security import get_password_hash
        get_password_hash("admin")
    except Exception as e:
        traceback.print_exc(file=f)
