---
name: create-endpoint
description: Guides the creation of a new Backend API endpoint following Clean Architecture and DDD standards.
---

# Create Endpoint Skill

When developing a new Backend feature or REST endpoint in InterceptorSystem, follow this exact checklist:

## 1. Clean Architecture Layers

- **Domain First**: Ensure the underlying Domain Entity exists. Only modify state using its behavioral methods (`entity.Atualizar()`). Use `Enforce(isValid, msg)` for invariants — not `CheckRule`.
- **Value Objects before strings**: For CPF, CNPJ, Email, CEP, Telefone — check if a Value Object already exists in `Domain/SharedKernel/ValueObjects/` before using raw `string`. If a VO is missing, create it there.
- **Entity Size vs Value Objects**: A 300–500 line Aggregate Root is normal. If an entity approaches 800–1000 lines, split properties into **Value Objects**.
- **Application Layer**: Create Request/Response **DTOs**. API Controllers must ONLY accept and return DTOs, never Domain Entities.
- **CQRS with MediatR**: Every write operation needs a `*Command` + `*CommandHandler`. Every read operation needs a `*Query` + `*QueryHandler`. AppServices are facades that delegate via `ISender.Send(new Command(...), ct)`.

## 2. Database & State Management

- **Transactions**: Do NOT call `SaveChanges` directly. Persist using `_repository.UnitOfWork.CommitAsync(ct)` from the CommandHandler.
- **Async/Await + CancellationToken**: Every database I/O method must use `async/await`, be suffixed with `Async`, and accept `CancellationToken ct = default`.

## 3. Multi-Tenancy Security

- Ensure the query relies on the Global Query Filter (`HasQueryFilter(e => e.EmpresaId == _tenantService.EmpresaId)`) implicitly.
- Do NOT allow the consumer to set or modify `EmpresaId` via the Controller. The tenant ID is immutable and extracted securely from the JWT.

## 4. External Services — Ports

- If the feature involves an external service (email, JWT, WhatsApp, password hashing), define an `I*Port` interface in `Application/Ports/Outbound/`. Never inject a concrete adapter directly into Application.

## 5. Bounded Context Boundaries

- The endpoint must belong to one of the 3 BCs: `Operacoes`, `Auth`, or `Whatsapp`.
- Controllers and AppServices in one BC must NOT inject repositories or AppServices from another BC. Use `I*Port` (ACL) for cross-BC access.

## 6. API Controller Rules

- Suffix controller names with `Controller`.
- Return proper HTTP status schemas in Swagger (e.g. `[ProducesResponseType(StatusCodes.Status200OK)]`, `400`, `404`, `409`).
- Use Constructor Injection for the `AppService`.

## 7. Validation Checklist

- [ ] Fail-fast: `Enforce(isValid, msg)` in constructors and behavioral methods. Throws `DomainException`, not `InvalidOperationException`.
- [ ] Verify functionality with the **generate-tests** skill (requiring 3 specific test cases).
