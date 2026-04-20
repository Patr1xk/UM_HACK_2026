import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from glm.extractor import extract_request

def main():
    user_message = "what is the weather today?"
    # user_message = "Please onboard Sarah Lim for Marketing next Monday. She needs laptop, email, payroll, and building access."

    result = extract_request(user_message)
    print("\nRESULT:")
    print(result)

if __name__ == "__main__":
    main()