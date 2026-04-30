import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    try:
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        db = client.test_db
        res = await db.test_collection.find_one({})
        print("Success:", res)
    except Exception as e:
        print("Error:", repr(e))

if __name__ == "__main__":
    asyncio.run(test())
