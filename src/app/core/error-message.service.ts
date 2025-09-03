// src/app/core/error-message.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  get(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { detail?: string; title?: string; errors?: Record<string, string> };
      if (body?.errors) {
        return Object.entries(body.errors).map(([k, v]) => `${k}: ${v}`).join('\n');
      }
      return body?.detail || body?.title || err.message || 'Bad request';
    }
    if (err instanceof Error) return err.message;
    return 'Bad request';
  }
}
