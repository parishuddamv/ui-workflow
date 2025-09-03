// Keep this aligned with what your backend returns in TaskResponseDTO

export type TaskStatus = 'Open' | 'InProgress' | 'Closed';

export interface AttachmentDTO {
  filename: string;
  url: string;
}

export interface TaskResponseDTO {
  id: string;                     // UUID
  name: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;             // 'Open' | 'InProgress' | 'Closed'
  assignDate: string;             // ISO date string from server (e.g., "2025-09-01")
  closeDate?: string | null;      // ISO or null
  attachments: AttachmentDTO[];   // from server
  clientName: string | null;
}

// Optional: normalize dates to Date objects for UI use
export interface TaskViewModel extends Omit<TaskResponseDTO, 'assignDate' | 'closeDate'> {
  assignDate: Date;
  closeDate?: Date | null;
}

export function toTaskViewModel(dto: TaskResponseDTO): TaskViewModel {
  return {
    ...dto,
    assignDate: dto.assignDate ? new Date(dto.assignDate) : new Date(),
    closeDate: dto.closeDate ? new Date(dto.closeDate) : null,
  };
}
