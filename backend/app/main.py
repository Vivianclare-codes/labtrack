from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to LabTrack!"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "application": "LabTrack"
    }