from fastapi import FastAPI
from app.routes import complaints, admin, officer
from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Grievance Redressal System",
    description="Complaint Management System with AI Department Routing",
    version="1.0"
)

# Include routers
app.include_router(complaints.router)
app.include_router(admin.router)
app.include_router(officer.router)