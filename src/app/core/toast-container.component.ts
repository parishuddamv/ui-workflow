import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrap" aria-live="polite" aria-atomic="true">
      <div class="toast" *ngFor="let t of toasts" [class]="cssClass(t.type)">
        <div class="toast-msg">{{ t.message }}</div>
        <button class="toast-close" (click)="dismiss(t.id)" aria-label="Close">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrap {
      position: fixed; top: 16px; right: 16px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
    }
    .toast {
      min-width: 260px; max-width: 420px;
      padding: 12px 14px; border-radius: 10px;
      color: #0f172a; background: #fff; border: 1px solid #e5e7eb;
      box-shadow: 0 8px 24px rgba(0,0,0,.08);
      display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px;
      animation: slidein .18s ease-out;
    }
    .toast.success { border-color: #16a34a33; background: #ecfdf5; }
    .toast.error   { border-color: #ef444433; background: #fef2f2; }
    .toast.info    { border-color: #2563eb33; background: #eff6ff; }
    .toast.warn    { border-color: #f59e0b33; background: #fffbeb; }
    .toast-msg { white-space: pre-wrap; }
    .toast-close {
      border: 0; background: transparent; color: #334155; cursor: pointer;
      font-size: 18px; line-height: 1; padding: 2px 6px; border-radius: 6px;
    }
    .toast-close:hover { background: #e5e7eb; }
    @keyframes slidein { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub?: Subscription;
  private timers = new Map<number, Subscription>();

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toast.toast$.subscribe(t => {
      this.toasts = [...this.toasts, t];
      const s = timer(t.duration).subscribe(() => this.dismiss(t.id));
      this.timers.set(t.id, s);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.timers.forEach(s => s.unsubscribe());
    this.timers.clear();
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(x => x.id !== id);
    this.timers.get(id)?.unsubscribe();
    this.timers.delete(id);
  }

  cssClass(type: Toast['type']): string {
    return `toast ${type}`;
  }
}
