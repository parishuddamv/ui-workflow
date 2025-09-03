import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task/task.service';
import { Task } from '../task/task.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMessageService } from '../core/error-message.service';
import { ToastContainerComponent } from '../core/toast-container.component';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-task-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  task: Task | null = null;
  files: File[] = [];
  isDragOver = false;
  errorMessage: string | null = null;
  errorMsg: string | null = null;
  isSubmitting = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private errorMessageService: ErrorMessageService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      this.taskService.getTaskById(taskId).subscribe((task) => {
        this.task = task;
      });
    }
  }

    onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files.push(...Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files) {
      this.files.push(...Array.from(event.dataTransfer.files));
    }
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  formatSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    return (size / 1048576).toFixed(1) + ' MB';
  }

  // In your component .ts

clients: Array<{ id: string; name: string }> = []; // if you already load clients, bind here

resolveClientName(clientId?: string | null): string {
  if (!clientId || !this.clients?.length) return '';
  const c = this.clients.find(x => x.id === clientId);
  return c?.name ?? '';
}

updateTask(): void {
  // 1) Narrow the nullable task
  if (!this.task) {
    this.errorMsg = 'No task loaded.';
    return;
  }

  const { id, name, description, assignedTo, status, clientId } = this.task;

  // 2) Validate required bits you actually need
  if (!id) {
    this.errorMsg = 'Missing task id.';
    return;
  }
  if (!clientId) {
    this.errorMsg = 'Missing client id.';
    return;
  }

  // 3) Build FormData safely (FormData only accepts strings/Blobs)
  const fd = new FormData();
  fd.append('name', name ?? '');
  fd.append('description', description ?? '');
  fd.append('assignedTo', assignedTo ?? '');
  fd.append('status', status ?? 'Open');     // ensure a string is sent
  fd.append('clientId', clientId);

  for (const f of this.files) {
    fd.append('files', f, f.name);
  }

  // 4) Submit
  this.isSubmitting = true;
  this.taskService.updateTaskMultipart(id, fd).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.toastService.success('Task updated successfully.')
    },
      // success UI
    error: (err) => this.toastService.error(this.errorMessageService.get(err))
    
  });
}
}


