from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.ml.predict import predict_department
from app.utils.priority import get_priority
from app.schemas import ComplaintCreate, ComplaintResponse
from app.utils.similarity import find_similar_complaint
from app.schemas import StatusUpdate

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)

# Submit complaint
@router.post("/submit")
def submit_complaint(complaint: ComplaintCreate, db: Session = Depends(get_db)):

    # Predict department and priority
    department = predict_department(complaint.complaint_text)
    priority = get_priority(complaint.complaint_text)

    # Fetch existing complaints
    existing_query = text("SELECT complaint_text FROM complaints")
    result = db.execute(existing_query)
    old_texts = [row.complaint_text for row in result]

    # Check similarity
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

    # Insert complaint anyway
    query = text("""
        INSERT INTO complaints
        (complaint_text, predicted_department, priority, status, user_id)
        VALUES
        (:text, :dept, :priority, 'Pending', :user_id)
    """)

    db.execute(query, {
        "text": complaint.complaint_text,
        "dept": department,
        "priority": priority,
        "user_id": complaint.user_id
    })

    db.commit()

    return {
        "message": "Complaint submitted successfully",
        "department": department,
        "priority": priority,
        "duplicate_check": duplicate_warning
    }

# Officer updates complaint status
@router.put("/update-status")
def update_complaint_status(data: StatusUpdate, db: Session = Depends(get_db)):

    query = text("""
        UPDATE complaints
        SET status = :status
        WHERE id = :complaint_id
    """)

    result = db.execute(query, {
        "status": data.status,
        "complaint_id": data.complaint_id
    })

    db.commit()

    if result.rowcount == 0:
        return {"message": "Complaint not found"}

    return {
        "message": "Status updated successfully",
        "complaint_id": data.complaint_id,
        "new_status": data.status
    }

# Get all complaints
@router.get("/")
def get_complaints(db: Session = Depends(get_db)):

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