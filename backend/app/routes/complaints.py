from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.predict import predict_department
from app.utils.priority import get_priority
from app.utils.similarity import find_similar_complaint

from app.schemas import ComplaintCreate, StatusUpdate
from app.models import Complaint


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


# ✅ Submit complaint
@router.post("/submit")
def submit_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):

    # 🔮 Predict department & priority
    department = predict_department(complaint.complaint_text)
    priority = get_priority(complaint.complaint_text)

    # 📥 Fetch existing complaints (ORM)
    existing_complaints = db.query(Complaint.complaint_text).all()
    old_texts = [c[0] for c in existing_complaints]

    # 🔍 Check similarity
    index, score = find_similar_complaint(
        complaint.complaint_text,
        old_texts
    )

    duplicate_warning = None

    if score > 0.85:
        duplicate_warning = {
            "message": "Similar complaint already exists",
            "similarity_score": float(score)
        }

    # 💾 Save complaint (ORM way)
    new_complaint = Complaint(
        complaint_text=complaint.complaint_text,
        predicted_department=department,
        priority=priority,
        status="Pending",
        user_id=complaint.user_id
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return {
        "message": "Complaint submitted successfully",
        "department": department,
        "priority": priority,
        "duplicate_check": duplicate_warning
    }


# ✅ Update complaint status
@router.put("/update-status")
def update_complaint_status(data: StatusUpdate, db: Session = Depends(get_db)):

    complaint = db.query(Complaint).filter(Complaint.id == data.complaint_id).first()

    if not complaint:
        return {"message": "Complaint not found"}

    complaint.status = data.status
    db.commit()

    return {
        "message": "Status updated successfully",
        "complaint_id": data.complaint_id,
        "new_status": data.status
    }


# ✅ Get all complaints
@router.get("/")
def get_complaints(db: Session = Depends(get_db)):

    complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()

    return [
        {
            "id": c.id,
            "complaint_text": c.complaint_text,
            "predicted_department": c.predicted_department,
            "priority": c.priority,
            "status": c.status,
            "user_id": c.user_id,
            "created_at": str(c.created_at)
        }
        for c in complaints
    ]