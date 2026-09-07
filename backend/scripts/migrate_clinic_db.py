import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def migrate_data():
    print(f'Connecting to MongoDB...')
    client = AsyncIOMotorClient(settings.MONGO_URL)
    
    # FORCE clinic_db regardless of any env override
    db = client['clinic_db']
    print(f'Explicitly targeting database: clinic_db')
    
    clinics = db['clinics']
    
    # 1. Create IR clinic in clinic_db
    ir_clinic = await clinics.find_one({'clinic_id': 'IR'})
    if not ir_clinic:
        print('Creating IR clinic in clinic_db...')
        await clinics.insert_one({
            'clinic_id': 'IR',
            'name': 'IR Clinic',
            'address': 'Default Address',
            'phone': '0000000000',
            'email': 'ir@clinic.com',
            'verification_status': 'verified'
        })
        print('IR clinic created!')
    else:
        print('IR clinic already exists in clinic_db.')

    collections_to_update = [
        'consultations', 'doctors', 'nurses', 'receptionists',
        'slots', 'tasks', 'queries'
    ]
    
    for coll_name in collections_to_update:
        collection = db[coll_name]
        total = await collection.count_documents({})
        missing = await collection.count_documents({'clinic_id': {'$exists': False}})
        print(f'  {coll_name}: {total} total, {missing} missing clinic_id')
        
        if missing > 0:
            result = await collection.update_many(
                {'clinic_id': {'$exists': False}},
                {'$set': {'clinic_id': 'IR'}}
            )
            print(f'    -> Updated {result.modified_count} documents')

    # Verify
    count = await clinics.count_documents({})
    print(f'\nVerification: clinic_db.clinics has {count} clinic(s)')
    
    print('Migration complete!')
    client.close()

if __name__ == '__main__':
    asyncio.run(migrate_data())
