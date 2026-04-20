import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.services import process_user_request


def main():
    #Test onboarding
    # user_message = (
    #     "Please onboard Sarah Lim for Marketing next Monday. "
    #     "She needs laptop, email, payroll, and building access."
    # )

    #Test resume screening
    user_message = (
        "Please onboard Sarah Lim for Marketing next Monday. "
        "She needs laptop, email, payroll, and building access."
    )

    result = process_user_request(user_message)

    print(result)
    print()
    print(result["workflow_type"])
    print(result["entities"]["employee_name"])
    print(result["entities"]["resources_needed"])
    print(result["steps"])

if __name__ == "__main__":
    main()