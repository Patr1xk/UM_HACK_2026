import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.sqlite_store import init_db
from services.services import run_screening, fetch_workflow
from logic.screening import (
    init_screening_tables,
    get_all_roles,
    get_role_by_name,
    parse_resume,
    extract_candidate_details,
    evaluate_candidate_fit,
    decide_candidate_outcome,
    schedule_interview,
    send_candidate_email,
    create_calendar_event,
    get_screening_results_by_workflow,
)
from uuid import uuid4

# Sample resume path
RESUME_PATH = os.path.join(os.path.dirname(__file__), '../resumes/resume_1_Amirah.pdf')


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)


def test_get_all_roles():
    """Test: Fetch all available roles"""
    print_section("TEST 1: Get All Available Roles")
    try:
        roles = get_all_roles()
        print(f"✓ Successfully fetched {len(roles)} roles:")
        for i, role in enumerate(roles, 1):
            print(f"  {i}. {role['role_name']} - Skills: {role['required_skills']}")
        return roles
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return []


def test_get_role_by_name(role_name="Junior Data Analyst"):
    """Test: Fetch a specific role"""
    print_section(f"TEST 2: Get Specific Role - '{role_name}'")
    try:
        role = get_role_by_name(role_name)
        if role:
            print(f"✓ Successfully fetched role:")
            print(f"  Role: {role['role_name']}")
            print(f"  Required Skills: {role['required_skills']}")
            print(f"  Experience: {role['min_experience_years']}-{role['max_experience_years']} years")
            print(f"  Qualifications: {role['qualifications']}")
            print(f"  Languages: {role['languages']}")
            return role
        else:
            print(f"✗ Role '{role_name}' not found")
            return None
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return None


def merge_workflow_result(workflow, result):
    """Merge step result into workflow, handling runtime_updates"""
    if result.get("runtime_updates"):
        workflow.setdefault("runtime_data", {}).update(result["runtime_updates"])
    if result.get("status") == "failed":
        workflow.setdefault("failed_steps", []).append({
            "step": result.get("step"),
            "status": "failed",
            "message": result.get("message")
        })
    else:
        workflow.setdefault("completed_steps", []).append(result.get("step"))
    return workflow


def test_parse_resume(workflow_id="test_parse", role_name="Junior Data Analyst"):
    """Test: Parse resume from PDF"""
    print_section("TEST 3: Parse Resume from PDF")
    
    if not os.path.exists(RESUME_PATH):
        print(f"✗ Resume file not found at: {RESUME_PATH}")
        return None
    
    try:
        # Build initial workflow
        role = get_role_by_name(role_name)
        if not role:
            print(f"✗ Role '{role_name}' not found")
            return None
        
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
                "pdf_path": RESUME_PATH,
                "role_name": role_name,
            },
        }
        
        # Parse resume
        result = parse_resume(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error parsing resume: {result.get('message')}")
            return None
        
        print(f"✓ Successfully parsed resume")
        if "resume_raw_text" in workflow.get("runtime_data", {}):
            text = workflow["runtime_data"]["resume_raw_text"]
            print(f"  Extracted text length: {len(text)} characters")
            print(f"  First 200 chars: {text[:200]}...")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_extract_candidate_details(workflow):
    """Test: Extract candidate details from resume"""
    print_section("TEST 4: Extract Candidate Details")
    
    if not workflow:
        print("✗ No workflow provided")
        return None
    
    try:
        result = extract_candidate_details(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error extracting details: {result.get('message')}")
            return None
        
        print(f"✓ Successfully extracted candidate details")
        candidate = workflow.get("runtime_data", {}).get("candidate_details", {})
        print(f"  Name: {candidate.get('name', 'N/A')}")
        print(f"  Email: {candidate.get('email', 'N/A')}")
        print(f"  Phone: {candidate.get('phone', 'N/A')}")
        print(f"  Skills: {candidate.get('skills', [])}")
        print(f"  Experience (years): {candidate.get('experience_years', 'N/A')}")
        print(f"  Education: {candidate.get('education', [])}")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_evaluate_candidate_fit(workflow):
    """Test: Evaluate candidate fit for role"""
    print_section("TEST 5: Evaluate Candidate Fit")
    
    if not workflow:
        print("✗ No workflow provided")
        return None
    
    try:
        result = evaluate_candidate_fit(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error evaluating fit: {result.get('message')}")
            return None
        
        print(f"✓ Successfully evaluated candidate fit")
        match_result = workflow.get("runtime_data", {}).get("match_result", {})
        print(f"  Match Score: {match_result.get('match_score', 'N/A')}")
        print(f"  Skills Match: {match_result.get('skills_match', 'N/A')}%")
        print(f"  Experience Match: {match_result.get('experience_match', 'N/A')}%")
        print(f"  Education Match: {match_result.get('education_match', 'N/A')}%")
        print(f"  Recommendation: {match_result.get('recommendation', 'N/A')}")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_decide_candidate_outcome(workflow):
    """Test: Decide candidate outcome (pass/fail)"""
    print_section("TEST 6: Decide Candidate Outcome")
    
    if not workflow:
        print("✗ No workflow provided")
        return None
    
    try:
        result = decide_candidate_outcome(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error deciding outcome: {result.get('message')}")
            return None
        
        print(f"✓ Successfully decided candidate outcome")
        decision = workflow.get("runtime_data", {}).get("decision", {})
        print(f"  Status: {decision.get('status', 'N/A')}")
        print(f"  Decision: {decision.get('decision', 'N/A')}")
        print(f"  Reasoning: {decision.get('reasoning', 'N/A')}")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_schedule_interview(workflow):
    """Test: Schedule interview"""
    print_section("TEST 7: Schedule Interview")
    
    if not workflow:
        print("✗ No workflow provided")
        return None
    
    try:
        result = schedule_interview(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error scheduling interview (this may fail without Google API setup): {result.get('message')}")
            return workflow
        
        print(f"✓ Successfully scheduled interview")
        interview = workflow.get("runtime_data", {}).get("interview_details", {})
        print(f"  Interview Time: {interview.get('interview_datetime', 'N/A')}")
        print(f"  Interviewer: {interview.get('interviewer_email', 'N/A')}")
        print(f"  Interview Type: {interview.get('interview_type', 'N/A')}")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return workflow


def test_send_candidate_email(workflow):
    """Test: Send candidate email"""
    print_section("TEST 8: Send Candidate Email")
    
    if not workflow:
        print("✗ No workflow provided")
        return None
    
    try:
        result = send_candidate_email(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error sending email (this may fail without Gmail setup): {result.get('message')}")
            return workflow
        
        print(f"✓ Successfully sent candidate email")
        email_info = workflow.get("runtime_data", {}).get("email_sent", {})
        print(f"  Email Sent To: {email_info.get('recipient', 'N/A')}")
        print(f"  Send Status: {email_info.get('status', 'N/A')}")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return workflow


def test_create_calendar_event(workflow):
    """Test: Create calendar event"""
    print_section("TEST 9: Create Calendar Event")
    
    if not workflow:
        print("✗ No workflow provided")
        return None
    
    try:
        result = create_calendar_event(workflow)
        workflow = merge_workflow_result(workflow, result)
        
        if result.get("status") == "failed":
            print(f"✗ Error creating calendar event (this may fail without Google API setup): {result.get('message')}")
            return workflow
        
        print(f"✓ Successfully created calendar event")
        event_info = workflow.get("runtime_data", {}).get("calendar_event", {})
        print(f"  Event ID: {event_info.get('event_id', 'N/A')}")
        print(f"  Event Time: {event_info.get('event_datetime', 'N/A')}")
        
        return workflow
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return workflow


def test_run_full_screening():
    """Test: Run full resume screening pipeline"""
    print_section("TEST 10: Run Full Screening Pipeline (using run_screening)")
    
    workflow_id = f"full_test_{uuid4().hex[:8]}"
    role_name = "Junior Data Analyst"
    
    try:
        result = run_screening(
            workflow_id=workflow_id,
            pdf_path=RESUME_PATH,
            role_name=role_name,
        )
        
        print(f"✓ Full screening pipeline completed")
        print(f"  Workflow ID: {result['workflow_id']}")
        print(f"  Status: {result['status']}")
        print(f"  Completed Steps: {result['completed_steps']}")
        if result.get('failed_steps'):
            print(f"  Failed Steps: {result['failed_steps']}")
        
        return result
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("  RESUME SCREENING BACKEND TEST SUITE")
    print("="*80)
    
    # Initialize database
    print("\nInitializing database...")
    init_db()
    init_screening_tables()
    print("✓ Database initialized")
    
    # Test 1: Get all roles
    roles = test_get_all_roles()
    
    # Test 2: Get specific role
    role = test_get_role_by_name("Junior Data Analyst")
    
    # Test 3: Parse resume
    workflow = test_parse_resume()
    
    # Test 4-9: Step-by-step workflow
    if workflow:
        workflow = test_extract_candidate_details(workflow)
        if workflow:
            workflow = test_evaluate_candidate_fit(workflow)
        if workflow:
            workflow = test_decide_candidate_outcome(workflow)
        if workflow:
            workflow = test_schedule_interview(workflow)
        if workflow:
            workflow = test_send_candidate_email(workflow)
        if workflow:
            workflow = test_create_calendar_event(workflow)
    
    # Test 10: Full pipeline
    test_run_full_screening()
    
    print("\n" + "="*80)
    print("  TEST SUITE COMPLETED")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
