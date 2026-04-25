import type { WorkflowResponse, ScreeningResult, Role, RoleOverride, ReminderPayload } from './types/api';

const API_BASE = '/api';
const REQUEST_TIMEOUT = 20000; // 20 seconds

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  console.log(`[API] Fetching: ${options?.method || 'GET'} ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    console.log(`[API] About to call fetch...`);
    const res = await fetch(url, { ...options, signal: controller.signal });
    console.log(`[API] Got response with status: ${res.status}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `API error: ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    console.error(`[API] Fetch error:`, err);
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${REQUEST_TIMEOUT / 1000}s. Backend may be unresponsive.`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Workflow APIs
// ---------------------------------------------------------------------------

export async function startWorkflow(message: string): Promise<WorkflowResponse> {
  return request<WorkflowResponse>('/workflow/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

export async function clarifyWorkflow(workflowId: string, clarificationResponse: string): Promise<WorkflowResponse> {
  return request<WorkflowResponse>('/workflow/clarify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow_id: workflowId, clarification_response: clarificationResponse }),
  });
}

export async function getWorkflow(workflowId: string): Promise<WorkflowResponse> {
  return request<WorkflowResponse>(`/workflow/${workflowId}`);
}

export async function listWorkflows(params?: { workflow_type?: string; status?: string }): Promise<WorkflowResponse[]> {
  const query = new URLSearchParams();
  if (params?.workflow_type) query.set('workflow_type', params.workflow_type);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return request<WorkflowResponse[]>(`/workflow/${qs ? `?${qs}` : ''}`);
}

// ---------------------------------------------------------------------------
// Screening APIs
// ---------------------------------------------------------------------------

export async function runScreening(formData: FormData): Promise<WorkflowResponse> {
  return request<WorkflowResponse>('/screening/run', {
    method: 'POST',
    body: formData,
  });
}

export async function getScreeningResults(workflowId: string): Promise<ScreeningResult[]> {
  return request<ScreeningResult[]>(`/screening/results/${workflowId}`);
}

export async function getRoles(): Promise<Role[]> {
  return request<Role[]>('/screening/roles');
}

export async function getRole(roleName: string): Promise<Role> {
  return request<Role>(`/screening/roles/${encodeURIComponent(roleName)}`);
}

export async function updateRole(roleName: string, overrides: RoleOverride): Promise<{ message: string; role: Role }> {
  return request(`/screening/roles/${encodeURIComponent(roleName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(overrides),
  });
}

// ---------------------------------------------------------------------------
// Email Reminder (Express route — not proxied)
// ---------------------------------------------------------------------------

export async function sendReminder(payload: ReminderPayload): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/api/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}