from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Complaint


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ✅ Get all complaints
@router.get("/complaints")
def get_all_complaints(db: Session = Depends(get_db)):

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


# ✅ Update complaint status (admin override)
@router.put("/complaints/{complaint_id}")
def update_status(
    complaint_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db)
):

    ALLOWED_STATUS = ["Pending", "In Progress", "Resolved"]

    if status not in ALLOWED_STATUS:
        return {"error": "Invalid status value"}

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {"error": "Complaint not found"}

    complaint.status = status
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Status updated successfully",
        "complaint_id": complaint_id,
        "new_status": complaint.status
    }


# ✅ Dashboard: Total complaints count
@router.get("/stats/total")
def total_complaints(db: Session = Depends(get_db)):
    count = db.query(func.count(Complaint.id)).scalar()
    return {"total_complaints": count}


# ✅ Dashboard: Department-wise count
@router.get("/stats/department")
def complaints_by_department(db: Session = Depends(get_db)):

    result = db.query(
        Complaint.predicted_department,
        func.count(Complaint.id)
    ).group_by(Complaint.predicted_department).all()

    return [
        {"department": dept, "count": count}
        for dept, count in result
    ]


# ✅ Dashboard: Priority-wise count
@router.get("/stats/priority")
def complaints_by_priority(db: Session = Depends(get_db)):

    result = db.query(
        Complaint.priority,
        func.count(Complaint.id)
    ).group_by(Complaint.priority).all()

    return [
        {"priority": priority, "count": count}
        for priority, count in result
    ]


# ✅ Dashboard: Status-wise count
@router.get("/stats/status")
def complaints_by_status(db: Session = Depends(get_db)):

    result = db.query(
        Complaint.status,
        func.count(Complaint.id)
    ).group_by(Complaint.status).all()

    return [
        {"status": status, "count": count}
        for status, count in result
    ]