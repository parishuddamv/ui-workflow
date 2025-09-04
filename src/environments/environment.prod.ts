export const environment = {
  production: true,
  apiBase: '/api',
  apiBaseUrl: '/api', // optional, for backward compatibility
  keycloak: {
    url: 'https://tasktoolpro.id/auth',
    realm: 'tasktool-realm',
    clientId: 'tasktool-frontend'
  }
};
