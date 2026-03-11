---
name: create-endpoint
description: Guides the creation of a new Backend API endpoint following Clean Architecture and DDD standards.
---

# Create Endpoint Skill

When developing a new Backend feature or REST endpoint in InterceptorSystem, follow this exact checklist:

## 1. Clean Architecture Layers
- **Domain First**: Ensure the underlying Domain Entity exists. Only modify state using its behavioral methods (`entity.Atualizar()`).
- **Entity Size vs Value Objects**: A 300 to 500-line Aggregate Root Entity is considered a normal size. If an entity were to reach 800-1000 lines, you must split its properties into **Value Objects**.
- **Application Layer**: Create Request/Response **DTOs**. API Controllers must ONLY accept and return DTOs, never Domain Entities.
- **Application Services / MediatR**: The business flow must be orchestrated inside an `AppService` or a MediatR handler.

## 2. Database & State Management
- **Transactions**: Do NOT call `SaveChanges` directly in Repositories. Persist data using `_repository.UnitOfWork.CommitAsync()` from the AppService.
- **Async/Await**: Ensure every database I/O method uses `async/await` and is suffixed with `Async`.

## 3. Multi-Tenancy Security
- Ensure the query relies on the Global Query Filter (`HasQueryFilter(e => e.EmpresaId == _tenantService.EmpresaId)`) implicitly.
- Do NOT allow the consumer to set or modify `EmpresaId` via the Controller. The tenant ID is immutable and extracted securely from the JWT.

## 4. API Controller Rules
- Suffix controller names with `Controller`.
- Return proper HTTP status schemas in Swagger (e.g. `[ProducesResponseType(StatusCodes.Status200OK)]`, `400`, `404`, `409`).
- Use Constructor Injection for the `AppService`.

## 5. Validation Checklist
- [ ] Fail-fast policy: Throw bounded exceptions (`InvalidOperationException` or custom) early if business rules are violated.
- [ ] Verify functionality with the **generate-tests** skill (requiring 3 specific test cases).
