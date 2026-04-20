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
        failed_steps_json TEXT NOT NULL
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
        failed_steps_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    }