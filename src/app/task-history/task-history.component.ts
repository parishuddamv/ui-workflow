// src/app/task-history/task-history.component.ts
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { TaskService } from '../task/task.service';
import { TaskHistory } from '../model/task-history'; // <- ensure this path/file name

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskHistoryComponent implements OnInit, OnChanges {
  @Input() taskId: string | null = null;

  histories: TaskHistory[] = [];
  isLoading = false;
  errorMsg = '';

  constructor(
    private historyService: TaskService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.taskId) this.fetchHistory(this.taskId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId'] && this.taskId) this.fetchHistory(this.taskId);
  }

  private fetchHistory(id: string): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.markForCheck(); // reflect the spinner immediately

    this.historyService
      .getTaskHistory(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck(); // ensure view updates even with OnPush/zoneless
        })
      )
      .subscribe({
        next: (rows) => {
          this.histories = Array.isArray(rows) ? rows : [];
          // Optional: quick sanity log
          // console.debug('history rows', this.histories);
        },
        error: (err) => {
          // if you have getErrorMessage(), use it here
          this.errorMsg = err?.message || 'Failed to load history.';
          // markForCheck already called in finalize
        },
      });
  }

  openAttachment(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  trackById = (i: number, row: TaskHistory) => row.id ?? i;
}
