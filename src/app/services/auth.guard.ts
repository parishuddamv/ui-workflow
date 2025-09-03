import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = () => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = keycloak.isLoggedIn();
  if (isLoggedIn) {
    return true;
  }
  keycloak.login({ redirectUri: window.location.origin });
  return router.createUrlTree(['/']);
};