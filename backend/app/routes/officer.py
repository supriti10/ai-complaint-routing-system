from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint
from app.auth import get_current_officer


router = APIRouter(
    prefix="/officer",
    tags=["Officer"]
)


# ✅ Get complaints for officer's department
@router.get("/complaints")
def get_department_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_officer)
):

    department = user.get("department")  # 🔥 from JWT

    complaints = db.query(Complaint).filter(
        Complaint.predicted_department == department
    ).order_by(Complaint.id.desc()).all()

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


# ✅ Update complaint (only own dept)
@router.put("/complaints/{complaint_id}")
def update_status(
    complaint_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_officer)
):

    department = user.get("department")

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {"error": "Complaint not found"}

    if complaint.predicted_department != department:
        return {"error": "Unauthorized"}

    complaint.status = status
    db.commit()

    return {
        "message": "Status updated",
        "complaint_id": complaint_id,
        "new_status": status
    }