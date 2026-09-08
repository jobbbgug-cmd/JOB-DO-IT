export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress?: number;
  lane?: string;
  dueDate?: string;
  assignee?: string;
  assignees?: any[];
  creator?: string;
  createdAt?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  attachments?: string[];
}
