# Backend System Logic Overview (InterceptorSystem)

## 1. System Architecture
- **Architecture Style**: Clean Architecture + Domain-Driven Design (DDD).
- **Core Layers**:
  - `Domain`: Contains Entities, Value Objects, Domain Events, Enums, and Repository Interfaces. No external dependencies.
  - `Application`: Contains AppServices, DTOs, and Use Cases. Implements the business workflow.
  - `Infrastructure`: DbContext, EF Core mappings, Third-party service integrations (Email, WhatsApp), JWT generation.
  - `Api`: Controllers, Dependency Injection via `Program.cs`, Middlewares (Global Error Handling).

## 2. Standard Logic and Patterns
- **Multi-Tenancy**: The entire system is scoped by `EmpresaId`. A global query filter restricts data on DbContext level (`HasQueryFilter(e => e.EmpresaId == _tenantService.EmpresaId)`).
- **Rich Models**: Entities are not anemic. State modification happens through encapsulated methods (e.g., `AtualizarDados()`), and validation is done inside the entity using rules (`CheckRule()`).
- **Fail-Fast Policy**: Exceptions are thrown early if business rules are violated (usually `InvalidOperationException` temporarily, or custom exceptions).
- **Unit of Work**: Repositories do not call `SaveChanges`. Save is called from the AppService via `_repository.UnitOfWork.CommitAsync()`.

## 3. Best Practices
- **Immutability of the Tenant**: The tenant ID (`EmpresaId`) must never change after creation.
- **DTOs rule the Application Layer**: API controllers interact solely with DTOs, never directly returning or accepting raw Domain Entities.
- **Dependency Injection**: Always use constructor injection for services, repositories, and configurations (`IOptions`).
- **Asynchronous Code**: Use `async/await` exclusively for database I/O and suffix methods with `Async`.

## 4. Key Files and Search Documents
- **`AppDbContext.cs`** (`Infrastructure/Persistence/Contexts`): Foundation for EF Core, multi-tenant global filters, SaveChanges interceptors.
- **`Entity.cs`** (`Domain/Common`): The base entity class housing the ID, TenantID, created date, and domain events list.
- **`ICurrentTenantService.cs`** (`Application/Common/Interfaces`): The provider that extracts `EmpresaId` from the authenticated JWT.
- **`README.md`** (Root): Contains full definitions for Domain Rules (e.g., calculations for Salaries, Job Posts, Contracts).

## 5. Acceptance Criteria for Validating New Logic (Checklist)
- [ ] Are all `DbSet` entities isolated by the global Tenant query filter?
- [ ] Are new properties made `private set` and updated exclusively through behavioral methods in the Entity rather than direct setters?
- [ ] Do Application Services execute operations as a transaction (`UnitOfWork.CommitAsync`)?
- [ ] Are infrastructure secrets managed via environment variables and safely bound via `IOptions`?
- [ ] Does the `swagger` documentation provide clear HTTP status schemas (200, 400, 404, 409) for new endpoints?
