export interface WorkflowEntities {
  employee_name: string;
  department: string;
  start_date: string;
  resources_needed: string[];
  job_role: string;
  required_skills: string[];
  minimum_experience_years: number;
  candidate_count: number;
  requirement_source: 'job_description' | 'inferred_default' | 'unknown';
  job_description_provided: boolean;
}

export interface WorkflowResponse {
  workflow_id: string;
  workflow_type: 'onboarding' | 'resume_screening' | 'unknown';
  status: 'in_progress' | 'completed' | 'failed' | 'paused' | 'awaiting_clarification' | 'not_implemented';
  intent_summary: string;
  confidence: number;
  entities: WorkflowEntities;
  missing_fields: string[];
  next_action: string;
  steps: string[];
  current_step_index: number;
  completed_steps: any[];
  failed_steps: any[];
  runtime_data: Record<string, any>;
  action_logs: any[];
  clarification: {
    missing_fields?: string[];
    question?: string;
  };
  user_clarification: {
    original_question?: string;
    user_response?: string;
  };
}

export interface ScreeningResult {
  id: number;
  workflow_id: string;
  candidate_name: string;
  candidate_email: string;
  resume_filename: string;
  role_name: string;
  match_score: number;
  match_breakdown: Record<string, any>;
  status: string;
  interview_scheduled: boolean;
  interview_datetime: string | null;
  created_at: string;
}

export interface Role {
  id: number;
  role_name: string;
  required_skills: string[];
  min_experience_years: number;
  max_experience_years: number | null;
  qualifications: string[];
  languages: string[];
}

export interface RoleOverride {
  required_skills?: string[];
  min_experience_years?: number;
  max_experience_years?: number;
  qualifications?: string[];
  languages?: string[];
}

export interface ReminderPayload {
  targetEmail: string;
  targetName?: string;
  taskTitle: string;
  dueDate?: string;
  isInternal?: boolean;
  employeeName?: string;
}