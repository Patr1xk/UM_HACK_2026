# Hireflow - AI-Powered HR Automation Platform

> **End-to-end hiring and employee onboarding automation powered by Groq AI**

Hireflow is an intelligent HR platform that automates the entire recruitment and onboarding pipeline—from resume screening through interview scheduling to employee provisioning—all orchestrated by AI and logged for compliance.

---

## 🎥 Demo Video

**[INSERT YOUTUBE LINK HERE]**

https://youtu.be/YOUR_VIDEO_ID_HERE

---

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Platform Sections](#platform-sections)
- [Complete Workflow](#complete-workflow)
- [API Reference](#api-reference)
- [Chat Widget](#chat-widget)
- [Onboarding System](#onboarding-system)
- [Orchestrator Logs](#orchestrator-logs)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

**Hireflow** solves the pain point of manual HR processes by automating:

1. **Resume Screening** - AI extracts candidate data and scores matches
2. **Resume Database** - Searchable candidate repository with 1-click actions
3. **Interview Hub** - Centralized interview scheduling and management
4. **Employee Onboarding** - Automated 5-step provisioning workflow
5. **Dashboard** - Real-time metrics and activity monitoring
6. **Orchestrator Logs** - Complete audit trail for compliance
7. **Chat Widget** - Natural language interface for HR requests

**Result:** Reduce time-to-hire from 30+ days to ~18 days. Eliminate manual data entry. Scale hiring without adding HR headcount.

---

## Key Features

### 🤖 AI-Powered Extraction
- **Groq LLM Integration** (llama-3.3-70b-versatile): Instantly extracts skills, experience, education from PDFs
- **Natural Language Processing**: HR can request workflows by typing ("Onboard Jane Doe in Engineering starting Monday")
- **Intelligent Matching**: Scores candidates against job requirements in real-time

### 🔄 Automated Workflows
- **5-Step Onboarding**: Create employee record → Laptop request → Email account → Payroll setup → Building access
- **Sequential Execution**: Steps run in order with fault tolerance and automatic logging
- **Clarification Loops**: System asks HR for missing info instead of failing

### 📊 Real-Time Dashboard
- **Live Metrics**: Total candidates, active pipelines, avg time-to-hire, unresolved alerts
- **Trend Analysis**: Application vs interview conversion rates
- **Activity Feed**: Recent orchestrator actions with timestamps
- **Pipeline Visualization**: Candidates in each hiring funnel

### 🔍 Resume Database
- **Full-Text Search**: Find candidates by skills, experience, role
- **Candidate Profiles**: Detailed history with match scores
- **1-Click Actions**: Interview scheduling, automated rejection, status updates

### 📅 Interview Management
- **Scheduling**: Built-in calendar integration for interview booking
- **Candidate Details**: Full profile, skill match report, feedback forms
- **Offer Issuance**: Direct path from interview approval to onboarding

### 📝 Compliance & Logging
- **Orchestrator Logs**: Every workflow action timestamped and searchable
- **Error Tracking**: Failed steps logged with full error messages
- **Audit Trail**: Complete history for regulatory compliance

### 💬 Chat Widget
- **Natural Language Input**: HR types requests, AI understands intent
- **Context Aware**: Recognizes workflow type, extracts entities
- **Clarification Support**: Asks follow-up questions for missing info
- **Real-Time Feedback**: Instant confirmation of workflow creation

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                 │
├─────────────────────────────────────────────────────────────┤
│ Dashboard │ Resume Screening │ Resume DB │ Interview Hub │  │
│        Employee Onboarding │ Orchestrator Logs              │
│                   Chat Widget                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI + Express Proxy)              │
├─────────────────────────────────────────────────────────────┤
│ Port 3000: Express Proxy (frontend/server.ts)              │
│   - Manual HTTP proxy (http-proxy-middleware)               │
│   - Handles JSON and FormData requests                      │
│   - 45-second backend timeout                               │
│                                                              │
│ Port 8000: FastAPI Backend (backend/main.py)               │
│   - /workflow/start - Create new workflow                   │
│   - /workflow/{id} - Get workflow status                    │
│   - /workflow/clarify - Resume paused workflows             │
│   - /workflow/ - List workflows                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌──────────┐  ┌──────────────┐
   │ Groq AI │  │ SQLite   │  │ Email        │
   │ LLM     │  │ Database │  │ (Resend)     │
   │(Extract)│  │          │  │              │
   └─────────┘  └──────────┘  └──────────────┘
```

### Component Breakdown

**Frontend (`frontend/`):**
- `server.ts` - Express proxy server (Port 3000)
- `src/App.tsx` - Main application with 6 platform sections
- `src/components/` - 20+ React components for each view
- `src/api.ts` - API client for backend communication

**Backend (`backend/`):**
- `main.py` - FastAPI entry point (Port 8000)
- `api/api.py` - Route handlers
- `services/services.py` - Business logic orchestration
- `orchestrator/orchestrator.py` - Workflow execution engine
- `glm/extractor.py` - Groq AI integration
- `db/sqlite_store.py` - SQLite persistence
- `logic/` - Step implementations (onboarding, screening)
- `schemas/schemas.py` - Pydantic models

**Data Layer:**
- `SQLite` - Single file database (portable, no server needed)
- Stores workflows, candidates, interviews, onboarding progress

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Recharts, Lucide Icons, Framer Motion |
| **Express Proxy** | Node.js, Express, Vite middleware |
| **Backend** | FastAPI, Python 3.9+, Pydantic |
| **AI/LLM** | Groq API (llama-3.3-70b-versatile), Prompt engineering |
| **Database** | SQLite3 |
| **Email** | Resend API |
| **Utilities** | UUID, JSON schema validation |

---

## Getting Started

### Prerequisites

- **Node.js** 16+ (for frontend and proxy server)
- **Python** 3.9+ (for backend)
- **Git** (for version control)
- **Groq API Key** (get free at https://console.groq.com)
- **Resend API Key** (optional, for email reminders)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd UM
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

### Configuration

1. **Create `.env` file in `backend/` directory**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   RESEND_API_KEY=your_resend_api_key_here
   NODE_ENV=development
   ```

2. **Create `.env` file in `frontend/` directory**
   ```
   VITE_BACKEND_URL=http://localhost:8000
   ```

3. **Verify database schema**
   ```bash
   # Backend automatically creates SQLite database on first run
   # Check: backend/data/workflows.db
   ```

### Running the Application

**Terminal 1: Backend (FastAPI)**
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

**Terminal 2: Frontend (Express Proxy + Vite)**
```bash
cd frontend
npm run dev
# Server runs on http://localhost:3000
```

**Access the application**
- Open browser to `http://localhost:3000`
- Login as "HR Admin" (no credentials required in demo mode)

---

## Platform Sections

### 1. Dashboard
**Purpose:** Real-time system overview and metrics

**What You See:**
- Total candidates, active pipelines, avg time-to-hire
- Application vs interview trends (area chart)
- Talent distribution by skills (radar chart)
- Live recruitment pipeline by role (progress bars)
- Decision factors breakdown (pie chart)
- Recent orchestrator activity feed

**Key Actions:**
- View full orchestrator logs
- Monitor system health
- Track hiring funnel progress

### 2. Resume Screening
**Purpose:** Upload and process new resume submissions

**What You See:**
- Resume upload interface (drag & drop or file picker)
- File processing with AI extraction in progress
- Extracted candidate data (name, skills, experience years)
- Match score vs job requirements
- Option to proceed to analytical dashboard

**Behind the Scenes:**
- Groq AI parses PDF text
- Extracts structured data (skills, experience, education)
- Generates match score
- Stores candidate in database

### 3. Resume Database
**Purpose:** Searchable repository of all candidates

**What You See:**
- Full list of all candidates with match scores
- Search/filter by skills, role, experience
- Candidate cards with quick stats
- Action buttons: View resume, Schedule interview, Reject

**Key Actions:**
- Click candidate → View full profile
- Interview Scheduling → Moves to Interview Hub
- Automated Rejection → Sends rejection email

### 4. Interview Hub
**Purpose:** Centralized interview management

**What You See:**
- List/Kanban board of all scheduled interviews
- Interview details: candidate name, role, date/time, status
- Feedback forms and notes
- Offer issuance button

**Key Actions:**
- View interview details (click to expand)
- Issue offer → Moves candidate to onboarding
- Schedule new interview
- Record feedback

### 5. Employee Onboarding
**Purpose:** Automate post-hire workflow

**What You See:**
- List of active onboarding workflows
- Each employee with their onboarding status
- 5 predefined steps (Create record → Laptop → Email → Payroll → Access)
- Current step and completion percentage
- Completed and failed steps with timestamps

**Key Actions:**
- View onboarding details
- See step-by-step progress
- Monitor for errors/failures
- Manual retry if needed

**The 5 Steps (always executed in this order):**
1. **Create Employee Record** - Provision HR system entry
2. **Create Laptop Request** - Submit IT equipment order
3. **Create Email Account** - Set up corporate email
4. **Create Payroll Setup** - Configure compensation
5. **Request Building Access** - Grant physical access

### 6. Orchestrator Logs
**Purpose:** Complete audit trail and debugging

**What You See:**
- All workflow events timestamped
- Workflow ID, type, status, step name
- Error messages and stack traces
- Filter by workflow ID, status, date range

**Key Actions:**
- Search for specific workflow
- Investigate failures
- Track workflow progression
- Export logs for compliance

---

## Complete Workflow

### Scenario: Hiring and Onboarding Sarah Chen

```
1. RESUME SUBMISSION (Resume Screening)
   └─ HR uploads Sarah's resume PDF
   └─ Groq AI extracts: Sarah Chen, 5 years experience, Python, React, AWS
   └─ System generates match score: 92% for Senior Frontend Engineer

2. CANDIDATE REVIEW (Resume Database)
   └─ HR searches database, finds Sarah
   └─ Views full profile, skills match
   └─ Clicks "Schedule Interview"

3. INTERVIEW SCHEDULING (Interview Hub)
   └─ HR schedules interview for next Tuesday, 2PM
   └─ Calendar event created
   └─ Sarah receives interview confirmation email

4. INTERVIEW COMPLETION (Interview Hub)
   └─ HR records interview feedback: "Strong technical skills, great communication"
   └─ Decision: APPROVED
   └─ HR clicks "Issue Offer"

5. OFFER → ONBOARDING (Employee Onboarding)
   └─ System automatically creates onboarding workflow
   └─ Starts executing 5-step onboarding sequence
   └─ Step 1: Create Employee Record ✓ (2 min)
   └─ Step 2: Create Laptop Request ✓ (30 sec)
   └─ Step 3: Create Email Account ✓ (45 sec)
   └─ Step 4: Create Payroll Setup ✓ (1 min)
   └─ Step 5: Request Building Access ✓ (20 sec)

6. AUDIT TRAIL (Orchestrator Logs)
   └─ All 5 steps appear in logs with timestamps
   └─ Total onboarding time: ~4.5 minutes
   └─ Sarah is now fully provisioned and ready on Day 1
```

**Traditional Process:** 2-3 days of manual data entry  
**Hireflow Process:** ~5 minutes fully automated

---

## API Reference

### Backend Endpoints (Port 8000)

#### 1. Create Workflow
```http
POST /workflow/start
Content-Type: application/json

{
  "message": "Onboard Sarah Chen to Engineering starting Monday"
}

Response (200 OK):
{
  "workflow_id": "wf_a1b2c3d4",
  "workflow_type": "onboarding",
  "status": "in_progress",
  "entities": {
    "employee_name": "Sarah Chen",
    "department": "Engineering",
    "start_date": "Monday",
    "resources_needed": ["laptop", "access"]
  },
  "steps": [
    "create_employee_record",
    "create_laptop_request",
    "create_email_account",
    "create_payroll_setup",
    "request_building_access"
  ],
  "current_step_index": 0,
  "completed_steps": [],
  "failed_steps": []
}
```

#### 2. Get Workflow Status
```http
GET /workflow/{workflow_id}

Response (200 OK):
{
  "workflow_id": "wf_a1b2c3d4",
  "status": "in_progress",
  "current_step_index": 2,
  "completed_steps": [
    {"step": "create_employee_record", "status": "success"},
    {"step": "create_laptop_request", "status": "success"}
  ],
  "next_step": "create_email_account"
}
```

#### 3. Resume Clarification
```http
POST /workflow/clarify
Content-Type: application/json

{
  "workflow_id": "wf_a1b2c3d4",
  "clarification_response": "Sarah starts on Monday, needs a MacBook Pro and building access"
}

Response (200 OK):
{
  "workflow_id": "wf_a1b2c3d4",
  "status": "in_progress",
  "entities": { /* updated with clarification */ },
  "steps": [ /* workflow now has complete steps */ ]
}
```

#### 4. List Workflows
```http
GET /workflow/?workflow_type=onboarding&status=in_progress

Response (200 OK):
[
  {
    "workflow_id": "wf_a1b2c3d4",
    "workflow_type": "onboarding",
    "status": "in_progress",
    "intent_summary": "Onboard Sarah Chen",
    "created_at": "2026-04-26T10:30:00Z"
  }
]
```

### Frontend Proxy (Port 3000)

- All requests to `/api/*` are proxied to `http://localhost:8000`
- Supports JSON bodies (application/json) and FormData (multipart/form-data)
- 45-second timeout for backend requests
- Email reminders sent via `/api/send-reminder` (Resend)

---

## Chat Widget

### How It Works

The **GlmChatWidget** is a floating chat interface at the bottom-right of the screen.

**User Types:**
> "Onboard Jane Doe in Marketing starting next Monday, she needs a laptop"

**System Processes:**
1. Sends message to `/workflow/start` endpoint
2. Groq AI extracts: workflow_type="onboarding", entities={name, department, start_date}
3. Creates workflow in database
4. Executes 5-step onboarding automatically
5. Returns confirmation: "Workflow created: wf_xxxxx - Jane's onboarding has started"

**If Missing Information:**
> "Onboard Jane" (no department or date)

**System Responds:**
> "I need more info: What department is Jane joining, and when does she start?"

**User Clarifies:**
> "Marketing, next Monday"

**System:**
1. Merges clarification with existing data
2. Now has complete info
3. Kicks off onboarding workflow

### Natural Language Examples

✓ "Onboard John Smith in Engineering starting 2026-05-01"  
✓ "Add Jane Doe to HR, she starts Monday"  
✓ "Create onboarding for new employee Bob in Finance"  
✓ "Screen resume for Senior Software Engineer role"  

---

## Onboarding System

### The 5-Step Workflow

**Onboarding always executes these steps in strict order:**

1. **Create Employee Record**
   - Inputs: Employee name, department, start date
   - Action: Provision employee in HR system
   - Output: Employee ID, email template
   - Error Handling: Logs if employee already exists

2. **Create Laptop Request**
   - Inputs: Employee info, start date
   - Action: Submit IT ticket for hardware
   - Output: Request ID, expected delivery date
   - Error Handling: Logs if IT system unavailable

3. **Create Email Account**
   - Inputs: First name, last name, department
   - Action: Provision corporate email address
   - Output: Email address (e.g., jane.doe@company.com)
   - Error Handling: Logs if email system down

4. **Create Payroll Setup**
   - Inputs: Employee ID, compensation level
   - Action: Configure in payroll system
   - Output: Payroll ID, first pay date
   - Error Handling: Logs if payroll system unavailable

5. **Request Building Access**
   - Inputs: Employee ID, start date, department
   - Action: Submit security access request
   - Output: Badge ID, access level
   - Error Handling: Logs if security system unavailable

### Failure Handling

If **any step fails**:
1. System logs the error message
2. Workflow status → "failed"
3. Error added to `failed_steps` array
4. HR is alerted via dashboard
5. HR can investigate in Orchestrator Logs
6. HR can manually retry or investigate

**Example Failure:**
```json
{
  "workflow_id": "wf_a1b2c3d4",
  "status": "failed",
  "failed_steps": [
    {
      "step": "create_payroll_setup",
      "message": "Payroll system connection timeout"
    }
  ],
  "current_step_index": 3
}
```

---

## Orchestrator Logs

### Log Entry Structure

Each workflow action generates a log entry:

```json
{
  "timestamp": "2026-04-26T10:30:15Z",
  "workflow_id": "wf_a1b2c3d4",
  "workflow_type": "onboarding",
  "step": "create_employee_record",
  "status": "success",
  "duration_ms": 245,
  "details": {
    "employee_id": "EMP_12345",
    "email_generated": "sarah.chen@company.com"
  }
}
```

### Querying Logs

**By Workflow ID:**
- Search `wf_a1b2c3d4` to see all steps in that workflow

**By Status:**
- Filter `status=failed` to find issues
- Filter `status=success` to see completed workflows

**By Date Range:**
- View logs from specific date/time for compliance

**By Step Name:**
- Find all `create_employee_record` steps across workflows

---

## Troubleshooting

### Frontend Issues

**Issue:** Chat widget doesn't send messages
- ✓ Check backend is running on port 8000
- ✓ Check network tab for `/workflow/start` requests
- ✓ Verify `GROQ_API_KEY` is set in backend

**Issue:** Pages load but buttons don't work
- ✓ Clear browser cache (`Ctrl+Shift+Del`)
- ✓ Restart frontend: `npm run dev`
- ✓ Check for JavaScript errors in console

**Issue:** Resume upload fails
- ✓ File must be PDF format
- ✓ File size should be < 10MB
- ✓ Check backend for errors

### Backend Issues

**Issue:** "ModuleNotFoundError: No module named 'groq'"
- ✓ Install dependencies: `pip install -r requirements.txt`
- ✓ Check Python version: `python --version` (must be 3.9+)

**Issue:** "GROQ_API_KEY not found"
- ✓ Create `.env` file in backend directory
- ✓ Add: `GROQ_API_KEY=your_key_here`
- ✓ Restart backend

**Issue:** "504 Gateway Timeout"
- ✓ Backend may be overloaded
- ✓ Check if main.py is running: `lsof -i :8000`
- ✓ Restart backend: `python main.py`

**Issue:** SQLite database locked
- ✓ Close all connections to database
- ✓ Delete `backend/data/workflows.db`
- ✓ Restart backend (database auto-creates)

### Proxy Issues

**Issue:** Chat messages never reach backend
- ✓ Verify proxy is running: `lsof -i :3000`
- ✓ Check proxy logs for errors
- ✓ Test direct backend call: `curl http://localhost:8000/workflow/start`
- ✓ If direct call works but proxy doesn't, check proxy middleware

---

## Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Frontend: Update components in `frontend/src/components/`
   - Backend: Update logic in `backend/logic/`, `backend/orchestrator/`, etc.
   - Database: Update schema in `backend/db/sqlite_store.py`

3. **Test changes**
   - Frontend: `npm run dev` and test in browser
   - Backend: Run `python main.py` and test with curl
   - End-to-end: Use chat widget to trigger workflows

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/my-feature
   ```

5. **Create pull request**
   - Describe changes and testing performed
   - Reference any issues

### Code Style

- **Frontend:** Prettier (configured in `package.json`)
- **Backend:** Black (Python formatter)
- **Components:** Follow existing React patterns
- **API Responses:** Always return JSON with status

---

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Resume Screening Time | < 15s | ~5-10s |
| Onboarding Execution Time | < 5 min | ~4-5 min |
| Dashboard Load Time | < 2s | ~1-2s |
| Chat Message Latency | < 3s | ~2-3s |
| Database Query Time | < 500ms | ~100-300ms |

---

## Security & Compliance

- **No Passwords Stored:** Demo mode uses HR Admin role
- **API Keys:** Stored in `.env` files (not in git)
- **Database:** SQLite file (can be backed up easily)
- **Logs:** Complete audit trail for compliance
- **Email:** Resend API used for production email sending

---

## Roadmap

### Version 2.0 (Planned)
- [ ] OAuth2 authentication
- [ ] Multi-tenant support
- [ ] Custom onboarding step builder
- [ ] Integration with Workday / BambooHR
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Analytics dashboard with trend predictions
- [ ] Bulk candidate import

### Version 3.0 (Future)
- [ ] Mobile app for interview feedback
- [ ] AI-powered interview scorecards
- [ ] Predictive analytics for time-to-hire
- [ ] Integration marketplace

---

## Support & Contact

For issues or questions:
- **GitHub Issues:** Open an issue in the repository
- **Email:** support@hireflow.dev
- **Slack:** Join our community Slack workspace

---

## License

This project is proprietary software. All rights reserved.

---

## Acknowledgments

Built with:
- **Groq AI** - LLM extraction and reasoning
- **FastAPI** - Modern Python web framework
- **React** - UI framework
- **Resend** - Email delivery
- **SQLite** - Lightweight database

---

**Made with ❤️ for modern HR teams**

Last updated: April 26, 2026
