import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warn';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number; // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _id = 0;
  private _subject = new Subject<Toast>();
  toast$ = this._subject.asObservable();

  success(message: string, duration = 3000) { this.push('success', message, duration); }
  error(message: string, duration = 5000)   { this.push('error', message, duration); }
  info(message: string, duration = 3000)    { this.push('info', message, duration); }
  warn(message: string, duration = 4000)    { this.push('warn', message, duration); }

  private push(type: ToastType, message: string, duration: number) {
    this._subject.next({ id: ++this._id, type, message, duration });
  }
}
