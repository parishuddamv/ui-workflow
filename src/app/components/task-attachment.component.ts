import { Component, Input } from '@angular/core';
import { TaskService } from '../task/task.service';

@Component({
  selector: 'app-task-attachment',
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    <button (click)="upload()" [disabled]="!selectedFile">Upload</button>
    <p *ngIf="message">{{ message }}</p>
  `,
  standalone: true,
})
export class TaskAttachmentComponent {
  @Input() taskId!: string;
  selectedFile: File | null = null;
  message = '';

  constructor(private taskService: TaskService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  async upload() {
    if (!this.selectedFile || !this.taskId) return;

    try {
      await this.taskService.uploadAttachment(this.taskId, this.selectedFile);
      this.message = 'File uploaded successfully!';
    } catch (err) {
      console.error(err);
      this.message = 'Upload failed. Check console for details.';
    }
  }
}
