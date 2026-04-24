"""
glm/google_client.py

Google API wrapper for Gmail (send email) and Google Calendar (create event).

Setup required (one-time):
1. Go to https://console.cloud.google.com/
2. Create a project → Enable "Gmail API" and "Google Calendar API"
3. Create OAuth 2.0 credentials (Desktop app) → Download as credentials.json
4. Place credentials.json in the backend/ root folder
5. On first run, a browser window will open to authorise access
6. A token.json file will be created automatically for future runs

Scopes needed:
  https://www.googleapis.com/auth/gmail.send
  https://www.googleapis.com/auth/calendar

Environment variable (optional alternative to file path):
  GOOGLE_CREDENTIALS_PATH  — path to credentials.json (default: backend/credentials.json)
  GOOGLE_TOKEN_PATH        — path to token.json       (default: backend/token.json)
"""

import os
import base64
from email.mime.text import MIMEText
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

# Resolve paths relative to this file (backend/glm/ → backend/)
_BASE_DIR = Path(__file__).resolve().parent.parent

CREDENTIALS_PATH = os.getenv(
    "GOOGLE_CREDENTIALS_PATH",
    str(_BASE_DIR / "credentials.json")
)
TOKEN_PATH = os.getenv(
    "GOOGLE_TOKEN_PATH",
    str(_BASE_DIR / "token.json")
)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def _get_google_creds() -> Credentials:
    """
    Load or refresh Google OAuth2 credentials.
    On first run, opens a browser for authorisation and saves token.json.
    """
    creds = None

    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_PATH):
                raise FileNotFoundError(
                    f"Google credentials file not found at: {CREDENTIALS_PATH}\n"
                    "Please download credentials.json from Google Cloud Console and place it in the backend/ folder.\n"
                    "See glm/google_client.py docstring for full setup instructions."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())

    return creds


# ---------------------------------------------------------------------------
# Gmail — Send Email
# ---------------------------------------------------------------------------

def send_gmail(to: str, subject: str, body: str) -> dict:
    """
    Send a plain-text email via Gmail API.

    Args:
        to:      Recipient email address
        subject: Email subject line
        body:    Plain text email body

    Returns:
        dict with Gmail message metadata (includes 'id')
    """
    creds = _get_google_creds()
    service = build("gmail", "v1", credentials=creds)

    mime_message = MIMEText(body)
    mime_message["to"] = to
    mime_message["subject"] = subject

    encoded = base64.urlsafe_b64encode(mime_message.as_bytes()).decode()
    payload = {"raw": encoded}

    result = service.users().messages().send(userId="me", body=payload).execute()
    return result


# ---------------------------------------------------------------------------
# Google Calendar — Create Event
# ---------------------------------------------------------------------------

def create_google_calendar_event(
    summary: str,
    description: str,
    start_datetime: str,
    end_datetime: str,
    attendee_email: str,
    timezone: str = "Asia/Kuala_Lumpur",
) -> dict:
    """
    Create a Google Calendar event and send an invite to the attendee.

    Args:
        summary:          Event title
        description:      Event description
        start_datetime:   ISO 8601 string (e.g. "2025-06-10T10:00:00")
        end_datetime:     ISO 8601 string
        attendee_email:   Candidate's email address (receives Google Calendar invite)
        timezone:         IANA timezone string (default: Asia/Kuala_Lumpur)

    Returns:
        dict with Google Calendar event metadata (includes 'id' and 'htmlLink')
    """
    creds = _get_google_creds()
    service = build("calendar", "v3", credentials=creds)

    event_body = {
        "summary": summary,
        "description": description,
        "start": {
            "dateTime": start_datetime,
            "timeZone": timezone,
        },
        "end": {
            "dateTime": end_datetime,
            "timeZone": timezone,
        },
        "attendees": [
            {"email": attendee_email}
        ],
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 24 * 60},  # 1 day before
                {"method": "popup", "minutes": 30},
            ],
        },
        "conferenceData": {
            "createRequest": {
                "requestId": f"hireflow-{summary[:10].replace(' ', '-').lower()}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    result = (
        service.events()
        .insert(
            calendarId="primary",
            body=event_body,
            sendUpdates="all",          # sends email invite to attendees
            conferenceDataVersion=1,    # enables Google Meet link generation
        )
        .execute()
    )

    return result
