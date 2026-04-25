export interface FileItem {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed';
}

export interface KanbanCard {
  id: string;
  candidateName: string;
  score: number;
  column: 'screening' | 'onboarding' | 'manual' | 'intervention' | 'rejected';
}

export interface TraceSubStep {
  id: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  text: string;
  pills?: string[];
}

export interface TraceStep {
  id: string;
  status: 'pending' | 'loading' | 'completed';
  title: string;
  pills?: string[];
  subSteps?: TraceSubStep[];
}

export interface ChatMessage {
  id: string;
  role: 'agent' | 'user' | 'system';
  type: 'text' | 'json' | 'action' | 'trace';
  content: any; // Used for trace array when type is 'trace'
  actionLabel?: string;
  isComplete?: boolean; // For trace progress tracking
}
