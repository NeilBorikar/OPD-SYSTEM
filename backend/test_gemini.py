import sys
import os
import json

sys.path.append(os.path.dirname(os.path.abspath('app')))
from app.config import settings
import google.generativeai as genai

genai.configure(api_key=settings.gemini_api_key)

sample_records = [
    {
        'date': '2026-09-17',
        'clinic_id': 'IR',
        'diagnosis': 'lack of nutrients',
        'advice': 'take electrolytes',
        'medicines': [{'name': 'Fast&up', 'dose': 'as much you want'}]
    }
]

prompt = f"""
You are CorePulse Records Assistant.
Format the response as a JSON array where each object has:
- "date" (string)
- "clinic" (string)
- "narrative" (string)
- "medicines_count" (integer)
- "has_followup" (boolean)

Return ONLY valid JSON.

Records:
{json.dumps(sample_records)}
"""

try:
    model = genai.GenerativeModel('gemini-3.6-flash')
    response = model.generate_content(prompt, generation_config={'response_mime_type': 'application/json'})
    print('SUCCESS:')
    print(response.text)
except Exception as e:
    print('GEMINI_ERROR:', str(e))
