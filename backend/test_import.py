import sys
import traceback

try:
    import main
    print("SUCCESS")
except Exception as e:
    with open("error_trace.log", "w", encoding="utf-8") as f:
        f.write(traceback.format_exc())
