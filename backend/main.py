from fastapi import FastAPI

from api.api import router as workflow_router
from db.sqlite_store import init_db

app = FastAPI(title="HR Workflow Engine API")


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return {"message": "HR Workflow Engine API is running."}


app.include_router(workflow_router)