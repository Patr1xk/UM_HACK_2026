"""
logic/screening.py

Handles resume screening logic:
- DB table init + role seeding
- Role CRUD (with HR overrides)
- PDF parsing (pdfplumber)
- GLM extraction of candidate fields
- GLM match scoring
- Interview scheduling (Google Calendar + Gmail via Google API)
"""

import json
import os
import random
from datetime import datetime, timedelta

from db.sqlite_store import get_connection


# ---------------------------------------------------------------------------
# DB Init
# ---------------------------------------------------------------------------

def init_screening_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS screening_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_name TEXT NOT NULL UNIQUE,
        required_skills_json TEXT NOT NULL,
        min_experience_years INTEGER NOT NULL,
        max_experience_years INTEGER,
        qualifications_json TEXT NOT NULL,
        languages_json TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS screening_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT NOT NULL,
        candidate_name TEXT,
        candidate_email TEXT,
        resume_filename TEXT,
        role_name TEXT,
        match_score REAL,
        match_breakdown_json TEXT,
        status TEXT NOT NULL,
        interview_scheduled INTEGER DEFAULT 0,
        interview_datetime TEXT,
        created_at TEXT NOT NULL
    )
    """)

    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM screening_roles")
    if cursor.fetchone()[0] == 0:
        _seed_default_roles(cursor)
        conn.commit()

    conn.close()


def _seed_default_roles(cursor):
    default_roles = [
        {
            "role_name": "Junior Data Analyst",
            "required_skills": ["Python", "SQL", "Power BI"],
            "min_experience_years": 0,
            "max_experience_years": 2,
            "qualifications": [
                "Bachelor in Computer Science", "Bachelor in Statistics",
                "Bachelor in Mathematics", "Bachelor in Data Science",
                "Bachelor in Information Technology"
            ],
            "languages": ["English"]
        },
        {
            "role_name": "Senior Data Analyst",
            "required_skills": ["Python", "SQL", "Tableau", "Machine Learning", "ETL"],
            "min_experience_years": 3,
            "max_experience_years": None,
            "qualifications": [
                "Bachelor in Computer Science", "Bachelor in Statistics",
                "Master in Data Science", "Master in Data Engineering"
            ],
            "languages": ["English"]
        },
        {
            "role_name": "Data Engineer",
            "required_skills": ["Python", "SQL", "Spark", "Airflow", "Cloud"],
            "min_experience_years": 2,
            "max_experience_years": None,
            "qualifications": [
                "Bachelor in Computer Science", "Bachelor in Information Technology",
                "Master in Data Engineering"
            ],
            "languages": ["English"]
        },
        {
            "role_name": "Machine Learning Engineer",
            "required_skills": ["Python", "scikit-learn", "TensorFlow", "SQL", "MLOps"],
            "min_experience_years": 2,
            "max_experience_years": None,
            "qualifications": [
                "Bachelor in Computer Science", "Master in Data Science", "Master in AI"
            ],
            "languages": ["English"]
        },
    ]
    for role in default_roles:
        cursor.execute("""
        INSERT OR IGNORE INTO screening_roles
        (role_name, required_skills_json, min_experience_years, max_experience_years,
         qualifications_json, languages_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            role["role_name"],
            json.dumps(role["required_skills"]),
            role["min_experience_years"],
            role["max_experience_years"],
            json.dumps(role["qualifications"]),
            json.dumps(role["languages"]),
        ))


# ---------------------------------------------------------------------------
# Role CRUD
# ---------------------------------------------------------------------------

def get_all_roles() -> list:
    init_screening_tables()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM screening_roles")
    rows = cursor.fetchall()
    conn.close()
    return [_row_to_role(r) for r in rows]


def get_role_by_name(role_name: str) -> dict | None:
    init_screening_tables()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM screening_roles WHERE role_name = ?", (role_name,))
    row = cursor.fetchone()
    conn.close()
    return _row_to_role(row) if row else None


def upsert_role(role_name: str, overrides: dict) -> dict:
    """
    HR can add or overwrite a role's requirements.
    If a skill/qualification already exists, the new value wins (deduped).
    """
    init_screening_tables()
    existing = get_role_by_name(role_name)

    if existing:
        skills = list(dict.fromkeys(
            overrides.get("required_skills", existing["required_skills"])
        ))
        quals = list(dict.fromkeys(
            overrides.get("qualifications", existing["qualifications"])
        ))
        langs = list(dict.fromkeys(
            overrides.get("languages", existing["languages"])
        ))
        min_exp = overrides.get("min_experience_years", existing["min_experience_years"])
        max_exp = overrides.get("max_experience_years", existing["max_experience_years"])

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE screening_roles SET
            required_skills_json = ?,
            min_experience_years = ?,
            max_experience_years = ?,
            qualifications_json = ?,
            languages_json = ?
        WHERE role_name = ?
        """, (json.dumps(skills), min_exp, max_exp, json.dumps(quals), json.dumps(langs), role_name))
        conn.commit()
        conn.close()
    else:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO screening_roles
        (role_name, required_skills_json, min_experience_years, max_experience_years,
         qualifications_json, languages_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            role_name,
            json.dumps(overrides.get("required_skills", [])),
            overrides.get("min_experience_years", 0),
            overrides.get("max_experience_years"),
            json.dumps(overrides.get("qualifications", [])),
            json.dumps(overrides.get("languages", ["English"])),
        ))
        conn.commit()
        conn.close()

    return get_role_by_name(role_name)


def _row_to_role(row) -> dict:
    return {
        "id": row[0],
        "role_name": row[1],
        "required_skills": json.loads(row[2]),
        "min_experience_years": row[3],
        "max_experience_years": row[4],
        "qualifications": json.loads(row[5]),
        "languages": json.loads(row[6]),
    }


# ---------------------------------------------------------------------------
# Screening Result DB
# ---------------------------------------------------------------------------

def save_screening_result(result: dict):
    init_screening_tables()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO screening_results
    (workflow_id, candidate_name, candidate_email, resume_filename, role_name,
     match_score, match_breakdown_json, status, interview_scheduled,
     interview_datetime, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        result.get("workflow_id", ""),
        result.get("candidate_name", ""),
        result.get("candidate_email", ""),
        result.get("resume_filename", ""),
        result.get("role_name", ""),
        result.get("match_score", 0),
        json.dumps(result.get("match_breakdown", {})),
        result.get("status", ""),
        1 if result.get("interview_scheduled") else 0,
        result.get("interview_datetime"),
        datetime.utcnow().isoformat(),
    ))
    conn.commit()
    conn.close()


def get_screening_results_by_workflow(workflow_id: str) -> list:
    init_screening_tables()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM screening_results WHERE workflow_id = ?", (workflow_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [_row_to_result(r) for r in rows]


def _row_to_result(row) -> dict:
    return {
        "id": row[0],
        "workflow_id": row[1],
        "candidate_name": row[2],
        "candidate_email": row[3],
        "resume_filename": row[4],
        "role_name": row[5],
        "match_score": row[6],
        "match_breakdown": json.loads(row[7]) if row[7] else {},
        "status": row[8],
        "interview_scheduled": bool(row[9]),
        "interview_datetime": row[10],
        "created_at": row[11],
    }


# ---------------------------------------------------------------------------
# Step functions (each mirrors onboarding step style)
# ---------------------------------------------------------------------------

def _get_runtime_data(workflow: dict) -> dict:
    return workflow.setdefault("runtime_data", {})


def parse_resume(workflow: dict) -> dict:
    """Step 1: Parse the PDF and store raw text in runtime_data."""
    import pdfplumber

    runtime_data = _get_runtime_data(workflow)
    pdf_path = runtime_data.get("pdf_path")
    if not pdf_path:
        raise ValueError("pdf_path not found in workflow runtime_data.")

    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    raw_text = text.strip()
    if not raw_text:
        raise ValueError("Could not extract any text from the PDF.")

    filename = os.path.basename(pdf_path)
    return {
        "step": "parse_resume",
        "status": "success",
        "message": f"Parsed resume from {filename} ({len(raw_text)} chars extracted).",
        "runtime_updates": {
            "resume_raw_text": raw_text,
            "resume_filename": filename,
        }
    }


def extract_candidate_details(workflow: dict) -> dict:
    """Step 2: Use Groq to extract structured candidate profile from raw text."""
    from glm.client import GroqClient

    runtime_data = _get_runtime_data(workflow)
    raw_text = runtime_data.get("resume_raw_text")
    if not raw_text:
        raise ValueError("resume_raw_text not found. Run parse_resume first.")

    glm = GroqClient()

    system_message = """Extract resume data as JSON. Return ONLY valid JSON, no markdown or explanation.
{
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "qualification": "highest degree (e.g. Master in Data Engineering)",
    "years_of_experience": 0,
    "technical_skills": ["string"],
    "languages": ["string"],
    "work_history": [{"title": "string", "company": "string", "duration": "string"}],
    "summary": "string"
}"""

    text = glm.chat(
        user_message=f"Parse this resume:\n\n{raw_text}",
        system_message=system_message,
        max_tokens=2000,
        temperature=0.0,
    )

    candidate = _parse_json(text)

    return {
        "step": "extract_candidate_details",
        "status": "success",
        "message": f"Extracted profile for candidate: {candidate.get('name', 'Unknown')}",
        "runtime_updates": {
            "candidate": candidate
        }
    }


def evaluate_candidate_fit(workflow: dict) -> dict:
    """Step 3: Groq scores candidate against role requirements."""
    from glm.client import GroqClient

    runtime_data = _get_runtime_data(workflow)
    candidate = runtime_data.get("candidate")
    role_name = runtime_data.get("role_name")

    if not candidate:
        raise ValueError("candidate not found in runtime_data. Run extract_candidate_details first.")
    if not role_name:
        raise ValueError("role_name not found in runtime_data.")

    role = get_role_by_name(role_name)
    if not role:
        raise ValueError(f"Role '{role_name}' not found.")

    glm = GroqClient()

    system_message = """Evaluate candidate fit for the role. Return ONLY valid JSON, no explanation.
{
    "match_score": 0,
    "reasoning": "brief 1-2 sentence explanation",
    "skills_matched": ["string"],
    "skills_missing": ["string"],
    "experience_match": true,
    "qualification_match": true
}
Score >= 70 = suitable for interview. Be strict."""

    payload = {"candidate": candidate, "role_requirements": role}
    text = glm.chat(
        user_message=f"Evaluate this candidate:\n\n{json.dumps(payload, indent=2)}",
        system_message=system_message,
        max_tokens=2000,
        temperature=0.0,
    )

    scoring = _parse_json(text)
    match_score = scoring.get("match_score", 0)

    return {
        "step": "evaluate_candidate_fit",
        "status": "success",
        "message": f"Match score: {match_score}% for role '{role_name}'.",
        "runtime_updates": {
            "match_score": match_score,
            "match_breakdown": scoring,
            "role_requirements": role,
        }
    }


def decide_candidate_outcome(workflow: dict) -> dict:
    """Step 4: Decide shortlist or reject based on match score threshold (70%)."""
    runtime_data = _get_runtime_data(workflow)
    match_score = runtime_data.get("match_score", 0)
    candidate_name = runtime_data.get("candidate", {}).get("name", "Unknown")

    if match_score >= 70:
        decision = "shortlisted"
        message = f"{candidate_name} scored {match_score}% — shortlisted for interview."
    else:
        decision = "rejected"
        message = f"{candidate_name} scored {match_score}% — below threshold (70%). Not shortlisted."

    return {
        "step": "decide_candidate_outcome",
        "status": "success",
        "message": message,
        "runtime_updates": {
            "decision": decision
        }
    }


def schedule_interview(workflow: dict) -> dict:
    """
    Step 5: Pick a random working-day/time slot (9am–5pm MYT, next 7 days).
    Stores interview details in runtime_data for the email step to use.
    """
    runtime_data = _get_runtime_data(workflow)

    if runtime_data.get("decision") != "shortlisted":
        return {
            "step": "schedule_interview",
            "status": "skipped",
            "message": "Candidate not shortlisted. Skipping interview scheduling.",
        }

    candidate = runtime_data.get("candidate", {})
    role_name = runtime_data.get("role_name", "")

    # Pick a random working day in the next 7 days
    working_days = []
    check = datetime.now() + timedelta(days=1)
    while len(working_days) < 7:
        if check.weekday() < 5:
            working_days.append(check)
        check += timedelta(days=1)

    chosen = random.choice(working_days)
    hour = random.randint(9, 17)  # 9am–5pm start (slot ends 1hr later, max 6pm)
    interview_dt = chosen.replace(hour=hour, minute=0, second=0, microsecond=0)
    end_dt = interview_dt + timedelta(hours=1)

    interview_info = {
        "candidate_name": candidate.get("name", "Candidate"),
        "candidate_email": candidate.get("email", ""),
        "role_name": role_name,
        "interview_datetime": interview_dt.isoformat(),
        "end_datetime": end_dt.isoformat(),
        "display_time": interview_dt.strftime("%A, %d %B %Y at %I:%M %p MYT"),
        "display_end": end_dt.strftime("%I:%M %p MYT"),
        "duration_minutes": 60,
    }

    return {
        "step": "schedule_interview",
        "status": "success",
        "message": f"Interview slot chosen: {interview_info['display_time']}",
        "runtime_updates": {
            "interview_info": interview_info,
            "interview_datetime": interview_dt.isoformat(),
        }
    }


def send_candidate_email(workflow: dict) -> dict:
    """
    Step 6: Send interview invitation email via Gmail API (OAuth2).
    Requires: credentials.json + token.json from Google Cloud Console.
    Gracefully skips if Google credentials are not configured.
    """
    runtime_data = _get_runtime_data(workflow)

    if runtime_data.get("decision") != "shortlisted":
        return {
            "step": "send_candidate_email",
            "status": "skipped",
            "message": "Candidate not shortlisted. Skipping email.",
        }

    info = runtime_data.get("interview_info")
    if not info:
        return {
            "step": "send_candidate_email",
            "status": "skipped",
            "message": "interview_info not found. Skipping email.",
        }

    try:
        from glm.google_client import send_gmail

        subject = f"Interview Invitation — {info['role_name']} Position at HireFlow"
        body = (
            f"Dear {info['candidate_name']},\n\n"
            f"We are pleased to inform you that your application for the {info['role_name']} position "
            f"has been reviewed and we would like to invite you for an interview.\n\n"
            f"Interview Details:\n"
            f"  Date & Time : {info['display_time']}\n"
            f"  Duration    : 1 hour (ends {info['display_end']})\n"
            f"  Format      : Video Call (Google Meet link will be shared separately)\n\n"
            f"Please reply to this email to confirm your attendance or to request a reschedule.\n\n"
            f"We look forward to speaking with you.\n\n"
            f"Best regards,\n"
            f"HireFlow HR Team\n"
            f"hr@hireflow.com"
        )

        result = send_gmail(
            to=info["candidate_email"],
            subject=subject,
            body=body,
        )

        return {
            "step": "send_candidate_email",
            "status": "success",
            "message": f"Interview invitation email sent to {info['candidate_email']}.",
            "runtime_updates": {
                "email_sent": True,
                "email_message_id": result.get("id", ""),
            }
        }
    except Exception as e:
        return {
            "step": "send_candidate_email",
            "status": "skipped",
            "message": f"Email not sent (Google API unavailable: {type(e).__name__}). Interview is still scheduled.",
        }


def create_calendar_event(workflow: dict) -> dict:
    """
    Step 7: Create a Google Calendar event and send invite to candidate.
    Requires: credentials.json + token.json from Google Cloud Console.
    Gracefully skips if Google credentials are not configured.
    """
    runtime_data = _get_runtime_data(workflow)

    if runtime_data.get("decision") != "shortlisted":
        return {
            "step": "create_calendar_event",
            "status": "skipped",
            "message": "Candidate not shortlisted. Skipping calendar event.",
        }

    info = runtime_data.get("interview_info")
    if not info:
        return {
            "step": "create_calendar_event",
            "status": "skipped",
            "message": "interview_info not found. Skipping calendar event.",
        }

    try:
        from glm.google_client import create_google_calendar_event

        event = create_google_calendar_event(
            summary=f"Interview — {info['candidate_name']} ({info['role_name']})",
            description=(
                f"Interview with {info['candidate_name']} for the {info['role_name']} position.\n"
                f"Candidate Email: {info['candidate_email']}"
            ),
            start_datetime=info["interview_datetime"],
            end_datetime=info["end_datetime"],
            attendee_email=info["candidate_email"],
        )

        return {
            "step": "create_calendar_event",
            "status": "success",
            "message": f"Google Calendar event created. Event ID: {event.get('id', '')}",
            "runtime_updates": {
                "calendar_event_id": event.get("id", ""),
                "calendar_event_link": event.get("htmlLink", ""),
            }
        }
    except Exception as e:
        return {
            "step": "create_calendar_event",
            "status": "skipped",
            "message": f"Calendar event not created (Google API unavailable: {type(e).__name__}). Interview is still scheduled.",
        }


# ---------------------------------------------------------------------------
# Step Map (mirrors ONBOARDING_STEP_MAP pattern)
# ---------------------------------------------------------------------------

SCREENING_STEP_MAP = {
    "parse_resume":             parse_resume,
    "extract_candidate_details": extract_candidate_details,
    "evaluate_candidate_fit":   evaluate_candidate_fit,
    "decide_candidate_outcome": decide_candidate_outcome,
    "schedule_interview":       schedule_interview,
    "send_candidate_email":     send_candidate_email,
    "create_calendar_event":    create_calendar_event,
}


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _parse_json(text: str) -> dict:
    """Parse JSON from text, handling markdown code blocks and empty responses."""
    if not text:
        raise ValueError("Empty response received from GLM. Response text is empty.")
    
    cleaned = text.strip()
    
    # Remove markdown code blocks
    if cleaned.startswith("```json"):
        cleaned = cleaned.removeprefix("```json").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```").strip()
    if cleaned.endswith("```"):
        cleaned = cleaned.removesuffix("```").strip()
    
    # Check if empty after cleaning
    if not cleaned:
        raise ValueError(f"Invalid JSON response: response is empty after cleaning. Original: {repr(text[:200])}")
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        # Provide more diagnostic info
        print(f"DEBUG: Failed to parse JSON. Original text: {repr(text[:500])}")
        print(f"DEBUG: Cleaned text: {repr(cleaned[:500])}")
        raise ValueError(f"Invalid JSON from GLM: {str(e)}. Response: {cleaned[:200]}")
