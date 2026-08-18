import asyncio
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def migrate_data():
    print(f'Connecting to {settings.MONGO_URL}...')
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DATABASE_NAME]
    
    clinics = db['clinics']
    
    # 1. Create or get 'IR' clinic
    ir_clinic = await clinics.find_one({'clinic_id': 'IR'})
    if not ir_clinic:
        print('Creating IR clinic...')
        await clinics.insert_one({
            'clinic_id': 'IR',
            'name': 'IR Clinic',
            'address': 'Default Address',
            'phone': '0000000000',
            'email': 'ir@clinic.com',
            'verification_status': 'verified'
        })
    else:
        print('IR clinic already exists.')

    collections_to_update = [
        'consultations',
        'doctors',
        'nurses',
        'receptionists',
        'slots',
        'tasks',
        'queries'
    ]
    
    for coll_name in collections_to_update:
        collection = db[coll_name]
        
        # Check how many documents miss clinic_id
        count = await collection.count_documents({'clinic_id': {'': False}})
        print(f'Updating {count} documents in {coll_name} collection to belong to clinic IR...')
        
        if count > 0:
            result = await collection.update_many(
                {'clinic_id': {'': False}},
                {'': {'clinic_id': 'IR'}}
            )
            print(f'Modified {result.modified_count} documents in {coll_name}.')

    print('Migration complete!')
    client.close()

if __name__ == '__main__':
    asyncio.run(migrate_data())
