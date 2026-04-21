# Grievix AI — AI-Based Complaint Routing System

## Overview

Grievix AI is an intelligent grievance redressal platform that automates complaint intake, classification, prioritization, duplicate detection, routing, and tracking.

The system combines a React frontend, Python/FastAPI backend, machine learning (fine-tuned BERT for complaint classification and semantic similarity), and SQLite for persistence.

It supports role-based workflows for:

* Users (submit and track complaints)
* Officers (manage assigned complaints)
* Administrators (assign, monitor, analyze workload)

---

## Core Features

### AI-Powered Complaint Classification

* Fine-tuned BERT model categorizes complaints into departments
* Automatically predicts routing destination
* Reduces manual triaging

### Priority Detection

* Assigns complaint priority (HIGH / MEDIUM / LOW)
* Helps officers address urgent issues first

### Semantic Similarity / Duplicate Detection

* Detects duplicate or similar complaints
* Prevents redundant submissions from the same user
* Shows similar complaint references while preserving privacy

### Smart Complaint Assignment

* Manual assignment by admin
* Auto-assign based on officer workload balancing

### Role-Based Dashboards

#### User Dashboard

* Submit complaints
* View complaint history
* Search and filter complaints
* View similar complaints
* Submit feedback after resolution

#### Officer Dashboard

* View assigned complaints
* Priority-based sorting
* Update complaint status
* View officer workload context

#### Admin Dashboard

* Complaint analytics
* Officer workload monitoring
* Manual reassignment
* Auto assignment engine
* Complaint search and filters

### Analytics & Insights

* Pending / Resolved / Assigned metrics
* Complaint distribution charts
* Officer workload visibility

### Authentication & Access Control

* Role-based login (User / Officer / Admin)
* JWT authentication
* Protected routes

---

## Tech Stack

### Frontend

* React
* React Router
* Axios
* Tailwind CSS
* Recharts

### Backend

* Python
* FastAPI
* SQLAlchemy
* JWT Authentication

### Machine Learning

* Fine-tuned BERT
* Semantic similarity engine

### Database

* SQLite3 (current)

---

## Project Structure (Example)

```bash
frontend/
  src/
    pages/
    components/
    api.js

backend/
  app/
    main.py
    models.py
    database.py
    routes/
      auth.py
      complaints.py
      admin.py
      officer.py
```

---

## Installation

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

### Backend (.env)

```env
SECRET_KEY=your_secret
DATABASE_URL=sqlite:///./grievance.db
```

---