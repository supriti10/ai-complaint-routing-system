from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint
from app.auth import get_current_officer

router = APIRouter(prefix="/officer", tags=["Officer"])

# ✅ Get ALL complaints (for officer)
@router.get("/complaints")
def get_assigned_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_officer)
):
    officer_id = int(user.get("sub"))

    # 🔥 Assigned complaints
    assigned = db.query(Complaint).filter(
        Complaint.assigned_to == officer_id
    ).order_by(Complaint.id.desc()).all()

    # 🔥 Unassigned complaints
    unassigned = db.query(Complaint).filter(
        Complaint.assigned_to == None
    ).order_by(Complaint.id.desc()).all()

    return {
        "assigned": [
            {
                "id": c.id,
                "complaint_text": c.complaint_text,
                "predicted_department": c.predicted_department,
                "priority": c.priority,
                "status": c.status,
            }
            for c in assigned
        ],
        "unassigned": [
            {
                "id": c.id,
                "complaint_text": c.complaint_text,
                "predicted_department": c.predicted_department,
                "priority": c.priority,
                "status": c.status,
            }
            for c in unassigned
        ]
    }


# ✅ Update complaint
@router.put("/complaints/{complaint_id}")
def update_status(
    complaint_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_officer)
):

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

#Officer takes a complaint (assigns to self)
@router.put("/take/{complaint_id}")
def take_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_officer)
):
    officer_id = int(user.get("sub"))

    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        return {"error": "Complaint not found"}

    # 🔥 prevent stealing
    if complaint.assigned_to is not None:
        return {"error": "Already assigned"}

    complaint.assigned_to = officer_id
    db.commit()

    return {
        "message": "Complaint assigned to you",
        "complaint_id": complaint_id
    }