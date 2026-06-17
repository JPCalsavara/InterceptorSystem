export const environment = {
  production: true,
  // Caminho relativo — CloudFront roteia /api/* para a EC2 automaticamente.
  // Não precisa de CORS porque frontend e API ficam no mesmo domínio CloudFront.
  apiUrl: '/api',
  googleClientId: '427573291755-ovgde695oj314pnhu9l5qvss3nfgke3h.apps.googleusercontent.com',
};
