from glm.extractor import extract_request, generate_clarification, merge_partial_entities, decide_onboarding_steps
from schemas.schemas import ExtractedRequest
from orchestrator.orchestrator import build_workflow, execute_onboarding_workflow
from db.sqlite_store import save_workflow, get_workflow, list_workflows
from logic.screening import (
    init_screening_tables,
    get_all_roles,
    get_role_by_name,
    upsert_role,
    get_screening_results_by_workflow,
    save_screening_result,
    parse_resume,
    extract_candidate_details,
    evaluate_candidate_fit,
    decide_candidate_outcome,
    schedule_interview,
    send_candidate_email,
    create_calendar_event,
)

# ---------------------------------------------------------------------------
# Onboarding Services
# ---------------------------------------------------------------------------

ONBOARDING_REQUIRED_FIELDS = ["employee_name", "department", "start_date"]


def process_user_request(user_message: str) -> ExtractedRequest:
    """Process initial HR request and extract workflow intent."""
    if not user_message or not user_message.strip():
        raise ValueError("User message cannot be empty.")

    raw_result = extract_request(user_message)
    validated_result = ExtractedRequest.model_validate(raw_result)
    workflow = build_workflow(validated_result)
    save_workflow(workflow)

    if validated_result.workflow_type == "onboarding":
        missing = _check_onboarding_prerequisites(validated_result)
        if missing:
            # Generate clarification request instead of crashing
            clarification = generate_clarification(
                missing, validated_result.entities.model_dump()
            )
            workflow["status"] = "awaiting_clarification"
            workflow["clarification"] = {
                "missing_fields": missing,
                "question": clarification
            }
            save_workflow(workflow)
            return workflow

    workflow = execute_onboarding_workflow(workflow)
    return workflow


def resume_workflow_with_clarification(workflow_id: str, user_response: str) -> dict:
    """Resume a workflow with user-provided clarification."""
    if not user_response or not user_response.strip():
        raise ValueError("Clarification response cannot be empty.")

    workflow = get_workflow(workflow_id)
    if not workflow:
        raise ValueError(f"Workflow {workflow_id} not found.")

    if workflow["status"] != "awaiting_clarification":
        raise ValueError(f"Workflow {workflow_id} is not awaiting clarification (status: {workflow['status']}).")

    # Use GLM to merge the user's clarification response with existing entities
    missing_fields = workflow.get("clarification", {}).get("missing_fields", [])
    merged_entities = merge_partial_entities(
        missing_fields,
        workflow["entities"],
        user_response
    )

    # Update workflow with merged entities
    workflow["entities"] = merged_entities
    workflow["user_clarification"] = {
        "original_question": workflow.get("clarification", {}).get("question"),
        "user_response": user_response
    }

    # Re-check prerequisites
    extracted = ExtractedRequest.model_validate({
        "workflow_type": workflow["workflow_type"],
        "intent_summary": workflow["intent_summary"],
        "confidence": workflow["confidence"],
        "entities": merged_entities,
        "missing_fields": [],
        "next_action": workflow["next_action"]
    })

    missing = _check_onboarding_prerequisites(extracted)
    if missing:
        # Still missing required fields - ask again
        clarification = generate_clarification(missing, merged_entities)
        workflow["status"] = "awaiting_clarification"
        workflow["clarification"] = {
            "missing_fields": missing,
            "question": clarification
        }
        workflow["steps"] = []  # Keep steps empty until clarification complete
        save_workflow(workflow)
        return workflow
    
    # Decide steps now that we have complete data
    workflow["steps"] = decide_onboarding_steps(merged_entities)
    workflow["status"] = "in_progress"
    workflow["clarification"] = {}  # Clear clarification
    save_workflow(workflow)

    workflow = execute_onboarding_workflow(workflow)
    return workflow


def _check_onboarding_prerequisites(extracted: ExtractedRequest) -> list[str]:
    """Check if required onboarding fields are present and non-empty."""
    missing = []
    entities = extracted.entities
    if not entities.employee_name or not entities.employee_name.strip():
        missing.append("employee_name")
    if not entities.department or not entities.department.strip():
        missing.append("department")
    if not entities.start_date or not entities.start_date.strip():
        missing.append("start_date")
    return missing


def fetch_workflow(workflow_id: str):
    """Fetch workflow by ID."""
    return get_workflow(workflow_id)


def fetch_workflows(workflow_type: str = None, status: str = None) -> list[dict]:
    """Fetch all workflows, optionally filtered by type and status."""
    return list_workflows(workflow_type, status)


# ---------------------------------------------------------------------------
# Screening Services
# ---------------------------------------------------------------------------

def run_screening(
    workflow_id: str,
    pdf_path: str,
    role_name: str,
    role_overrides: dict = None
) -> dict:
    """
    Run the complete 7-step resume screening pipeline:
    1. Parse resume (extract text from PDF)
    2. Extract candidate details
    3. Evaluate candidate fit
    4. Decide candidate outcome
    5. Schedule interview (if approved)
    6. Send candidate email
    7. Create calendar event
    
    Args:
        workflow_id: Unique identifier for this screening workflow
        pdf_path: Absolute path to the resume PDF file
        role_name: Name of the role to screen for
        role_overrides: Optional dict with role overrides (required_skills, min_experience_years, etc)
    
    Returns:
        dict: Complete workflow with all screening results
    """
    init_screening_tables()
    
    # Get role and apply overrides if provided
    role = get_role_by_name(role_name)
    if not role:
        raise ValueError(f"Role '{role_name}' not found.")
    
    if role_overrides:
        role = upsert_role(role_name, role_overrides)
    
    # Initialize workflow structure
    workflow = {
        "workflow_id": workflow_id,
        "workflow_type": "resume_screening",
        "status": "in_progress",
        "intent_summary": f"Screen resume for {role_name}",
        "confidence": 1.0,
        "entities": {
            "job_role": role_name,
            "required_skills": role["required_skills"],
            "minimum_experience_years": role["min_experience_years"],
        },
        "missing_fields": [],
        "next_action": "create_resume_screening_workflow",
        "steps": [
            "parse_resume",
            "extract_candidate_details",
            "evaluate_candidate_fit",
            "decide_candidate_outcome",
            "schedule_interview",
            "send_candidate_email",
            "create_calendar_event",
        ],
        "current_step_index": 0,
        "completed_steps": [],
        "failed_steps": [],
        "runtime_data": {
            "pdf_path": pdf_path,
            "role_name": role_name,
        },
    }
    
    save_workflow(workflow)
    
    # Step 1: Parse Resume
    try:
        result = parse_resume(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "parse_resume", "message": result.get("message")})
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("parse_resume")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "parse_resume", "message": str(e)})
        save_workflow(workflow)
        raise
    
    # Step 2: Extract Candidate Details
    try:
        result = extract_candidate_details(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "extract_candidate_details", "message": result.get("message")})
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("extract_candidate_details")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "extract_candidate_details", "message": str(e)})
        save_workflow(workflow)
        raise
    
    # Step 3: Evaluate Fit
    try:
        result = evaluate_candidate_fit(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "evaluate_candidate_fit", "message": result.get("message")})
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("evaluate_candidate_fit")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "evaluate_candidate_fit", "message": str(e)})
        save_workflow(workflow)
        raise
    
    # Step 4: Decide Outcome
    try:
        result = decide_candidate_outcome(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "decide_candidate_outcome", "message": result.get("message")})
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("decide_candidate_outcome")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "decide_candidate_outcome", "message": str(e)})
        save_workflow(workflow)
        raise
    
    # Step 5: Schedule Interview (skip if not approved)
    try:
        result = schedule_interview(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "schedule_interview", "message": result.get("message")})
        elif result.get("status") == "skipped":
            workflow["completed_steps"].append("schedule_interview (skipped)")
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("schedule_interview")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "schedule_interview", "message": str(e)})
        save_workflow(workflow)
    
    # Step 6: Send Email
    try:
        result = send_candidate_email(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "send_candidate_email", "message": result.get("message")})
        elif result.get("status") == "skipped":
            workflow["completed_steps"].append("send_candidate_email (skipped)")
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("send_candidate_email")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "send_candidate_email", "message": str(e)})
        save_workflow(workflow)
    
    # Step 7: Create Calendar Event
    try:
        result = create_calendar_event(workflow)
        if result.get("status") == "failed":
            workflow["failed_steps"].append({"step": "create_calendar_event", "message": result.get("message")})
        elif result.get("status") == "skipped":
            workflow["completed_steps"].append("create_calendar_event (skipped)")
        else:
            workflow.setdefault("runtime_data", {}).update(result.get("runtime_updates", {}))
            workflow["completed_steps"].append("create_calendar_event")
        save_workflow(workflow)
    except Exception as e:
        workflow["failed_steps"].append({"step": "create_calendar_event", "message": str(e)})
        save_workflow(workflow)
    
    # Save screening result
    candidate = workflow.get("runtime_data", {}).get("candidate", {})
    match_breakdown = workflow.get("runtime_data", {}).get("match_breakdown", {})
    decision = workflow.get("runtime_data", {}).get("decision", "Unknown")
    
    screening_result = {
        "workflow_id": workflow_id,
        "candidate_name": candidate.get("name", "Unknown"),
        "candidate_email": candidate.get("email", "Unknown"),
        "resume_filename": pdf_path.split("/")[-1] if "/" in pdf_path else pdf_path.split("\\")[-1],
        "role_name": role_name,
        "match_score": match_breakdown.get("match_score", 0),
        "match_breakdown_json": str(match_breakdown),
        "status": decision,
    }
    save_screening_result(screening_result)
    
    workflow["status"] = "completed"
    save_workflow(workflow)
    
    return workflow


def fetch_screening_results(workflow_id: str) -> list:
    """Fetch all screening results for a given workflow ID."""
    return get_screening_results_by_workflow(workflow_id)


def fetch_roles() -> list:
    """Fetch all available roles."""
    return get_all_roles()


def fetch_role(role_name: str) -> dict:
    """Fetch a specific role by name."""
    return get_role_by_name(role_name)


def update_role(role_name: str, overrides: dict) -> dict:
    """Update or override a role with new requirements."""
    return upsert_role(role_name, overrides)