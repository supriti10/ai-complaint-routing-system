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


# ✅ Submit complaint (AI + FIXED MATCHING)
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

    # 🔍 Similarity check
    similar_text, score = find_similar_complaint(
        complaint.complaint_text,
        texts
    )

    # 🔥 FIXED MATCH (NO NULL ID BUG)
    existing_match = next(
        (c for c in existing if c.complaint_text == similar_text),
        None
    ) if similar_text else None

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

    # 🔥 RESPONSE LOGIC (CONSISTENT)
    return {
        "message": "Complaint submitted successfully",
        "department": department,
        "priority": priority,

        # 🔥 AI OUTPUT
        "duplicate": True if score >= 0.85 else False,
        "warning": True if 0.6 <= score < 0.85 else False,

        "similarity_score": float(score),
        "existing_id": existing_match.id if existing_match else None,

        # 🔥 SYSTEM
        "assigned_to": None
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
    user_id = int(user.get("sub"))

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
            "created_at": str(c.created_at)
        }
        for c in complaints
    ]