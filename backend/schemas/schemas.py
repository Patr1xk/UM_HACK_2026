from typing import Literal
from pydantic import BaseModel, Field


class WorkflowEntities(BaseModel):
    #Onboarding
    employee_name: str = ""
    department: str = ""
    start_date: str = ""
    resources_needed: list[str] = Field(default_factory=list)

    #Resume Screening
    job_role: str = ""
    required_skills: list[str] = Field(default_factory=list)
    minimum_experience_years: int = 0
    candidate_count: int = 0
    requirement_source: Literal["job_description", "inferred_default", "unknown"] = "unknown"
    job_description_provided: bool = False


class ExtractedRequest(BaseModel):
    workflow_type: Literal["onboarding", "resume_screening", "unknown"]
    intent_summary: str
    confidence: float
    entities: WorkflowEntities
    missing_fields: list[str] = Field(default_factory=list)
    next_action: Literal[
        "create_onboarding_workflow",
        "create_resume_screening_workflow",
        "fallback",
    ]