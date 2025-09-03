import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TaskService } from './task.service';
import { Task } from './task.model';
import { PreviewModalComponent } from './preview-modal.component';
import { Router } from '@angular/router';
import { TaskHistoryComponent } from '../task-history/task-history.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PreviewModalComponent,
    ReactiveFormsModule,TaskHistoryComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
    animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(30px)', opacity: 0 }))
      ])
    ])
  ]

})
export class TaskListComponent implements OnInit, OnDestroy {
  showHistoryModal = false;
  selectedTaskHistory: any[] = [];
  selectedTaskName = '';
  histories: any[] = [];
  isLoading = false;

  tasks: Task[] = [];
  activePopupId: string | null = null;
  showEdit = false;
  editForm!: FormGroup;
  selectedTaskId!: string | null;
  saving = false;
  // Preview modal
  previewUrl: string | null = null;
  previewType: 'pdf' | 'image' | 'other' = 'other';

  // Filters
  statusFilter: 'ALL' | 'Open' | 'InProgress' | 'Closed' = 'ALL';
  searchTerm = '';
  clientFilter = '';

  // Pagination
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // Sorting
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField = 'assignDate';
  sortBy = 'assignDate';

  filters: any = {};

  private tasksSubscription?: Subscription;
  private hideTimeout: any;
  

  constructor(private taskService: TaskService, private router: Router ) {}

ngOnInit(): void {
this.filters= {};
  this.loadTasks();
}

  ngOnDestroy(): void {
    this.tasksSubscription?.unsubscribe();
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  /** Load tasks with pagination, sorting, and filters */
  loadTasks(): void {
    this.taskService
      .getTasks(this.page, this.size, this.sortBy, this.sortDirection, this.filters)
      .subscribe({
        next: (data) => {
          this.tasks = data.content;
          this.totalPages = data.totalPages;
          this.totalElements = data.totalElements;
        },
        error: (err) => console.error('Error fetching tasks', err),
      });
  }

  /** Pagination controls */
  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadTasks();
    }
  }

  /** Filter & sort controls */
onFilterChange(): void {
  this.page = 0;
  this.buildFilters();
  this.loadTasks();
}

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.loadTasks();
  }

  /** Task actions */
  showPopup(taskId: string): void {
    this.activePopupId = taskId;
  }

  hidePopup(): void {
    this.activePopupId = null;
  }

  editTask(id: string) {
    this.router.navigate(['/edit', id]);
  }
  deleteTask(id: string): void {
    this.taskService.remove(id).subscribe({
      next: () => this.loadTasks(),
      error: (err) => console.error('Delete failed:', err),
    });
  }

  /** Utility functions */
  getAvatarColor(name: string): string {
    const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getTotalTasks() { return this.tasks.length; }
  getOpenTasks() { return this.tasks.filter(t => t.status === 'Open').length; }
  getInProgressTasks() { return this.tasks.filter(t => t.status === 'InProgress').length; }
  getClosedTasks() { return this.tasks.filter(t => t.status === 'Closed').length; }

  isPdf(url: string | null): boolean {
    return !!url && url.toLowerCase().endsWith('.pdf');
  }

  isImage(url: string | null): boolean {
    return !!url && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
  }

  getFileIcon(filename: string): string {
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.doc') || filename.endsWith('.docx')) return '📝';
    if (filename.endsWith('.zip')) return '📦';
    return '📎';
  }

  formatSize(size?: number): string {
    if (!size) return '';
    if (size < 1024) return size + ' B';
    if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
    return (size / 1048576).toFixed(1) + ' MB';
  }

  getFileName(url: string): string {
    return url.split('/').pop() || url;
  }

  /** Preview & download attachments */
  previewAttachment(objectName: string, event: Event) {
    event.preventDefault();
    this.taskService.downloadFile(objectName).subscribe({
      next: (blob) => {
        this.previewUrl = URL.createObjectURL(blob);
        this.previewType = blob.type === 'application/pdf'
          ? 'pdf'
          : blob.type.startsWith('image/') ? 'image' : 'other';
      },
      error: (err) => console.error('Preview failed', err)
    });
  }

  downloadAttachment(objectName: string, fileName: string) {
    this.taskService.downloadFile(objectName).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      },
      error: (err) => console.error('Download failed', err)
    });
  }

  closePreview() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

   openEdit(task: Task): void {
    this.selectedTaskId = task.id;
    this.editForm.setValue({
      name: task.name ?? '',
      description: task.description ?? ''
    });
    this.showEdit = true;
  }


  onDelete(id: string): void {
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
    }
  }
  
openHistory(taskId: string): void {
  this.selectedTaskId = taskId;   // ✅ pass id to child
  this.showHistoryModal = true;   // show modal
}

  closeHistory(): void {
    this.showHistoryModal = false;
    this.histories = [];
  }

  openAttachment(url: string): void {
    window.open(url, '_blank');
  }
  closeHistoryModal() {
  this.showHistoryModal = false;
  this.selectedTaskId = null;
}

showSmallPopup(id: string) { this.activePopupId = id; }
hideSmallPopup() { this.activePopupId = null; }

private buildFilters() {
  this.filters = {
    clientName: this.clientFilter?.trim() || '',
    status: this.statusFilter === 'ALL' ? '' : this.statusFilter,
    searchTerm: this.searchTerm?.trim() || ''
  };
}

}
