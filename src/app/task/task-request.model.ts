export interface TaskRequest {
  subject: string;
  mailBody: string;
  assignedTo: string;
  remarks?: string;
}
