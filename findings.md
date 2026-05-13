# Findings

## Project Structure

- Backend: `/home/jpcalsavara/projetos/andamento/InterceptorSystem/backend`
- Frontend: `/home/jpcalsavara/projetos/andamento/InterceptorSystem/frontend`

## Test Command Discovery

- Unit Tests: `npm test` (uses `@angular/build:unit-test`)
- E2E Tests: TBD (looking for Cypress config)

## Failure Log

### Unit Tests (`npm test`)

- `src/app/pages/dashboard/dashboard.component.spec.ts`:
  - `fakeAsync` and `tick` are not found. Missing imports from `@angular/core/testing`.
- `src/app/services/contrato.service.spec.ts`:
  - `percentualImpostos` property doesn't exist on `Contrato`.

## Domain Changes

- `Contrato` model seems to have had `percentualImpostos` renamed or removed.

## Auth/Login Investigation

- `AuthController.Login` accepts `CancellationToken ct = default`, but still calls `_authAppService.LoginAsync(input)` without forwarding the token.
- `AuthAppService.LoginAsync` does not accept or inspect a `CancellationToken`; it only reads the account by e-mail, verifies the password, and issues JWT.
- The repository used by login (`IContaRepository.GetByEmailAsync(string email)`) also has no cancellation-token overload, so the token is inert in the current login path.
- Only one `POST /api/auth/login` route exists in the API, so there is no route collision caused by the token parameter.

## Frontend GitHub Actions Review

- The frontend CI workflow does include a frontend job, but its test step was swallowing failures with `|| echo`, which could let broken unit tests pass as green.
- The frontend deploy workflow was using `push` only, so it did not actually wait for the CI workflow to complete successfully despite the comment saying it did.
- The deploy workflow also had no `workflow_run` chain and no check for whether the triggering commit touched the frontend.
- The frontend build output is already laid out as `frontend/dist/frontend/browser/`, so the deploy artifact path is consistent with the local Angular build.

## Frontend Unit Test Fix

- The failing service specs were expecting `http://localhost/api/...`, but the services under test use relative API paths like `/api/...`.
- Updating the shared `apiBase` constant to `''` in the service specs fixed the mismatched HTTP expectations across the suite.
- `npm run test:ci` now passes with 17 test files and 84 tests.

## Docker Compose Endpoint Routing

- The frontend build was serving static files without any `/api` proxy in [frontend/nginx-frontend.conf](frontend/nginx-frontend.conf).
- The Angular dev server used by `compose.override.yml` also had no proxy config, so requests from `http://localhost:4200`/`4201` stayed on the frontend origin.
- Added a dev-server proxy at [frontend/proxy.conf.json](frontend/proxy.conf.json) targeting the `api` service on `http://api:8080`.
- Added an Nginx `/api/` proxy in [frontend/nginx-frontend.conf](frontend/nginx-frontend.conf) pointing to the backend Nginx service for the production compose path.
- Verified the frontend production build completes successfully after the change.
- The development compose override now publishes API port `5010` on the host, matching [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts#L3) and preventing `ERR_CONNECTION_REFUSED` during local browser use.
- Local Angular now uses a relative `apiUrl` so `/api/*` routes go through the dev-server proxy, while the compose override still keeps host port `5010` open for direct calls when needed.
