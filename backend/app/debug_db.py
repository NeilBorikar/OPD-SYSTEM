import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def debug_db():
    load_dotenv("backend/.env")
    mongo_url = os.getenv("MONGO_URL")
    db_name = os.getenv("DATABASE_NAME", "clinic_db")
    
    print(f"Connecting to: {mongo_url}")
    print(f"Database name: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    
    # List databases
    dbs = await client.list_database_names()
    print(f"Available databases: {dbs}")
    
    if db_name in dbs:
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"Collections in '{db_name}': {collections}")
        
        if "doctors" in collections:
            count = await db["doctors"].count_documents({})
            print(f"Doctors count: {count}")
            
            async for doc in db["doctors"].find():
                print(f"Doctor found: {doc}")
        else:
            print("Collection 'doctors' not found!")
    else:
        print(f"Database '{db_name}' not found!")

if __name__ == "__main__":
    asyncio.run(debug_db())
