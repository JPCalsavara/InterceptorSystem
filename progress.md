# Progress Log

## 2026-05-13

- Started task to fix frontend tests.
- Initialized planning files.
- Investigated the login regression hypothesis around `CancellationToken`.
- Confirmed the token is currently unused in the login service path and does not change the `/api/auth/login` route behavior.
- Investigated the docker compose endpoint issue.
- Confirmed the frontend was not proxying `/api` to the backend in either dev-server or production container mode.
- Added frontend proxy routing for local compose and validated the Angular production build successfully.
- Exposed the API on host port 5010 in the development compose override and verified the merged compose config publishes `5010 -> 8080`.
- Switched the local frontend environment to use the internal `/api` proxy instead of calling `http://localhost:5010` directly.
- Revalidated the frontend production build after the environment change.
- Reviewed the GitHub Actions configuration for the frontend and found two issues: the CI test step masked failures, and the deploy workflow was not chained to CI success.
- Updated the frontend CI test step to fail on test errors and reworked the deploy workflow to trigger from the CI workflow after successful frontend changes only.
