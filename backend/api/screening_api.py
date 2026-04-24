import os
import shutil

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional

from services.services import (
    run_screening,
    fetch_screening_results,
    fetch_roles,
    fetch_role,
    update_role,
)

router = APIRouter(prefix="/screening", tags=["screening"])

RESUME_UPLOAD_DIR = "uploads/resumes"
os.makedirs(RESUME_UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Roles
# ---------------------------------------------------------------------------

@router.get("/roles")
def list_roles():
    """List all predefined roles and their requirements."""
    return fetch_roles()


@router.get("/roles/{role_name}")
def get_role(role_name: str):
    role = fetch_role(role_name)
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found.")
    return role


class RoleOverrideRequest(BaseModel):
    required_skills: Optional[list[str]] = None
    min_experience_years: Optional[int] = None
    max_experience_years: Optional[int] = None
    qualifications: Optional[list[str]] = None
    languages: Optional[list[str]] = None


@router.post("/roles/{role_name}")
def override_role(role_name: str, payload: RoleOverrideRequest):
    """
    HR can extend or overwrite role requirements.
    Duplicate skills/qualifications are deduped — latest value wins.
    """
    overrides = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = update_role(role_name, overrides)
    return {"message": f"Role '{role_name}' updated.", "role": updated}


# ---------------------------------------------------------------------------
# Screening Pipeline
# ---------------------------------------------------------------------------

@router.post("/run")
async def run_screening_pipeline(
    workflow_id: str = Form(...),
    role_name: str = Form(...),
    resume: UploadFile = File(...),
    extra_skills: Optional[str] = Form(None),
    min_experience_years: Optional[int] = Form(None),
):
    """
    Upload a resume PDF and run the full 7-step screening pipeline.

    Form fields:
        workflow_id           — workflow ID to associate results with
        role_name             — role to screen against
        resume                — PDF file upload
        extra_skills          — (optional) comma-separated additional skills to require
        min_experience_years  — (optional) override minimum years of experience
    """
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    save_path = os.path.join(RESUME_UPLOAD_DIR, resume.filename)
    with open(save_path, "wb") as f:
        shutil.copyfileobj(resume.file, f)

    # Build optional HR overrides
    overrides = {}
    if extra_skills:
        overrides["required_skills"] = [s.strip() for s in extra_skills.split(",") if s.strip()]
    if min_experience_years is not None:
        overrides["min_experience_years"] = min_experience_years

    try:
        result = run_screening(
            workflow_id=workflow_id,
            pdf_path=os.path.abspath(save_path),
            role_name=role_name,
            role_overrides=overrides if overrides else None,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{workflow_id}")
def get_results(workflow_id: str):
    """Fetch all screening results stored for a given workflow ID."""
    results = fetch_screening_results(workflow_id)
    if not results:
        raise HTTPException(status_code=404, detail="No screening results found for this workflow ID.")
    return results
