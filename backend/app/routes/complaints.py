from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.predict import predict_department
from app.utils.priority import get_priority
from app.utils.similarity import find_similar_complaint

from app.schemas import ComplaintCreate, StatusUpdate
from app.models import Complaint
from app.auth import get_current_active_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])


# 🔥 SAFE NORMALIZE
def normalize_text(text: str) -> str:
    return " ".join(text.lower().strip().split())


def simple_similarity(a: str, b: str):
    import difflib
    return difflib.SequenceMatcher(None, a, b).ratio()


# =========================
# 🚀 SUBMIT COMPLAINT
# =========================
@router.post("/submit")
def submit_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user)
):

    user_id = int(user["sub"])
    text = complaint.complaint_text.strip()

    existing = db.query(Complaint).all()

    best_score = 0
    existing_match = None

    norm_text = normalize_text(text)

    for c in existing:
        existing_text = normalize_text(c.complaint_text)

        # 🔥 EXACT MATCH (STRICT)
        if norm_text == existing_text and int(c.user_id) == user_id:
            return {
                "blocked": True,
                "saved": False,
                "message": "You already submitted this complaint",
                "similarity_score": 1.0,
                "existing_id": int(c.id)
            }

        # 🔥 HYBRID SIMILARITY
        ai_score, _ = find_similar_complaint(text, [c.complaint_text])
        text_score = simple_similarity(norm_text, existing_text)

        final_score = max(ai_score, text_score)

        if final_score > best_score:
            best_score = final_score
            existing_match = c

    # 🚨 SAME USER BLOCK
    if existing_match and int(existing_match.user_id) == user_id and best_score >= 0.5:
        return {
            "blocked": True,
            "saved": False,
            "message": "You already submitted this complaint",
            "similarity_score": float(best_score),
            "existing_id": int(existing_match.id)
        }

    # 💾 SAVE
    new_complaint = Complaint(
        complaint_text=text,
        predicted_department=predict_department(text),
        priority=get_priority(text),
        status="Pending",
        user_id=user_id,
        assigned_to=None
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return {
        "blocked": False,
        "saved": True,
        "message": "Complaint submitted",

        "similar": best_score >= 0.4,
        "duplicate": best_score >= 0.6,

        "similarity_score": float(best_score),
        "existing_id": int(existing_match.id) if existing_match else None
    }


# =========================
# 🔄 UPDATE STATUS
# =========================
@router.put("/update-status")
def update_complaint_status(
    data: StatusUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.id == data.complaint_id
    ).first()

    if not complaint:
        return {"message": "Complaint not found"}

    complaint.status = data.status
    db.commit()

    return {
        "message": "Status updated successfully",
        "complaint_id": data.complaint_id,
        "new_status": data.status
    }


# =========================
# 👤 USER COMPLAINTS
# =========================
@router.get("/my")
def get_complaints(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_active_user)
):

    if not user or "sub" not in user:
        raise HTTPException(status_code=401, detail="Invalid user")

    user_id = int(user["sub"])

    complaints = db.query(Complaint).filter(
        Complaint.user_id == user_id
    ).order_by(Complaint.id.desc()).all()

    return [
        {
            "id": c.id,
            "complaint_text": c.complaint_text,
            "predicted_department": c.predicted_department,
            "priority": c.priority,
            "status": c.status,
            "created_at": str(c.created_at),
            "rating": c.rating,
            "feedback": c.feedback
        }
        for c in complaints
    ]


# =========================
# ⭐ FEEDBACK
# =========================
@router.post("/feedback")
def give_feedback(data: dict, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(
        Complaint.id == data["complaint_id"]
    ).first()

    if not complaint:
        return {"message": "Complaint not found"}

    complaint.rating = data["rating"]
    complaint.feedback = data["feedback"]

    db.commit()

    return {"message": "Feedback saved"}


# =========================
# 🔍 SIMILAR COMPLAINTS (FIXED)
# =========================
@router.get("/similar/{complaint_id}")
def get_similar_complaints(
    complaint_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user)
):
    current = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not current:
        return []

    all_complaints = db.query(Complaint).filter(
        Complaint.id != complaint_id
    ).all()

    results = []

    for c in all_complaints:
        ai_score, _ = find_similar_complaint(
            current.complaint_text,
            [c.complaint_text]
        )

        text_score = simple_similarity(
            normalize_text(current.complaint_text),
            normalize_text(c.complaint_text)
        )

        score = max(ai_score, text_score)

        if score >= 0.5:
            results.append({
                "id": c.id,
                "complaint_text": c.complaint_text,
                "created_at": str(c.created_at),
                "similarity": round(score, 2)
            })

    # 🔥 SORT + LIMIT (IMPORTANT)
    results = sorted(results, key=lambda x: x["similarity"], reverse=True)[:5]

    return results