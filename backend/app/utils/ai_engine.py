import json
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

# Thread pool for running synchronous Gemini SDK calls without blocking the event loop
_executor = ThreadPoolExecutor(max_workers=3)

# Lazy initialization - don't crash the whole backend if google-generativeai isn't installed
model = None
_init_attempted = False

def _get_model():
    global model, _init_attempted
    if model is not None:
        return model
    if _init_attempted:
        return None
    _init_attempted = True
    
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
            "max_output_tokens": 4096,
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

def _sync_generate(prompt, json_mode=False):
    """Synchronous wrapper to call Gemini. Runs in thread pool."""
    m = _get_model()
    if not m:
        return None
    
    config = {}
    if json_mode:
        config["response_mime_type"] = "application/json"
    
    response = m.generate_content(prompt, generation_config=config if config else None)
    return response.text

async def _generate(prompt, json_mode=False, timeout=25):
    """Async wrapper that runs the sync Gemini call in a thread pool with timeout."""
    loop = asyncio.get_event_loop()
    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(_executor, _sync_generate, prompt, json_mode),
            timeout=timeout
        )
        return result
    except asyncio.TimeoutError:
        logger.error("Gemini API call timed out")
        return None
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
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
    
    result = await _generate(prompt, json_mode=True)
    return result if result else "[]"

async def generate_summary_narrative(records_json: str, stats_json: str):
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    Based on the patient's medical records and stats, write a 3-4 sentence 
    summary of their healthcare history. Be concise.
    
    Stats:
    {stats_json}
    
    Records:
    {records_json}
    
    Return a single paragraph of plain text. Keep it under 100 words.
    """
    
    result = await _generate(prompt, json_mode=False)
    return result if result else "AI Summary is currently unavailable. Please check back later."

async def answer_record_question(question: str, records_json: str, history: list = None):
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    A patient is asking a question about their medical records.
    Answer their question FACTUALLY and ONLY based on the records provided.
    
    Question: {question}
    
    Records:
    {records_json}
    
    If the question cannot be answered using the records, state that clearly.
    Keep your answer concise and under 150 words.
    """
    
    result = await _generate(prompt, json_mode=False)
    return result if result else "Sorry, I encountered an error processing your question. Please try again."

async def generate_report_narrative(records_json: str):
    prompt = f"""
    {SYSTEM_INSTRUCTION}
    
    Generate narrative sections for a Personal Health Report based on these records.
    Return ONLY valid JSON with these keys:
    - "activity_overview_text" (string)
    - "recent_visits_narrative" (string)
    - "recent_prescriptions_narrative" (string)
    - "questions_for_doctor" (array of strings: 1-3 factual observations they might want to discuss)
    
    Keep each narrative section under 80 words.
    
    Records:
    {records_json}
    """
    
    result = await _generate(prompt, json_mode=True)
    return result if result else "{}"
