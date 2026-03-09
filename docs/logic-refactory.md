# Prompt Engineering: Event-Driven Cache Invalidation Refactoring

## 1. Persona
You are a Senior .NET Software Engineer and Cloud Solutions Architect with deep expertise in Domain-Driven Design (DDD), Clean Architecture, and Event-Driven Architecture (EDA). You specialize in performance optimization, caching strategies, and AWS cost reduction.

## 2. Context
The `InterceptorSystem` is an enterprise SaaS application managing security services (Condominiums, Employees, Workstations, and Allocations). Our database (AWS RDS PostgreSQL) is currently incurring high costs due to excessive, repetitive read queries on mostly static data (e.g., fetching lists of Condominiums, Employees, and Workstations). 
Our entities already inherit from a base `Entity` class that contains a `_domainEvents` collection. However, a dispatcher has not been implemented to utilize this collection. To reduce AWS costs and improve response times, we need to implement an Event-Driven Architecture using the `MediatR` library to handle cache invalidation cleanly without polluting the Application layer services.

## 3. Objectives
- Implement an Event-Driven notification system using `MediatR`.
- Dispatch accumulated domain events from the `Entity` automatically upon `DbContext.SaveChanges()`.
- Add caching (`IMemoryCache`) to high-volume read endpoints in the Application Layer.
- Invalidate specific cache keys via `MediatR` Event Handlers when an entity is created, updated, or deleted.
- Keep the `AppService` command methods (Create, Update, Delete) completely unaware of the caching infrastructure.

## 4. Acceptance Criteria
- [ ] The `MediatR` library is installed and configured in the `Application` and `Infrastructure` layers.
- [ ] A `DomainEventDispatcher` is hooked into the Entity Framework `SaveChanges`/`CommitAsync` process to publish all pending `DomainEvents`.
- [ ] Domain events (e.g., `CondominioCreatedEvent`, `CondominioUpdatedEvent`) exist in the `Domain` layer and are added to the entity before saving.
- [ ] Event listeners (Handlers) are implemented in the `Infrastructure` or `Application` layer to remove specific `IMemoryCache` keys upon receiving the events.
- [ ] Read methods (e.g., `GetAllAsync`) in `AppServices` first attempt to retrieve data from `IMemoryCache` before querying the database.
- [ ] The core business logic remains independent of caching logic.

## 5. Tasks / Execution Prompts

### Task 1: Setup MediatR and Event Dispatcher
"As a Senior .NET Engineer, install the `MediatR` NuGet package in the Application and Infrastructure projects. Update the `AppDbContext` to include an event dispatcher that reads `Entity.DomainEvents` and calls `IMediator.Publish()` for each event right before or after `SaveChanges()` is successfully committed. Ensure you clear the events from the entity after dispatching."

### Task 2: Create Domain Events
"Create the Domain Events in the `Domain` layer for the `Condominio` entity (e.g., `CondominioCreatedEvent`, `CondominioUpdatedEvent`, `CondominioDeletedEvent`). These events should implement `INotification` (from MediatR) and carry the `EmpresaId` payload, as the cache keys are isolated by Tenant."

### Task 3: Emit Events from Entities
"Modify the `Condominio` domain entity. Inside the rich constructor, the `AtualizarDados` method, and the `Desativar` method, append the newly created domain events to the base class's `AddDomainEvent()` method."

### Task 4: Implement Cache Invalidation Handlers
"In the `Infrastructure` layer, create a `CondominioCacheInvalidationHandler` that implements `INotificationHandler<CondominioCreatedEvent>`, etc. Inject `IMemoryCache` into this handler, and implement the `Handle` method so that it executes `_cache.Remove($"Condominios_{notification.EmpresaId}")` when triggered."

### Task 5: Implement Cache Lookups in Queries
"Update the `CondominioAppService.cs`. Inject `IMemoryCache`. In the `GetAllAsync` method, check if the key `$"Condominios_{empresaId}"` exists. If it does, return the cached list. If not, fetch from the repository, store the result in the cache with an expiration policy (e.g., 10 minutes), and then return it. Ensure no caching logic is added to the Command methods."
