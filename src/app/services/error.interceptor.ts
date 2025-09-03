import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const keycloak = inject(KeycloakService);
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.error('Unauthorized: Triggering Keycloak login');
        keycloak.login({ redirectUri: window.location.origin });
      } else if (error.status === 403) {
        console.error('Forbidden: User lacks required permissions for', req.url);
      }
      return throwError(() => error);
    })
  );
};