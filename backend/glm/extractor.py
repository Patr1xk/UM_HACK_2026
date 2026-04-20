import json
from glm.client import GLMClient

glm_client = GLMClient(model="glm-4.7-flash", thinking_enabled=False)


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
        max_tokens=450,
        temperature=0.0,
    )

    return _parse_json_text(text)