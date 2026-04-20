from uuid import uuid4
from schemas.schemas import ExtractedRequest
from logic.onboarding import ONBOARDING_STEP_MAP, init_onboarding_tables
from db.sqlite_store import save_workflow

def build_workflow(extracted_request: ExtractedRequest) -> dict:
    workflow_id = f"wf_{uuid4().hex[:8]}"

    if extracted_request.workflow_type == "onboarding":
        steps = [
            "create_employee_record",
            "create_laptop_request",
            "create_email_account",
            "create_payroll_setup",
            "request_building_access",
        ]
        status = "in_progress"

    elif extracted_request.workflow_type == "resume_screening":
        steps = [
                "extract_job_requirements",
                "extract_candidate_details",
                "evaluate_candidate_fit",
                "decide_candidate_outcome",
                "schedule_interview",
                "send_candidate_email",
                "create_calendar_event"
            ]
        status = "in_progress"

    else:
        steps = []
        status = "fallback"

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
    }

    return workflow

#Onboarding steps
def execute_onboarding_workflow(workflow: dict) -> dict:
    workflow_type = workflow.get("workflow_type")

    if workflow_type == "unknown":
        workflow["status"] = "fallback"
        workflow["action_logs"].append({
            "step": "fallback",
            "status": "success",
            "message": "Unsupported workflow type. No execution performed."
        })
        save_workflow(workflow)
        return workflow

    if workflow_type == "onboarding":
        init_onboarding_tables()
        step_map = ONBOARDING_STEP_MAP
    else:
        workflow["status"] = "not_implemented"
        workflow["failed_steps"].append({
            "step": "workflow_execution",
            "status": "failed",
            "message": f"Execution for workflow_type='{workflow_type}' is not implemented yet."
        })
        save_workflow(workflow)
        return workflow

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

