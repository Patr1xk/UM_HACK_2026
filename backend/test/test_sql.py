import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from db.sqlite_store import init_db
from services.services import process_user_request, fetch_workflow


def main():
    init_db()

    user_message = (
        "Please onboard Sarah Lim for Marketing next Monday. "
        "She needs laptop, email, payroll, and building access."
    )

    workflow = process_user_request(user_message)
    print("CREATED WORKFLOW:")
    print(workflow)
    print()

    workflow_id = workflow["workflow_id"]
    loaded_workflow = fetch_workflow(workflow_id)

    print("FETCHED FROM SQLITE:")
    print(loaded_workflow)


if __name__ == "__main__":
    main()