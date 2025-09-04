export const environment = {
  production: true,
  apiBase: '/api', // Caddy proxies /api → backend
  keycloak: {
    url: 'http://localhost:8080/auth',
    realm: 'tasktool-realm',
    clientId: 'tasktool-frontend'
  }
};
