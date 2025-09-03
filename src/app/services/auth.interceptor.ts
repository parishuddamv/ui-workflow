import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const keycloak = inject(KeycloakService);

  if (keycloak.isLoggedIn()) {
    return from(keycloak.getToken()).pipe(
      switchMap((token: string | null) => {
        if (token) {
          const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
          return next(authReq);
        }
        return next(req);
      }),
      catchError((error) => {
        console.error('AuthInterceptor: HTTP request failed:', error);
        return throwError(() => error);
      })
    );
  }
  return next(req);
};