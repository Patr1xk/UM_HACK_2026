from glm.extractor import extract_request
from schemas.schemas import ExtractedRequest
from orchestrator.orchestrator import build_workflow
from db.sqlite_store import save_workflow, get_workflow
# from logic.onboarding import execute_onboarding_workflow

#Validation
def process_user_request(user_message: str) -> ExtractedRequest:
    """
    1. Receive raw user text
    2. Call GLM unified extractor
    3. Validate the extracted JSON with Pydantic
    4. Return validated structured request
    """
    if not user_message or not user_message.strip():
        raise ValueError("User message cannot be empty.")
    
    raw_result = extract_request(user_message)
    validated_result = ExtractedRequest.model_validate(raw_result)
    workflow = build_workflow(validated_result)
    save_workflow(workflow)

    # workflow = execute_onboarding_workflow(workflow)
    return workflow
    
#test
def fetch_workflow(workflow_id: str):
    return get_workflow(workflow_id)