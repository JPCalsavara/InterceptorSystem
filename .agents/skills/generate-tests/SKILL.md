---
name: generate-tests
description: Automatically generates Unit or Integration tests for C# components based on project standards.
---

# Generate Tests Skill

When creating or updating tests, enforce the following InterceptorSystem standards:

## 1. Test Coverage Requirement
- Every functionality must have **at least 3 test cases**:
  1. **Good Case** (Valid input, expected success result).
  2. **Incomplete/Edge Case** (Missing non-required fields, boundary values).
  3. **Bad Case** (Invalid input, expected exception or bad request).
- Every endpoint must have exactly these **3 test cases** minimally implemented.

## 2. Framework & Tooling
- Use **xUnit** as the test framework.
- Use **Moq** for mocking dependencies.
- Arrange, Act, Assert (AAA) pattern must be visibly separated by blank lines or comments.

## 3. Mocking Dependencies
- Always mock `ICurrentTenantService` to return a consistent `EmpresaId` since the system is strictly Multi-Tenant.
- Use constructor injection (`new MyService(mockRepo.Object, mockTenant.Object)`).

## 4. Testing Domain Entities
- Verify that state modifications happen exclusively through the domain entity's behavioral methods (e.g., `AtualizarDados()`), not direct setters.
- Verify `EmpresaId` remains untouched.
