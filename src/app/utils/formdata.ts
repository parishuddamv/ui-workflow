// src/app/utils/formdata.ts
export function buildTaskFormData(data: {
  name: string;
  clientId: string;
  description?: string | null;
  assignedTo: string;
  status: 'Open' | 'InProgress' | 'Closed';
  assignDate: string;             // YYYY-MM-DD
  closeDate?: string | null;      // YYYY-MM-DD or null/empty
  remarks?: string | null;
  createdBy?: string | null;
  files?: File[];
}): FormData {
  const fd = new FormData();

  fd.append('name', data.name ?? '');
  fd.append('clientId', data.clientId ?? '');
  fd.append('assignedTo', data.assignedTo ?? '');
  fd.append('status', data.status ?? 'Open');
  fd.append('assignDate', data.assignDate);            // required

  if (data.description) fd.append('description', data.description);
  if (data.closeDate)    fd.append('closeDate', data.closeDate); // omit if empty → null on backend
  if (data.remarks)      fd.append('remarks', data.remarks);
  if (data.createdBy)    fd.append('createdBy', data.createdBy);

  (data.files ?? []).forEach(f => fd.append('files', f, f.name));
  return fd;
}
