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

## Docker Compose Endpoint Routing

- The frontend build was serving static files without any `/api` proxy in [frontend/nginx-frontend.conf](frontend/nginx-frontend.conf).
- The Angular dev server used by `compose.override.yml` also had no proxy config, so requests from `http://localhost:4200`/`4201` stayed on the frontend origin.
- Added a dev-server proxy at [frontend/proxy.conf.json](frontend/proxy.conf.json) targeting the `api` service on `http://api:8080`.
- Added an Nginx `/api/` proxy in [frontend/nginx-frontend.conf](frontend/nginx-frontend.conf) pointing to the backend Nginx service for the production compose path.
- Verified the frontend production build completes successfully after the change.
- The development compose override now publishes API port `5010` on the host, matching [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts#L3) and preventing `ERR_CONNECTION_REFUSED` during local browser use.
- Local Angular now uses a relative `apiUrl` so `/api/*` routes go through the dev-server proxy, while the compose override still keeps host port `5010` open for direct calls when needed.
