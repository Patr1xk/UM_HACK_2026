import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from logic.screening import get_all_roles

def main():
    print("Retrieving screening roles from workflow.db")
    screening_roles = get_all_roles()  # Example role name
    for role in screening_roles:
        print(f"- {role}")

if __name__ == "__main__":
    main()