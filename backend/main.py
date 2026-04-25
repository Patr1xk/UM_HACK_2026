from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api import router as workflow_router
from api.screening_api import router as screening_router
from db.sqlite_store import init_db, init_onboarding_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    init_onboarding_tables()
    yield

app = FastAPI(title="HR Workflow Engine API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "HR Workflow Engine API is running."}

app.include_router(workflow_router)
app.include_router(screening_router)