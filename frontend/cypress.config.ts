import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
    specPattern: "src/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "src/e2e/support.ts",
    video: false,
    screenshotOnRunFailure: false,
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
      options: {
        projectConfig: {
          root: '',
          sourceRoot: 'src',
          buildOptions: {
            tsConfig: 'cypress/tsconfig.json'
          }
        }
      }
    },
    specPattern: "src/app/**/*.cy.ts",
  },
});
