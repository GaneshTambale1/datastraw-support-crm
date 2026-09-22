from fastapi import FastAPI

app = FastAPI(
    title="Datastraw Support CRM API",
    description="Backend API for the Customer Support Ticketing CRM",
    version="1.0.0",
)


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