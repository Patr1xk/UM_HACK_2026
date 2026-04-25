from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from services.services import process_user_request, fetch_workflow, fetch_workflows, resume_workflow_with_clarification

router = APIRouter(prefix="/workflow", tags=["workflow"])


class WorkflowStartRequest(BaseModel):
    message: str


class ClarificationResponse(BaseModel):
    workflow_id: str
    clarification_response: str


@router.post("/start")
def start_workflow(payload: WorkflowStartRequest):
    try:
        return process_user_request(payload.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_all_workflows(workflow_type: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    """List all workflows, optionally filtered by type and/or status."""
    return fetch_workflows(workflow_type, status)


@router.post("/clarify")
def submit_clarification(payload: ClarificationResponse):
    """Resume a workflow that was awaiting clarification input."""
    try:
        return resume_workflow_with_clarification(payload.workflow_id, payload.clarification_response)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{workflow_id}")
def get_workflow_by_id(workflow_id: str):
    workflow = fetch_workflow(workflow_id)

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found.")

    return workflow