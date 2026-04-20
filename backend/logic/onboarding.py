from datetime import datetime
from db.sqlite_store import get_connection


def _now() -> str:
    return datetime.utcnow().isoformat()


def init_onboarding_tables():
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


def _get_entities(workflow: dict) -> dict:
    return workflow.get("entities", {})


def _get_runtime_data(workflow: dict) -> dict:
    return workflow.setdefault("runtime_data", {})


def _require_employee_id(workflow: dict) -> int:
    runtime_data = _get_runtime_data(workflow)
    employee_id = runtime_data.get("employee_id")

    if not employee_id:
        raise ValueError("employee_id not found in workflow runtime_data. Run create_employee_record first.")

    return employee_id


def _generate_email(employee_name: str) -> str:
    safe_name = employee_name.strip().lower().replace(" ", ".")
    return f"{safe_name}@hireflow.com"


def create_employee_record(workflow: dict) -> dict:
    init_onboarding_tables()

    entities = _get_entities(workflow)
    employee_name = entities.get("employee_name", "")
    department = entities.get("department", "")
    start_date = entities.get("start_date", "")

    if not employee_name or not department or not start_date:
        raise ValueError("Missing employee_name, department, or start_date for employee creation.")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO employees (employee_name, department, start_date, created_at)
        VALUES (?, ?, ?, ?)
    """, (employee_name, department, start_date, _now()))

    employee_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "step": "create_employee_record",
        "status": "success",
        "message": f"Employee record created for {employee_name}",
        "runtime_updates": {
            "employee_id": employee_id
        },
        "record": {
            "employee_id": employee_id,
            "employee_name": employee_name,
            "department": department,
            "start_date": start_date
        }
    }


def create_laptop_request(workflow: dict) -> dict:
    init_onboarding_tables()

    employee_id = _require_employee_id(workflow)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO laptop_requests (employee_id, status, created_at)
        VALUES (?, ?, ?)
    """, (employee_id, "requested", _now()))

    request_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "step": "create_laptop_request",
        "status": "success",
        "message": f"Laptop request created for employee_id={employee_id}",
        "record": {
            "laptop_request_id": request_id,
            "employee_id": employee_id,
            "status": "requested"
        }
    }


def create_email_account(workflow: dict) -> dict:
    init_onboarding_tables()

    employee_id = _require_employee_id(workflow)
    entities = _get_entities(workflow)
    employee_name = entities.get("employee_name", "")

    if not employee_name:
        raise ValueError("Missing employee_name for email account creation.")

    email_address = _generate_email(employee_name)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO email_accounts (employee_id, email_address, status, created_at)
        VALUES (?, ?, ?, ?)
    """, (employee_id, email_address, "created", _now()))

    account_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "step": "create_email_account",
        "status": "success",
        "message": f"Email account created for employee_id={employee_id}",
        "runtime_updates": {
            "email_address": email_address
        },
        "record": {
            "email_account_id": account_id,
            "employee_id": employee_id,
            "email_address": email_address,
            "status": "created"
        }
    }


def create_payroll_setup(workflow: dict) -> dict:
    init_onboarding_tables()

    employee_id = _require_employee_id(workflow)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO payroll_setups (employee_id, status, created_at)
        VALUES (?, ?, ?)
    """, (employee_id, "created", _now()))

    payroll_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "step": "create_payroll_setup",
        "status": "success",
        "message": f"Payroll setup created for employee_id={employee_id}",
        "record": {
            "payroll_setup_id": payroll_id,
            "employee_id": employee_id,
            "status": "created"
        }
    }


def request_building_access(workflow: dict) -> dict:
    init_onboarding_tables()

    employee_id = _require_employee_id(workflow)

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO building_access_requests (employee_id, status, created_at)
        VALUES (?, ?, ?)
    """, (employee_id, "requested", _now()))

    access_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return {
        "step": "request_building_access",
        "status": "success",
        "message": f"Building access requested for employee_id={employee_id}",
        "record": {
            "building_access_request_id": access_id,
            "employee_id": employee_id,
            "status": "requested"
        }
    }


ONBOARDING_STEP_MAP = {
    "create_employee_record": create_employee_record,
    "create_laptop_request": create_laptop_request,
    "create_email_account": create_email_account,
    "create_payroll_setup": create_payroll_setup,
    "request_building_access": request_building_access,
}