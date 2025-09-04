export const environment = {
  production: false,
  // keep your old key if you want, but add this alias:
  apiBase: 'http://localhost:8084/api',
  apiBaseUrl: 'http://localhost:8084/api', // optional, for backward compatibility
  keycloak: {
    url: 'http://localhost:8081',
    realm: 'tasktool-realm',
    clientId: 'tasktool-frontend'
  }
};
