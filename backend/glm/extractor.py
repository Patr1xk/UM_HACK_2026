import json
from glm.client import GLMClient

glm_client = GLMClient(model="ilmu-glm-5.1")


def _parse_json_text(text: str) -> dict:
    cleaned = text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.removeprefix("```json").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```").strip()
    if cleaned.endswith("```"):
        cleaned = cleaned.removesuffix("```").strip()

    return json.loads(cleaned)


def extract_request(user_message: str) -> dict:
    system_message = """
                        You are an HR workflow extraction engine.

                        Your job is to read any raw user request and convert it into ONE structured JSON object.

                        Return ONLY valid JSON.
                        Do not explain anything.
                        Do not use markdown.
                        Do not wrap the JSON in backticks.

                        Return exactly this JSON shape:
                        {
                            "workflow_type": "onboarding | resume_screening | unknown",
                            "intent_summary": "string",
                            "confidence": 0.0,
                            "entities": {
                                "employee_name": "string",
                                "department": "string",
                                "start_date": "string",
                                "resources_needed": ["string"],
                                "job_role": "string",
                                "required_skills": ["string"],
                                "minimum_experience_years": 0,
                                "candidate_count": 0,
                                "requirement_source": "job_description | inferred_default | unknown",
                                "job_description_provided": false
                            },
                            "missing_fields": ["string"],
                            "next_action": "create_onboarding_workflow | create_resume_screening_workflow | fallback"
                        }

                        Rules:
                        - If the request is about onboarding a new employee, set workflow_type to "onboarding"
                        - If the request is about screening, ranking, or processing resumes/candidates, set workflow_type to "resume_screening"
                        - Otherwise set workflow_type to "unknown"

                        Onboarding rules:
                        - Extract onboarding-related details only
                        - Fill employee_name, department, start_date, resources_needed if clearly present
                        - Use empty string or empty array for unknown values
                        - next_action must be "create_onboarding_workflow"

                        Resume screening rules:
                        - Extract job_role if clearly present
                        - Extract candidate_count if clearly present
                        - If a job description or explicit requirements are provided, extract them into required_skills and minimum_experience_years
                        - If only a role is provided (example: "Data Analyst") and no job description is given, infer a reasonable default baseline for that role
                        - In that case, set:
                        - requirement_source = "inferred_default"
                        - job_description_provided = false
                        - If actual job description or explicit requirements are given, set:
                        - requirement_source = "job_description"
                        - job_description_provided = true
                        - If role/requirements are unclear, use "unknown"
                        - next_action must be "create_resume_screening_workflow"

                        Unknown rules:
                        - Leave entity values empty or 0
                        - requirement_source = "unknown"
                        - job_description_provided = false
                        - next_action must be "fallback"

                        General rules:
                        - Only extract values clearly supported by the user input, except inferred default role requirements for resume screening
                        - Do not invent unnecessary enterprise-only fields
                        - confidence must be between 0 and 1
                    """

    text = glm_client.chat(
        user_message=user_message,
        system_message=system_message,
        max_tokens=1000,
        temperature=0.0,
    )

    return _parse_json_text(text)


def generate_clarification(missing_fields: list[str], partial_entities: dict) -> str:
    """Generate a clarification question for missing fields."""
    fields_str = ", ".join(missing_fields)
    
    # Map field names to user-friendly labels
    field_labels = {
        "employee_name": "employee name",
        "department": "department",
        "start_date": "start date",
        "resources_needed": "resources needed",
        "job_role": "job role"
    }
    
    friendly_fields = [field_labels.get(f, f) for f in missing_fields]
    friendly_fields_str = ", ".join(friendly_fields)

    system_message = (
        "You are an HR workflow assistant. The system has started an onboarding request but is missing "
        "some required information. Generate a direct, professional follow-up question asking the HR user "
        "for the missing fields. Do NOT address the employee by name. Keep it simple and direct. "
        "Reply in plain text only, no JSON. Be concise - 1 sentence max."
    )

    user_message = (
        f"Employee name already provided: {partial_entities.get('employee_name', 'N/A')}\n"
        f"Missing fields: {friendly_fields_str}\n\n"
        "Ask the HR user for these missing details in a direct, professional way."
    )

    response = glm_client.chat(
        user_message=user_message,
        system_message=system_message,
        max_tokens=1000,
        temperature=0.1,
    )
    
    # Return response or provide fallback if empty
    if response and response.strip():
        return response.strip()
    else:
        # Fallback: simple, direct question
        return f"Please provide the following information: {friendly_fields_str}."


def decide_onboarding_steps(entities: dict) -> list[str]:
    """Use GLM to decide which onboarding steps to run based on extracted resources_needed."""
    resources = entities.get("resources_needed", [])

    system_message = (
        "You are an HR workflow engine. Given the extracted onboarding entities, "
        "decide which onboarding steps to execute. Available steps: "
        "create_employee_record, create_laptop_request, create_email_account, "
        "create_payroll_setup, request_building_access. "
        "create_employee_record is ALWAYS required and must be first. "
        "Return ONLY a JSON array of step names in execution order. No explanation."
    )

    user_message = f"Entities: {json.dumps(entities)}\nResources needed: {json.dumps(resources)}"

    text = glm_client.chat(
        user_message=user_message,
        system_message=system_message,
        max_tokens=1000,
        temperature=0.0,
    )

    try:
        steps = json.loads(text.strip())
        if isinstance(steps, list) and steps and steps[0] == "create_employee_record":
            return steps
    except json.JSONDecodeError:
        pass

    # Fallback: always include employee record + any matching resources
    default = ["create_employee_record"]
    resource_map = {
        "laptop": "create_laptop_request",
        "email": "create_email_account",
        "payroll": "create_payroll_setup",
        "building": "request_building_access",
    }
    for r in resources:
        r_lower = r.lower()
        for key, step in resource_map.items():
            if key in r_lower and step not in default:
                default.append(step)
    return default if len(default) > 1 else [
        "create_employee_record",
        "create_laptop_request",
        "create_email_account",
        "create_payroll_setup",
        "request_building_access",
    ]


def validate_step_output(step_name: str, step_result: dict, entities: dict) -> dict:
    """Use GLM to verify a step's output is reasonable. Returns {valid: bool, reason: str}."""
    system_message = (
        "You are an HR workflow validator. A step in the onboarding workflow just completed. "
        "Verify the output is reasonable and consistent with the employee data. "
        'Return ONLY JSON: {"valid": true/false, "reason": "explanation if invalid"}'
    )

    user_message = (
        f"Step: {step_name}\n"
        f"Step output: {json.dumps(step_result)}\n"
        f"Employee data: {json.dumps(entities)}"
    )

    text = glm_client.chat(
        user_message=user_message,
        system_message=system_message,
        max_tokens=1000,
        temperature=0.0,
    )

    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return {"valid": True, "reason": "Validation parse failed, assuming valid"}


def merge_partial_entities(missing_fields: list[str], existing_entities: dict, user_response: str) -> dict:
    """Use GLM to intelligently merge user's clarification response with existing entities."""
    system_message = (
        "You are an HR data extraction assistant. The user is providing clarification "
        "for missing HR onboarding information. Extract and merge the user's response "
        "with existing entity data. Return ONLY valid JSON with these fields:\n"
        '{"employee_name": "string", "department": "string", "start_date": "string", '
        '"resources_needed": ["string"], "job_role": "string"}. '
        "Keep existing non-empty values. Fill in missing values from the user's response. "
        "Be precise and extract exact values from the user's response. "
        "For missing fields like department and start_date, extract them clearly and separately."
    )

    user_message = (
        f"Missing fields to fill: {json.dumps(missing_fields)}\n"
        f"Existing data: {json.dumps(existing_entities)}\n"
        f"User clarification: {user_response}\n\n"
        f"IMPORTANT: Extract values for EACH missing field separately and distinctly. "
        f"Do not merge different fields into one value. "
        f"Return complete JSON with all 5 fields."
    )

    print(f"[DEBUG] Calling GLM merge_partial_entities with missing_fields={missing_fields}")
    
    try:
        text = glm_client.chat(
            user_message=user_message,
            system_message=system_message,
            max_tokens=1000,
            temperature=0.0,
        )
        
        print(f"[DEBUG] GLM response length: {len(text) if text else 0}, content: {text[:100] if text else 'EMPTY'}")
        
        if not text or not text.strip():
            print(f"[WARNING] GLM returned empty response for merge_partial_entities")
            return _fallback_merge_entities(missing_fields, existing_entities, user_response)
        
        parsed = _parse_json_text(text)
        # Merge with existing to preserve any fields not in response
        merged = existing_entities.copy()
        merged.update(parsed)
        
        # Validate that at least one missing field was filled
        filled_count = sum(1 for field in missing_fields if merged.get(field) and str(merged.get(field)).strip())
        if filled_count == 0:
            print(f"[WARNING] GLM response didn't fill any missing fields")
            print(f"  Parsed JSON: {parsed}")
            return _fallback_merge_entities(missing_fields, existing_entities, user_response)
        
        print(f"[INFO] GLM successfully filled {filled_count}/{len(missing_fields)} missing fields")
        return merged
        
    except json.JSONDecodeError as e:
        print(f"[ERROR] merge_partial_entities: JSON parse failed - {e}")
        print(f"  GLM response: {text[:200]}")
        return _fallback_merge_entities(missing_fields, existing_entities, user_response)
    except Exception as e:
        print(f"[ERROR] merge_partial_entities: Unexpected error - {e}")
        return _fallback_merge_entities(missing_fields, existing_entities, user_response)


def _fallback_merge_entities(missing_fields: list[str], existing_entities: dict, user_response: str) -> dict:
    """Fallback parsing when GLM fails: smart heuristic matching."""
    import re
    
    merged = existing_entities.copy()
    response_lower = user_response.lower()
    
    # Split response by comma if present, otherwise use whole string
    parts = [p.strip() for p in user_response.split(",")] if "," in user_response else [user_response.strip()]
    
    # Define field patterns
    departments = ["marketing", "sales", "engineering", "hr", "finance", "operations", "legal", "support", "it", "accounting"]
    date_keywords = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "tomorrow", "next", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
    
    # Try to assign parts intelligently
    assigned_department = False
    assigned_date = False
    
    for part in parts:
        part_lower = part.lower()
        
        # Check if this part is a department
        if "department" in missing_fields and not assigned_department:
            for dept in departments:
                if dept in part_lower:
                    # Extract the department part (handle "IT department", "Marketing", etc.)
                    if "department" in part_lower:
                        merged["department"] = part_lower.replace("department", "").strip().capitalize() or dept.capitalize()
                    else:
                        merged["department"] = dept.capitalize()
                    assigned_department = True
                    break
        
        # Check if this part is a date
        if "start_date" in missing_fields and not assigned_date:
            if any(keyword in part_lower for keyword in date_keywords):
                merged["start_date"] = part.strip()
                assigned_date = True
            else:
                # Check for date patterns like MM/DD, DD/MM, YYYY-MM-DD
                date_pattern = r'\d{1,4}[-/]\d{1,2}[-/]\d{1,4}|\d{1,2}[-/]\d{1,2}'
                match = re.search(date_pattern, part)
                if match:
                    merged["start_date"] = part.strip()
                    assigned_date = True
    
    # If we have unassigned fields and multiple parts, try cross-field assignment
    if not assigned_department and "department" in missing_fields and len(parts) > 1:
        for part in parts:
            part_lower = part.lower()
            for dept in departments:
                if dept in part_lower:
                    merged["department"] = dept.capitalize()
                    break
    
    if not assigned_date and "start_date" in missing_fields and len(parts) > 1:
        for part in parts:
            if any(keyword in part.lower() for keyword in date_keywords):
                merged["start_date"] = part.strip()
                break
    
    print(f"[INFO] Fallback parsing: user_response='{user_response}', parts={parts}")
    print(f"[INFO] Assigned: department={merged.get('department')}, start_date={merged.get('start_date')}")
    return merged


def glm_reason_next_action(step_name: str, step_result: dict, workflow: dict, step_index: int, total_steps: int) -> dict:
    """
    Use GLM to reason about whether to proceed to the next step or pause workflow.
    Returns {should_proceed: bool, reason: str}
    """
    system_message = (
        "You are an HR workflow orchestrator. Given a completed step and the workflow context, "
        "decide whether the workflow should proceed to the next step or pause/stop. "
        "Consider: Was the step successful? Are there any warnings or issues? "
        "Return ONLY JSON: {\"should_proceed\": true/false, \"reason\": \"brief explanation\"}"
    )

    user_message = (
        f"Current step: {step_name} ({step_index + 1}/{total_steps})\n"
        f"Step result: {json.dumps(step_result)}\n"
        f"Completed steps so far: {json.dumps(workflow.get('completed_steps', []))}\n"
        f"Employee data: {json.dumps(workflow.get('entities', {}))}"
    )

    text = glm_client.chat(
        user_message=user_message,
        system_message=system_message,
        max_tokens=1000,
        temperature=0.0,
    )

    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        # Default: proceed if no parse error
        return {"should_proceed": True, "reason": "Unable to parse GLM response, proceeding by default"}