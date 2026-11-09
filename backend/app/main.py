from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.patients.routes import router as patient_router
from app.database import create_tables
from app.patients.models import Patient
from app.samples.models import Sample
from app.samples.routes import router as sample_router
from app.departments.models import Department
from app.departments.routes import router as department_router
from app.tests.models import Test
from app.tests.routes import router as test_router
from app.test_requests.models import TestRequest
from app.test_requests.routes import router as test_request_router
from app.results.models import Result
from app.results.routes import router as result_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://labtrack-83ud.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
create_tables()

app.include_router(patient_router, prefix="/patients")
app.include_router(sample_router, prefix="/samples")
app.include_router(department_router, prefix="/departments")
app.include_router(test_router, prefix="/tests")
app.include_router(test_request_router, prefix="/test-requests")
app.include_router(result_router, prefix="/results")


@app.get("/")
def home():
    return {"message": "Welcome to LabTrack!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "application": "LabTrack"}
