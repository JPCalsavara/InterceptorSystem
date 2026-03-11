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
- Keep the Domain completely clean of EF attributes.

## 4. Safe Commands
- Recommend the exact `dotnet ef migrations add <Name>` and `dotnet ef database update` commands, specifying the correct `--startup-project ../InterceptorSystem.Api` parameters.
