import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "workflow.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS workflows (
        workflow_id TEXT PRIMARY KEY,
        workflow_type TEXT NOT NULL,
        status TEXT NOT NULL,
        intent_summary TEXT,
        confidence REAL,
        entities_json TEXT NOT NULL,
        missing_fields_json TEXT NOT NULL,
        next_action TEXT NOT NULL,
        steps_json TEXT NOT NULL,
        current_step_index INTEGER NOT NULL,
        completed_steps_json TEXT NOT NULL,
        failed_steps_json TEXT NOT NULL,
        runtime_data_json TEXT NOT NULL DEFAULT '{}',
        action_logs_json TEXT NOT NULL DEFAULT '[]',
        clarification_json TEXT NOT NULL DEFAULT '{}',
        user_clarification_json TEXT NOT NULL DEFAULT '{}'
    )
    """)

    conn.commit()
    conn.close()


def init_onboarding_tables():
    """Initialize all onboarding-related tables."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_name TEXT NOT NULL,
        department TEXT NOT NULL,
        start_date TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS laptop_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS email_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        email_address TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payroll_setups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS building_access_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
    """)

    conn.commit()
    conn.close()


def save_workflow(workflow: dict):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT OR REPLACE INTO workflows (
        workflow_id,
        workflow_type,
        status,
        intent_summary,
        confidence,
        entities_json,
        missing_fields_json,
        next_action,
        steps_json,
        current_step_index,
        completed_steps_json,
        failed_steps_json,
        runtime_data_json,
        action_logs_json,
        clarification_json,
        user_clarification_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        workflow["workflow_id"],
        workflow["workflow_type"],
        workflow["status"],
        workflow["intent_summary"],
        workflow["confidence"],
        json.dumps(workflow["entities"]),
        json.dumps(workflow["missing_fields"]),
        workflow["next_action"],
        json.dumps(workflow["steps"]),
        workflow["current_step_index"],
        json.dumps(workflow["completed_steps"]),
        json.dumps(workflow["failed_steps"]),
        json.dumps(workflow.get("runtime_data", {})),
        json.dumps(workflow.get("action_logs", [])),
        json.dumps(workflow.get("clarification", {})),
        json.dumps(workflow.get("user_clarification", {})),
    ))

    conn.commit()
    conn.close()


def get_workflow(workflow_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM workflows WHERE workflow_id = ?", (workflow_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    return _row_to_workflow(row)


def list_workflows(workflow_type: str = None, status: str = None) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM workflows"
    conditions = []
    params = []

    if workflow_type:
        conditions.append("workflow_type = ?")
        params.append(workflow_type)
    if status:
        conditions.append("status = ?")
        params.append(status)

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY rowid DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [_row_to_workflow(row) for row in rows]


def _row_to_workflow(row) -> dict:
    return {
        "workflow_id": row[0],
        "workflow_type": row[1],
        "status": row[2],
        "intent_summary": row[3],
        "confidence": row[4],
        "entities": json.loads(row[5]),
        "missing_fields": json.loads(row[6]),
        "next_action": row[7],
        "steps": json.loads(row[8]),
        "current_step_index": row[9],
        "completed_steps": json.loads(row[10]),
        "failed_steps": json.loads(row[11]),
        "runtime_data": json.loads(row[12]) if len(row) > 12 else {},
        "action_logs": json.loads(row[13]) if len(row) > 13 else [],
        "clarification": json.loads(row[14]) if len(row) > 14 else {},
        "user_clarification": json.loads(row[15]) if len(row) > 15 else {},
    }