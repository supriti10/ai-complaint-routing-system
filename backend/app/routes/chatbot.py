from fastapi import APIRouter, Depends
from app.auth import get_current_active_user
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])

# ✅ Gemini client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


# 🔥 Fallback AI (VERY IMPORTANT)
def fallback_ai(text):
    text = text.lower()

    if "water" in text:
        return "Water department", "High"
    elif "road" in text:
        return "Public Works", "Medium"
    elif "salary" in text:
        return "Finance", "High"
    else:
        return "General", "Low"


@router.post("/")
def chatbot(data: dict, user=Depends(get_current_active_user)):

    user_input = data.get("message")

    try:
        # ✅ SIMPLE Gemini call (NO JSON forcing)
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=f"""
You are a grievance assistant.

User message:
{user_input}

Reply conversationally.
If it sounds like a complaint, summarize it briefly.
"""
        )

        reply = response.text

        # 👉 decide if it's a complaint
        is_complaint = len(user_input) > 10

        if is_complaint:
            department, priority = fallback_ai(user_input)

            return {
                "reply": reply,
                "final": True,
                "complaint": user_input,
                "department": department,
                "priority": priority
            }

        return {
            "reply": reply,
            "final": False,
            "complaint": None
        }

    except Exception as e:
        print("🔥 GEMINI ERROR:", e)

        # 🛟 FALLBACK (NEVER FAIL)
        department, priority = fallback_ai(user_input)

        return {
            "reply": "I understand your issue. Submitting complaint...",
            "final": True,
            "complaint": user_input,
            "department": department,
            "priority": priority
        }