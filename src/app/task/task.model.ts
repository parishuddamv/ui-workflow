export interface Task {
  id: string;
  name : string;
  description: string;
  assignedTo: string;
  status: 'Open' | 'InProgress' | 'Closed';
  assignDate: string;
  closeDate?: string;
  attachments: Attachment[];  // ✅ ensure included
  clientName?: string;        // ✅ backend sends clientName
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  clientId?: string;          // ✅ include clientId for creating/editing tasks
}

export interface Attachment {
  filename: string;
  url: string;
}
