# Cache Refactory Plan

## Context

The project currently uses a mixed cache strategy:

- Frontend has per-entity read-through cache (`signal + getAll`) in service layer.
- Frontend invalidation is mostly local to each service.
- Backend has read-through cache only for Cliente list.
- Some screens still load large datasets via `getAll()` and filter in client.

This causes consistency risks and unnecessary network/processing, especially in dependency chains:

- `Posto -> Alocacao -> Diaria`
- `Contrato -> Alocacao + Funcionario + Diaria`

## Goal

Implement a simple and efficient cache model with explicit dependency invalidation, tenant-safe data access, and scoped endpoints for client detail flows.

## Recommended Model

1. Keep per-entity cache stores in frontend.
2. Add explicit dependency invalidation map:
   - posto changed -> invalidate posto, alocacao, diaria
   - alocacao changed -> invalidate alocacao, diaria
   - contrato changed -> invalidate contrato, alocacao, funcionario, diaria
   - funcionario changed -> invalidate funcionario, diaria
   - cliente changed -> invalidate all cliente-scoped lists
3. Prefer scoped fetch endpoints for detail screens:
   - `GET /api/clientes/{id}/alocacoes`
   - `GET /api/clientes/{id}/diarias`
   - optional `GET /api/clientes/{id}/contratos`
4. Optional API side:
   - add read-through cache + invalidation for hot lists beyond Cliente.

## Current Risks To Solve

- Dependency caches are not guaranteed to refresh together after mutations.
- Some detail views still fetch broad tenant data and filter locally.
- Posto delete semantics (soft delete) can diverge from expected cascade behavior if reads do not filter active records.

## Architecture Decisions

### Frontend

- Keep cache ownership in each entity service.
- Add a centralized invalidation coordinator to propagate dependency invalidation.
- Trigger invalidation only on successful mutation response.

### Backend

- Keep tenant isolation by `EmpresaId` global filter.
- Add scoped endpoints to avoid client-side heavy filtering.
- Optionally extend backend read-through cache by scope (`EmpresaId + Entity + ScopeId`).

## Tasks

### Phase A - Frontend Cache Coordinator

- [x] Create `EntityCacheCoordinatorService` in `frontend/src/app/services/`.
- [x] Define entity keys: `cliente`, `posto`, `alocacao`, `diaria`, `contrato`, `funcionario`, `tag`.
- [x] Implement dependency invalidation map.
- [x] Add public API:
  - `registerInvalidator(entityKey, fn)`
  - `invalidate(entityKey)`
  - `invalidateWithDependencies(entityKey)`

### Phase B - Service Refactor (Frontend)

- [x] Refactor `cliente.service.ts` to register invalidator and call coordinator on mutation.
- [x] Refactor `posto.service.ts` with dependency invalidation (`posto` chain).
- [x] Refactor `alocacao.service.ts` with dependency invalidation.
- [x] Refactor `diaria.service.ts` with dependency invalidation.
- [x] Refactor `contrato.service.ts` with dependency invalidation.
- [x] Refactor `funcionario.service.ts` with dependency invalidation.
- [x] Keep `getAll()` read-through behavior unchanged for call sites.

### Phase C - Scoped Endpoints (Backend)

- [x] Add app/repository query for `Alocacao` by `clienteId`.
- [x] Add app/repository query for `Diaria` by `clienteId` (via `Alocacao` relation).
- [x] Optional: add app/repository query for `Contrato` by `clienteId`.
- [ ] Expose endpoints:
  - [x] `GET /api/clientes/{id}/alocacoes`
  - [x] `GET /api/clientes/{id}/diarias`
  - [x] optional `GET /api/clientes/{id}/contratos`

### Phase D - Screen Migration

- [x] Update `cliente-detail` to consume scoped endpoints instead of broad `getAll` filtering.
- [x] Update other heavy screens that can benefit from scoped endpoints.
- [x] Ensure behavior parity in metrics/cards/grids.

### Phase E - Consistency Rules

- [x] Decide and apply a single Posto delete policy:
  - Option 1: hard delete + DB cascade
  - Option 2: soft delete + `Ativo == true` enforced on list queries
- [x] Align frontend list expectations with chosen policy.

### Phase F - Optional API Cache Expansion

- [x] Add read-through cache for hot scoped lists (`Posto/Funcionario/Contrato` by cliente).
- [x] Add invalidation hooks on relevant mutations.
- [x] Use deterministic keys by tenant/scope.

### Phase G - Validation and Tests

- [x] Unit test invalidation map behavior (frontend coordinator).
- [x] Service-level tests for cache hit/miss and invalidation on CRUD.
- [x] Integration tests for scoped endpoints.
- [ ] Manual validation in browser Network tab:
  - [ ] repeated navigation does not spam `getAll()`
  - [ ] mutation refreshes changed entity and dependency chain only

## Acceptance Criteria

- Mutations invalidate cache deterministically according to dependency map.
- Client detail flows load scoped data from API (no large broad fetch for related entities).
- Data remains tenant-safe and consistent after create/update/delete actions.
- Network traffic is reduced while preserving UI correctness.

## Suggested Execution Order

1. Frontend coordinator service.
2. Service refactor with dependency invalidation.
3. Backend scoped endpoints.
4. Screen migration (`cliente-detail` first).
5. Posto delete policy alignment.
6. Optional API cache expansion.
7. Tests and network validation.
