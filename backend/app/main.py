from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import complaints, admin, officer, auth
from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Grievance Redressal System",
    description="Complaint Management System with AI Department Routing",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(complaints.router)
app.include_router(admin.router)
app.include_router(officer.router)
app.include_router(auth.router)