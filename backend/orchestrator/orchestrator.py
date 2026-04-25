from uuid import uuid4
from schemas.schemas import ExtractedRequest
from logic.onboarding import ONBOARDING_STEP_MAP
from glm.extractor import decide_onboarding_steps, validate_step_output, glm_reason_next_action
from db.sqlite_store import save_workflow


def build_workflow(extracted_request: ExtractedRequest) -> dict:
    """Build a workflow from extracted request, using GLM to decide steps for onboarding."""
    workflow_id = f"wf_{uuid4().hex[:8]}"
    steps = []
    status = "not_implemented"

    # Debug: Log extracted request
    print(f"[DEBUG] Extracted request: workflow_type={extracted_request.workflow_type}")
    print(f"[DEBUG] Entities: {extracted_request.entities}")
    print(f"[DEBUG] Missing fields: {extracted_request.missing_fields}")

    if extracted_request.workflow_type == "onboarding":
        status = "in_progress"
        # Only decide steps if we have all required fields
        # If missing fields exist, we'll decide steps after clarification
        if not extracted_request.missing_fields:
            steps = decide_onboarding_steps(extracted_request.entities.model_dump())
            print(f"[DEBUG] Decided steps: {steps}")
        else:
            steps = []  # Don't decide steps until clarification provided
            print(f"[DEBUG] Missing fields detected, skipping step decision")
            status = "awaiting_clarification"

    workflow = {
        "workflow_id": workflow_id,
        "workflow_type": extracted_request.workflow_type,
        "status": status,
        "intent_summary": extracted_request.intent_summary,
        "confidence": extracted_request.confidence,
        "entities": extracted_request.entities.model_dump(),
        "missing_fields": extracted_request.missing_fields,
        "next_action": extracted_request.next_action,
        "steps": steps,
        "current_step_index": 0,
        "completed_steps": [],
        "failed_steps": [],
        "runtime_data": {},
        "action_logs": [],
        "clarification": {},
        "user_clarification": {},
    }

    return workflow


def execute_onboarding_workflow(workflow: dict) -> dict:
    """Execute onboarding workflow with GLM-driven reasoning at each step."""
    workflow_type = workflow.get("workflow_type")

    # Handle unknown workflow types
    if workflow_type == "unknown":
        workflow["status"] = "not_implemented"
        workflow["action_logs"].append({
            "step": "workflow_dispatch",
            "status": "skipped",
            "message": "Unknown workflow type. Execution skipped."
        })
        save_workflow(workflow)
        return workflow

    # Handle non-onboarding workflows (resume_screening not yet implemented)
    if workflow_type != "onboarding":
        workflow["status"] = "not_implemented"
        workflow["action_logs"].append({
            "step": "workflow_dispatch",
            "status": "skipped",
            "message": f"Workflow type '{workflow_type}' is not yet implemented."
        })
        save_workflow(workflow)
        return workflow

    # Execute onboarding workflow
    step_map = ONBOARDING_STEP_MAP
    workflow["status"] = "in_progress"
    save_workflow(workflow)

    steps = workflow.get("steps", [])

    for index in range(workflow.get("current_step_index", 0), len(steps)):
        step_name = steps[index]

        if step_name not in step_map:
            workflow["status"] = "failed"
            workflow["failed_steps"].append({
                "step": step_name,
                "status": "failed",
                "message": f"No logic function found for step '{step_name}'."
            })
            save_workflow(workflow)
            return workflow

        step_function = step_map[step_name]

        try:
            result = step_function(workflow)

            runtime_updates = result.get("runtime_updates", {})
            if runtime_updates:
                workflow["runtime_data"].update(runtime_updates)

            # Always proceed to next step (no GLM pause logic)
            workflow["completed_steps"].append(result)
            workflow["action_logs"].append(result)
            workflow["current_step_index"] = index + 1

            save_workflow(workflow)

        except Exception as e:
            workflow["status"] = "failed"
            workflow["failed_steps"].append({
                "step": step_name,
                "status": "failed",
                "message": str(e)
            })
            workflow["action_logs"].append({
                "step": step_name,
                "status": "failed",
                "message": str(e)
            })
            save_workflow(workflow)
            return workflow

    workflow["status"] = "completed"
    save_workflow(workflow)
    return workflow

