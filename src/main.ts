import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';
import { KeycloakService } from 'keycloak-angular';
import { APP_INITIALIZER } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

async function initializeKeycloak(keycloak: KeycloakService) {
  try {
    const initialized = await keycloak.init({
      config: {
        clientId: 'task-tool-2',
        realm: 'task-tool',
        url: 'http://localhost:8081',
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,
        redirectUri: window.location.origin,
      },
      // We use our own interceptor below
      enableBearerInterceptor: false,
      bearerExcludedUrls: ['/assets', '/public'],
    });

    if (initialized) {
      const isLoggedIn = await keycloak.isLoggedIn(); // <-- await!
      console.log('Keycloak initialized, logged in:', isLoggedIn);

      if (isLoggedIn) {
        const profile = await keycloak.loadUserProfile();
        console.log('Keycloak user profile:', profile);
      }

      // Keep token fresh (attempt refresh every 3 minutes, refresh if <60s left)
      setInterval(async () => {
        try {
          await keycloak.updateToken(60);
        } catch (err) {
          console.error('Token refresh failed:', err);
          keycloak.login({ redirectUri: window.location.origin + '/create' });
        }
      }, 180_000);
    }

    return initialized;
  } catch (error) {
    console.error('Keycloak initialization failed:', error);
    return false;
  }
}

export function keycloakInitializer(keycloak: KeycloakService) {
  return () => initializeKeycloak(keycloak);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    KeycloakService,
    provideAnimations(),
    {
      provide: APP_INITIALIZER,
      useFactory: keycloakInitializer,
      deps: [KeycloakService],
      multi: true,
    },
    provideRouter(routes),
  ],
}).catch((err) => console.error('Bootstrap error:', err));
