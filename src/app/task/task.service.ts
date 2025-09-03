import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpParams, HttpResponse, HttpUploadProgressEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Task } from './task.model';
import { Client } from '../model/client.model';
import { TaskHistory } from '../model/task-history';
import { map, catchError, filter } from 'rxjs/operators';
import { TaskHistoryDto, toTaskHistory } from '../model/task-history';
import { TaskResponseDTO } from '../model/task-response-dto';
type HistoryApiResponse = TaskHistory[] | { data: TaskHistory[] };

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:8084/api/tasks';
  private baseUrl = 'http://localhost:8084/api/files';
  private tasks = signal<Task[]>([]);
  a: any;

  constructor(private http: HttpClient) {}

  // ✅ Get filtered tasks with pagination & sorting
getFilteredTasks(
  client: string = '',
  status: string = '',
  search: string = '',
  page: number = 0,
  size: number = 10,
  sortField: string = 'assignDate',
  sortDirection: 'asc' | 'desc' = 'asc'
): Observable<PaginatedResponse<Task>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('sort', `${sortField},${sortDirection}`);

  if (client) params = params.set('client', client);
  if (status && status !== 'ALL') params = params.set('status', status);
  if (search) params = params.set('search', search);

  return this.http.get<PaginatedResponse<Task>>(this.apiUrl, { params });
}

getTasks(
  page: number,
  size: number,
  sortBy: string,
  sortDirection: string,
  filters: { clientName?: string; status?: string; searchTerm?: string }
): Observable<{ content: Task[]; totalPages: number; totalElements: number }> {
  const params = new HttpParams()
    .set('page', String(page))
    .set('size', String(size))
    .set('sortBy', sortBy ?? '')
    .set('sortDirection', sortDirection ?? '')
    .set('clientName', filters?.clientName ?? '')
    .set('status', filters?.status ?? '')
    .set('searchTerm', filters?.searchTerm ?? '');

  return this.http.get<{ content: Task[]; totalPages: number; totalElements: number }>(
    `${this.apiUrl}/filter`,
    { params }
  );
}


downloadFileAsBlob(objectName: string) {
    const url = `${this.baseUrl}/download?objectName=${encodeURIComponent(objectName)}`;
  return this.http.get(`${url}`, { responseType: 'blob' });
}

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  add(taskData: FormData): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, taskData);
  }

  update(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: 'Open' | 'InProgress' | 'Closed'): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}/status`, { status });
  }

  uploadAttachment(taskId: string, file: File): Observable<File> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<File>(`${this.apiUrl}/${taskId}/attachment`, formData);
  }

  refreshTasks() {
    this.getAll().subscribe(tasks => this.tasks.set(tasks));
  }

  getTasksSignal() {
    return this.tasks.asReadonly();
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }
  downloadFile(objectName: string): Observable<Blob> {
    const url = `${this.baseUrl}/download?objectName=${encodeURIComponent(objectName)}`;
  return this.http.get(`${url}`, { responseType: 'blob' });
}
updateTask(id: string, task: Task) { return this.http.put<Task>(`${this.apiUrl}/${id}`, task); }
deleteTask(id: string) { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

 getTaskHistory(taskId: string): Observable<TaskHistory[]> {
    return this.http
      .get<TaskHistoryDto[]>(`${this.apiUrl}/${taskId}/history`)
      .pipe(map(rows => rows.map(toTaskHistory)));
  }

   updateTaskMultipart(id: string, form: FormData): Observable<TaskResponseDTO> {
    return this.http.put<TaskResponseDTO>(`${this.apiUrl}/${id}`, form);
  }

  // Progress version: emits numbers (0..100) and finally TaskResponseDTO
  updateTaskMultipartWithProgress(
    id: string,
    form: FormData
  ): Observable<number | TaskResponseDTO> {
    return this.http
      .put<TaskResponseDTO>(`${this.apiUrl}/${id}`, form, {
        observe: 'events',
        reportProgress: true,
      })
      .pipe(
        // Narrow HttpEvent to only UploadProgress or Response
        filter(
          (
            e: HttpEvent<TaskResponseDTO>
          ): e is HttpUploadProgressEvent | HttpResponse<TaskResponseDTO> =>
            e.type === HttpEventType.UploadProgress ||
            e.type === HttpEventType.Response
        ),
        map((e) => {
          if (e.type === HttpEventType.UploadProgress) {
            const total = e.total ?? 0;
            const loaded = e.loaded ?? 0;
            return total ? Math.round((loaded / total) * 100) : 0;
          }
          // Here e is HttpResponse<TaskResponseDTO>
          return e.body as TaskResponseDTO;
        })
      );
  }
}
