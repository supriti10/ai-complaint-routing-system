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


# ✅ Submit complaint (AI DUPLICATE DETECTION)
@router.post("/submit")
def submit_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user)
):

    department = predict_department(complaint.complaint_text)
    priority = get_priority(complaint.complaint_text)

    # 🔍 Similarity check
    existing = db.query(Complaint).all()
    old_texts = [c.complaint_text for c in existing]

    similar_text, score = find_similar_complaint(
        complaint.complaint_text,
        old_texts
    )

    existing_match = db.query(Complaint).filter(
        Complaint.complaint_text == similar_text
    ).first() if similar_text else None

    # 🔥 ALWAYS SAVE (IMPORTANT FIX)
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
    if score >= 0.85:
        return {
            "message": "Complaint submitted (duplicate detected)",
            "department": department,
            "priority": priority,
            "duplicate": True,
            "existing_id": existing_match.id if existing_match else None,
            "similarity_score": float(score)
        }

    elif score >= 0.6:
        return {
            "message": "Complaint submitted (similar found)",
            "department": department,
            "priority": priority,
            "duplicate": False,
            "warning": True,
            "similarity_score": float(score),
            "existing_id": existing_match.id if existing_match else None
        }

    else:
        return {
            "message": "Complaint submitted successfully",
            "department": department,
            "priority": priority,
            "duplicate": False,
            "similarity_score": float(score),
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