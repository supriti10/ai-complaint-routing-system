from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint, User
from app.auth import get_current_officer

router = APIRouter(prefix="/officer", tags=["Officer"])

# ✅ Get ALL complaints (for officer)
@router.get("/complaints")
def get_assigned_complaints(
    db: Session = Depends(get_db),
    user=Depends(get_current_officer)
):
    officer_id = int(user.get("sub"))

    from app.models import Complaint, User

    # 🔥 JOIN WITH USER TABLE
    assigned = db.query(Complaint, User).join(
        User, Complaint.user_id == User.id
    ).filter(
        Complaint.assigned_to == officer_id
    ).order_by(Complaint.id.desc()).all()

    unassigned = db.query(Complaint, User).join(
        User, Complaint.user_id == User.id
    ).filter(
        Complaint.assigned_to == None
    ).order_by(Complaint.id.desc()).all()

    # 🔥 SERIALIZER
    def serialize(c, u):
        return {
            "id": c.id,
            "complaint_text": c.complaint_text,
            "predicted_department": c.predicted_department,
            "priority": c.priority,
            "status": c.status,
            "user_id": c.user_id,
            "username": u.name,   # ⚠️ change to u.username if needed
            "created_at": str(c.created_at)
        }

    # 🔥 FINAL RESPONSE
    return {
        "assigned": [serialize(c, u) for c, u in assigned],
        "unassigned": [serialize(c, u) for c, u in unassigned]
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