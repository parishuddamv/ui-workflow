import { provideKeycloak, withAutoRefreshToken, UserActivityService } from 'keycloak-angular';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'http://localhost:8080/auth',
        realm: 'task-tool-realm',
        clientId: 'task-tool-frontend'
      },
      features: [
        withAutoRefreshToken({ onInactivityTimeout: 'logout', sessionTimeout: 60000 }),
      ],
      providers: [UserActivityService]
    }),
    provideRouter(routes)
  ]
};
