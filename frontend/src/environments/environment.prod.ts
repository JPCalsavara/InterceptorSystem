export const environment = {
  production: true,
  // Caminho relativo — CloudFront roteia /api/* para a EC2 automaticamente.
  // Não precisa de CORS porque frontend e API ficam no mesmo domínio CloudFront.
  apiUrl: '/api',
  googleClientId: 'COLOQUE_SEU_CLIENT_ID_AQUI.apps.googleusercontent.com',
};
