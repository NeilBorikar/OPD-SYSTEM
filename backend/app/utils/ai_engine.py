import os
import google.generativeai as genai
from app.config import settings
import json

# Initialize Gemini Client
if hasattr(settings, "gemini_api_key") and settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

# We use gemini-2.0-flash as recommended
generation_config = {
  "temperature": 0.2, # Low temperature for factual consistency
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
}

# Safety settings - We keep them strict to avoid any medical misinterpretation
safety_settings = [
  {
    "category": "HARM_CATEGORY_HARASSMENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    "category": "HARM_CATEGORY_HATE_SPEECH",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
  },
]

# Ensure we don't crash if key is missing (for local testing without key)
try:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=generation_config,
        safety_settings=safety_settings,
    )
except Exception as e:
    model = None

SYSTEM_INSTRUCTION = """
You are CorePulse Records Assistant. You help patients understand their own
medical records stored in the CorePulse system.

ABSOLUTE RULES — VIOLATION OF ANY RULE IS FORBIDDEN:

1. ONLY describe what the patient's records contain. You are a record reader,
   not a doctor.
2. NEVER diagnose conditions, predict outcomes, suggest treatments, or assess
   risk levels.
3. NEVER use phrases like:
   - "You probably have..."
   - "Your condition is worsening/improving..."
   - "You should take/stop taking..."
   - "You are at risk of..."
   - "This could indicate..."
   - "I recommend..."
4. When describing trends, use ONLY factual observations:
   - ACCEPTABLE: "Your records contain 5 visits during this period."
   - ACCEPTABLE: "Your recorded blood pressure was 130/85 on Aug 21."
   - FORBIDDEN: "Your blood pressure is high and concerning."
5. If asked a medical question not answerable from records, respond:
   "I can only help you understand your recorded medical history. Please consult your doctor for medical advice."
6. Always cite specific dates, clinic names, and record details.
7. Be warm, clear, and professional — but never clinical.
"""

def get_disclaimer():
    return "This information summarizes data recorded in your CorePulse account. It is not a medical diagnosis or treatment recommendation. Please discuss any concerns with your healthcare provider."

async def generate_timeline_narrative(records_json: str):
    if not model: return "[]"
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    Given the following medical records for a patient, create a chronological
    health timeline. For each visit, write a brief, human-readable paragraph.
    Include: date, clinic name, what type of visit it was, key findings from
    the record, medicines prescribed (count only), and whether follow-up was
    mentioned in the advice.
    
    Format the response as a JSON array where each object has:
    - "date" (string)
    - "clinic" (string)
    - "narrative" (string)
    - "medicines_count" (integer)
    - "has_followup" (boolean)
    
    Return ONLY valid JSON.
    
    Records:
    {records_json}
    """
    
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    return response.text

async def generate_summary_narrative(records_json: str, stats_json: str):
    if not model: return "AI Summary unavailable (No API Key)"
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    Based on the patient's medical records and stats, write a 3-4 sentence 
    summary of their healthcare history.
    
    Stats:
    {stats_json}
    
    Records:
    {records_json}
    
    Return a single paragraph of plain text.
    """
    
    response = model.generate_content(prompt)
    return response.text

async def answer_record_question(question: str, records_json: str, history: list = None):
    if not model: return "AI Q&A unavailable (No API Key)"
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    A patient is asking a question about their medical records.
    Answer their question FACTUALLY and ONLY based on the records provided.
    
    Question: {question}
    
    Records:
    {records_json}
    
    If the question cannot be answered using the records, state that clearly.
    """
    
    response = model.generate_content(prompt)
    return response.text

async def generate_report_narrative(records_json: str):
    if not model: return "{}"
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    Generate narrative sections for a Personal Health Report based on these records.
    Return ONLY valid JSON with these keys:
    - "activity_overview_text" (string)
    - "recent_visits_narrative" (string)
    - "recent_prescriptions_narrative" (string)
    - "questions_for_doctor" (array of strings: 1-3 factual observations they might want to discuss, e.g. "Your records mention a follow-up was recommended on Aug 21.")
    
    Records:
    {records_json}
    """
    
    response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
    return response.text
