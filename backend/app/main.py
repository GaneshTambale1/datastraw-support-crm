from fastapi import FastAPI

from app import models
from app.api.tickets import router as tickets_router
from app.core.database import Base, engine


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Datastraw Support CRM API",
    description="Backend API for the Customer Support Ticketing CRM",
    version="1.0.0",
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