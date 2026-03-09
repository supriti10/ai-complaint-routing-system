from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# Get all complaints
@router.get("/complaints")
def get_all_complaints(db: Session = Depends(get_db)):

    query = text("SELECT * FROM complaints")

    result = db.execute(query)

    complaints = []

    for row in result:
        complaints.append({
            "id": row.id,
            "complaint_text": row.complaint_text,
            "predicted_department": row.predicted_department,
            "priority": row.priority,
            "status": row.status,
            "user_id": row.user_id,
            "created_at": str(row.created_at)
        })

    return complaints


# Update complaint status
@router.put("/complaints/{complaint_id}")
def update_status(complaint_id: int, status: str, db: Session = Depends(get_db)):

    query = text("""
        UPDATE complaints
        SET status = :status
        WHERE id = :id
    """)

    db.execute(query, {"status": status, "id": complaint_id})
    db.commit()

    return {"message": "Status updated successfully"}