import json
import logging

logger = logging.getLogger(__name__)

# Lazy initialization - don't crash the whole backend if google-generativeai isn't installed
model = None

def _get_model():
    global model
    if model is not None:
        return model
    
    try:
        import google.generativeai as genai
        from app.config import settings
        
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set - AI features will be unavailable")
            return None
            
        genai.configure(api_key=settings.gemini_api_key)
        
        generation_config = {
            "temperature": 0.2,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
        
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config=generation_config,
        )
        logger.info("Gemini model initialized successfully")
        return model
    except ImportError:
        logger.error("google-generativeai package not installed")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize Gemini model: {e}")
        return None

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
    m = _get_model()
    if not m:
        return "[]"
    try:
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
        
        response = m.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return response.text
    except Exception as e:
        logger.error(f"Timeline generation failed: {e}")
        return "[]"

async def generate_summary_narrative(records_json: str, stats_json: str):
    m = _get_model()
    if not m:
        return "AI Summary is currently unavailable. Please check back later."
    try:
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
        
        response = m.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        return "AI Summary is currently unavailable. Please check back later."

async def answer_record_question(question: str, records_json: str, history: list = None):
    m = _get_model()
    if not m:
        return "AI Q&A is currently unavailable. Please check back later."
    try:
        prompt = f"""
        {SYSTEM_INSTRUCTION}
        
        A patient is asking a question about their medical records.
        Answer their question FACTUALLY and ONLY based on the records provided.
        
        Question: {question}
        
        Records:
        {records_json}
        
        If the question cannot be answered using the records, state that clearly.
        """
        
        response = m.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Q&A generation failed: {e}")
        return "Sorry, I encountered an error processing your question. Please try again."

async def generate_report_narrative(records_json: str):
    m = _get_model()
    if not m:
        return "{}"
    try:
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
        
        response = m.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return response.text
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        return "{}"
