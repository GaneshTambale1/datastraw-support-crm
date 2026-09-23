from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.api.tickets import router as tickets_router
from app.core.database import Base, engine


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Datastraw Support CRM API",
    description="Backend API for the Customer Support Ticketing CRM",
    version="1.0.0",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://miraculous-truth-production-8590.up.railway.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(tickets_router)


@app.get("/")
def root():
    return {
        "message": "Datastraw Support CRM API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }