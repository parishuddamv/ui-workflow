import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from './task.service';
import { Client } from '../model/client.model';
import { HttpErrorResponse } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss'],
})
export class TaskCreateComponent implements OnInit {
  name = '';
  description = '';
  assignedTo = '';
  status: 'Open' | 'InProgress' | 'Closed' = 'Open';
  assignDate: string = new Date().toISOString().split('T')[0];

  clients: Client[] = [];
  clientId = '';
  files: File[] = [];
  isDragOver = false;
  errorMessage: string | null = null;

  constructor(private taskService: TaskService) {
    try {
      const keycloak = inject(KeycloakService);
      console.log('TaskCreateComponent: Logged in:', keycloak.isLoggedIn());
      if (keycloak.isLoggedIn()) {
        keycloak.getToken().then(
          token => console.log('TaskCreateComponent: Token:', token.substring(0, 20) + '...'),
          error => console.error('TaskCreateComponent: Failed to get token:', error)
        );
        keycloak.loadUserProfile().then(
          profile => console.log('TaskCreateComponent: User profile:', profile),
          error => console.error('TaskCreateComponent: Failed to load user profile:', error)
        );
      } else {
        console.log('TaskCreateComponent: Triggering Keycloak login');
        keycloak.login();
      }
    } catch (error) {
      console.error('TaskCreateComponent: KeycloakService error:', error);
    }
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.taskService.getClients().subscribe({
      next: clients => (this.clients = clients),
      error: err => console.error('Failed to load clients:', err),
    });
  }

  // File handlers
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

  async save() {
    this.errorMessage = null;
    if (!this.clientId || !this.assignDate) {
      this.errorMessage = 'Client and assign date are required';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', this.name);
      formData.append('clientId', this.clientId);
      formData.append('description', this.description || '');
      formData.append('assignedTo', this.assignedTo);
      formData.append('status', this.status);
      formData.append('assignDate', this.assignDate);
      this.files.forEach(file => formData.append('files', file));

      const createdTask = await this.taskService.add(formData).toPromise();
      if (!createdTask?.id) throw new Error('Task creation failed');

      console.log('Task created:', createdTask);
      this.resetForm();
    } catch (error: any) {
      if (error instanceof HttpErrorResponse) {
        this.errorMessage = `Error: ${error.status} ${error.statusText}`;
      } else {
        this.errorMessage = error.message || 'Unknown error';
      }
      console.error('Task creation error:', error);
    }
  }


  resetForm() {
  // Reset form fields
  this.name = '';
  this.description = '';
  this.assignedTo = '';
  this.status = 'Open';
  this.assignDate = new Date().toISOString().split('T')[0]; // Today's date
  this.clientId = '';

  // Clear files and attachments
  this.files = [];


  // Clear error message
  this.errorMessage = null;
  
  // Optional: reset drag-over state
  this.isDragOver = false;
}

}
