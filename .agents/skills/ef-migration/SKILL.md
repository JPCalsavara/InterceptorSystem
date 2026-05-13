---
name: ef-migration
description: Safely sets up EF Core Entity configurations and applies database migrations.
---

# EF Migration Skill

When creating or altering database models using Entity Framework Core 8, apply the following rigorous checks to protect data integrity and tenant isolation:

## 1. Multi-Tenant Integrity

- **Global Query Filter**: If creating a new Entity mapped to the DB, its `IEntityTypeConfiguration` MUST include:
  `builder.HasQueryFilter(e => e.EmpresaId == _tenantService.EmpresaId);`
- **Immutability**: `EmpresaId` MUST NOT be updatable. Ensure its mapping explicitly ignores updates if necessary, or verify it doesn't have a public setter in the Domain entity.

## 2. Relationships & Cascade Deletion

- Ensure parent-child relationships have the appropriate `OnDelete(DeleteBehavior.Cascade)` or `.Restrict` configured.
- E.g., deleting a `Cliente` might cascade to `Posto` and `Contrato`, but this must be explicitly mapped in the configurations.

## 3. EF Configuration File

- Do NOT use Data Annotations (like `[Column]`, `[Required]`) inside the Domain Entities.
- Place all DB config purely inside `Infrastructure/Persistence/Configurations/` implementing `IEntityTypeConfiguration<T>`.
- Keep the Domain completely clean of EF attributes — including `[NotMapped]`. Use `builder.Ignore(e => e.Property)` in the configuration instead.

## 4. Value Objects — OwnsOne Mapping

- Value Objects (Cpf, Cnpj, Email, Telefone, Cep) must be mapped using `OwnsOne`:
  ```csharp
  // FuncionarioConfiguration.cs
  builder.OwnsOne(f => f.Cpf, cpf =>
      cpf.Property(c => c.Valor).HasColumnName("Cpf").IsRequired().HasMaxLength(11));
  ```
- Always specify `HasColumnName("OriginalColumnName")` to preserve existing column names — the migration will issue `AlterColumn`, not a destructive rename.
- For nullable VOs (e.g., `Email? EmailGestor`):
  ```csharp
  builder.OwnsOne(c => c.EmailGestor, email =>
      email.Property(e => e.Valor).HasColumnName("EmailGestor").HasMaxLength(255));
  ```

## 5. Migration Naming Convention

- Use the pattern `<Action>_<Entity>` describing what changed:
  - `Add_ValueObjects` — when introducing VO mappings across multiple entities
  - `Add_Cpf_ValueObject_To_Funcionarios` — when scoped to one entity
  - `Add_IOperacoesQueryPort_Adapter` — for structural changes

## 6. Safe Commands

```bash
# Always specify both --project and --startup-project
dotnet ef migrations add <Name> \
  --project InterceptorSystem.Infrastructure \
  --startup-project InterceptorSystem.Api

dotnet ef database update \
  --startup-project InterceptorSystem.Api

# Verify no unexpected schema changes after namespace refactoring:
dotnet ef migrations list \
  --startup-project InterceptorSystem.Api
```

## 7. Post-Namespace-Refactoring Check

- After moving entities to `BoundedContexts/` folder, verify the generated migration does NOT include any `RenameTable` operations — EF uses `ToTable("Clientes")` from the configuration, which doesn't change when namespaces change.
- If an unexpected `RenameTable` appears, check that `builder.ToTable(...)` is still present in the `IEntityTypeConfiguration`.
