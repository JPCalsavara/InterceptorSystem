import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4201',
    specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/e2e/support.ts',
    video: false,
    screenshotOnRunFailure: false,
  },
});
