export interface OnboardingEmployee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  startDate: string;
  status: 'In Progress' | 'Pending' | 'Completed';
  progress: number;
  manager: string;
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'Pending' | 'Overdue';
  dueDate: string;
}
