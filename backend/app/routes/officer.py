from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint


router = APIRouter(
    prefix="/officer",
    tags=["Officer"]
)


# ✅ Get complaints assigned to a department
@router.get("/complaints/{department}")
def get_department_complaints(
    department: str,
    db: Session = Depends(get_db)
):

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


# ✅ Officer updates complaint status
@router.put("/complaints/{complaint_id}")
def update_status(
    complaint_id: int,
    status: str = Query(..., description="New status (Pending/In Progress/Resolved)"),
    department: str = Query(..., description="Officer's department"),
    db: Session = Depends(get_db)
):

    # 🔍 Fetch complaint
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {"error": "Complaint not found"}

    # 🚫 Check department authorization
    if complaint.predicted_department != department:
        return {"error": "Unauthorized to update this complaint"}

    # ✅ Update status
    complaint.status = status
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Status updated successfully",
        "complaint_id": complaint_id,
        "new_status": complaint.status
    }