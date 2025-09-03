export type HistoryAction =
  | 'CREATED'
  | 'UPDATED'
  | 'ATTACHMENT_ADDED'
  | 'ATTACHMENT_REMOVED';

export interface TaskHistoryDto {
  id: number;
  action: HistoryAction;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  updatedBy: string;
  changedAt: string | null;             // ISO string from server
  attachmentFilename?: string | null;
  attachmentUrl?: string | null;
}

export interface TaskHistory {
  id: number;
  action: HistoryAction;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  updatedBy: string;
  changedAt: Date;                      // normalized to Date
  attachmentFilename?: string | null;
  attachmentUrl?: string | null;
}

export function toTaskHistory(dto: TaskHistoryDto): TaskHistory {
  return {
    id: dto.id,
    action: dto.action,
    fieldChanged: dto.fieldChanged ?? null,
    oldValue: dto.oldValue ?? null,
    newValue: dto.newValue ?? null,
    updatedBy: dto.updatedBy,
    changedAt: dto.changedAt ? new Date(dto.changedAt) : new Date(),
    attachmentFilename: dto.attachmentFilename ?? null,
    attachmentUrl: dto.attachmentUrl ?? null,
  };
}
