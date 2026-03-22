from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Complaint, User
from app.auth import get_current_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# ✅ Get all complaints
@router.get("/complaints")
def get_all_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_admin)
):
    complaints = db.query(Complaint).order_by(Complaint.id.desc()).all()

    return [
        {
            "id": c.id,
            "complaint_text": c.complaint_text,
            "predicted_department": c.predicted_department,
            "priority": c.priority,
            "status": c.status,
            "user_id": c.user_id,
            "assigned_to": c.assigned_to,   # 🔥 IMPORTANT (added)
            "assigned_officer": (
                db.query(User).filter(User.id == c.assigned_to).first().name
                if c.assigned_to else None
            ),
            "created_at": str(c.created_at)
        }
        for c in complaints
    ]


# ✅ Admin update (full control)
@router.put("/complaints/{complaint_id}")
def update_status(
    complaint_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_admin)
):
    ALLOWED = ["Pending", "In Progress", "Resolved"]

    if status not in ALLOWED:
        return {"error": "Invalid status"}

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {"error": "Complaint not found"}

    complaint.status = status
    db.commit()

    return {
        "message": "Status updated",
        "complaint_id": complaint_id,
        "new_status": status
    }


# ✅ Stats dashboard
@router.get("/stats/all")
def all_stats(
    db: Session = Depends(get_db),
    user=Depends(get_current_admin)
):
    total = db.query(func.count(Complaint.id)).scalar()

    dept = db.query(
        Complaint.predicted_department,
        func.count(Complaint.id)
    ).group_by(Complaint.predicted_department).all()

    priority = db.query(
        Complaint.priority,
        func.count(Complaint.id)
    ).group_by(Complaint.priority).all()

    status = db.query(
        Complaint.status,
        func.count(Complaint.id)
    ).group_by(Complaint.status).all()

    return {
        "total": total,
        "department": [{"name": d, "count": c} for d, c in dept],
        "priority": [{"name": p, "count": c} for p, c in priority],
        "status": [{"name": s, "count": c} for s, c in status],
    }


# ✅ Get all officers
@router.get("/officers")
def get_officers(
    db: Session = Depends(get_db),
    user=Depends(get_current_admin)   # 🔥 SECURED
):
    officers = db.query(User).filter(User.role == "officer").all()

    return [
        {
            "id": o.id,
            "username": o.name
        }
        for o in officers
    ]


# ✅ Assign complaint to officer
@router.put("/assign")
def assign_complaint(
    complaint_id: int,
    officer_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_admin)   # 🔥 SECURED
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {"error": "Complaint not found"}

    officer = db.query(User).filter(
        User.id == officer_id,
        User.role == "officer"
    ).first()

    if not officer:
        return {"error": "Invalid officer"}

    complaint.assigned_to = officer_id
    db.commit()

    return {
        "message": "Assigned successfully",
        "complaint_id": complaint_id,
        "assigned_to": officer_id
    }