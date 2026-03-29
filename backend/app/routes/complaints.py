from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.predict import predict_department
from app.utils.priority import get_priority
from app.utils.similarity import find_similar_complaint

from app.schemas import ComplaintCreate, StatusUpdate
from app.models import Complaint
from app.auth import get_current_active_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])


# ✅ Submit complaint (AI + FIXED + SAFE)
@router.post("/submit")
def submit_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user)
):

    # 🔮 Predictions
    department = predict_department(complaint.complaint_text)
    priority = get_priority(complaint.complaint_text)

    # 🔍 Fetch all complaints
    existing = db.query(Complaint).all()
    texts = [c.complaint_text for c in existing]

    # 🔍 Similarity check (SAFE VERSION)
    # if not texts:
    #     score = 0
    #     existing_match = None
    # else:
    #     score, best_index = find_similar_complaint(
    #         complaint.complaint_text,
    #         texts
    #     )

    #     if (
    #         best_index is not None
    #         and isinstance(best_index, int)
    #         and 0 <= best_index < len(existing)
    #         and score >= 0.6
    #     ):
    #         existing_match = existing[best_index]
    #     else:
    #         existing_match = None

    #     print("DEBUG → score:", score, "index:", best_index, "total:", len(existing))

    # 💾 ALWAYS SAVE (IMPORTANT)
    new_complaint = Complaint(
        complaint_text=complaint.complaint_text,
        predicted_department=department,
        priority=priority,
        status="Pending",
        user_id=int(user.get("sub")),
        assigned_to=None
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    # 🔥 RESPONSE LOGIC
    return {
        "message": "Complaint submitted successfully",
        "department": department,
        "priority": priority,

    #     # 🔥 AI OUTPUT
    #     "duplicate": True if score >= 0.85 else False,
    #     "warning": True if 0.6 <= score < 0.85 else False,

    #     "similarity_score": float(score),
    #     "existing_id": existing_match.id if existing_match else None,

    #     # 🔥 SYSTEM
    #     "assigned_to": None
    }


# ✅ Update complaint status
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


# ✅ Get user's own complaints
@router.get("/my")
def get_complaints(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_active_user)
):
    # user_id = int(user.get("sub"))
    user_id = int(user["sub"]) if user and "sub" in user else None

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


# ✅ Feedback system
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