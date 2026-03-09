from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(
    prefix="/officer",
    tags=["Officer"]
)

# Get complaints assigned to a department
@router.get("/complaints/{department}")
def get_department_complaints(department: str, db: Session = Depends(get_db)):

    query = text("""
        SELECT * FROM complaints
        WHERE predicted_department = :dept
    """)

    result = db.execute(query, {"dept": department})

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


# Officer updates complaint status
@router.put("/complaints/{complaint_id}")
def update_complaint_status(complaint_id: int, status: str, db: Session = Depends(get_db)):

    query = text("""
        UPDATE complaints
        SET status = :status
        WHERE id = :id
    """)

    result = db.execute(query, {"status": status, "id": complaint_id})
    #db.execute(query, {"status": status, "id": complaint_id})
    db.commit()

    if result.rowcount == 0:
        return {"message": "Complaint not found"}

    return {"message": "Complaint status updated", "id": complaint_id, "new_status": status}