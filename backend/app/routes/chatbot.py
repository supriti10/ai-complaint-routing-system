from fastapi import APIRouter, Depends
from app.auth import get_current_active_user
import google.generativeai as genai
import os
import json

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

@router.post("/")
def chatbot(data: dict, user=Depends(get_current_active_user)):

    user_input = data.get("message")

    prompt = f"""
    You are an AI grievance assistant.

    Your job:
    - Understand user complaint
    - Ask follow-up questions if needed
    - When ready, return structured complaint

    Always respond ONLY in JSON format:

    {{
      "reply": "...",
      "final": true/false,
      "complaint": "..."
    }}

    User message:
    {user_input}
    """

    response = model.generate_content(prompt)

    try:
        result = json.loads(response.text)
    except:
        result = {
            "reply": response.text,
            "final": False,
            "complaint": None
        }

    return result