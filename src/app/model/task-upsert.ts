// src/app/model/task-upsert.ts
export type TaskStatus = 'Open' | 'InProgress' | 'Closed';

export interface TaskUpsert {
  id?: string;                 // only for update
  name: string;
  clientId: string;
  description?: string | null;
  assignedTo: string;
  status: TaskStatus;
  assignDate: string;          // 'YYYY-MM-DD' (required)
  closeDate?: string | null;   // 'YYYY-MM-DD' or ''
  remarks?: string | null;
  createdBy?: string | null;
}
