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
- Pass `CancellationToken.None` explicitly in all async mock setups and act calls.

## 4. Testing Domain Entities

- Verify that state modifications happen exclusively through the domain entity's behavioral methods (e.g., `AtualizarDados()`), not direct setters.
- Verify `EmpresaId` remains untouched.
- Verify `Enforce` invariants: calling a behavioral method with invalid data must throw `DomainException`.

## 5. Testing Value Objects

- Every Value Object must have at minimum:
  1. **Good Case**: valid input creates the VO successfully.
  2. **Bad Case**: invalid input (e.g., CPF with 10 digits, CNPJ with letters) throws `DomainException`.
  3. **Edge Case**: boundary value (e.g., 11 vs 12 digit CPF).
- Example:
  ```csharp
  [Fact]
  public void Cpf_ComFormatoInvalido_DeveLancarDomainException()
  {
      // Act & Assert
      Assert.Throws<DomainException>(() => Cpf.Criar("1234567890")); // 10 digits
  }
  ```

## 6. Testing Domain Events

- After calling a behavioral method, verify the aggregate raised the expected Domain Event:
  ```csharp
  [Fact]
  public void Cliente_AoSerCriado_DeveRegistrarClienteCreatedEvent()
  {
      var cliente = new Cliente(empresaId, "Nome", "00000000000191", ...);
      Assert.Single(cliente.DomainEvents);
      Assert.IsType<ClienteCreatedEvent>(cliente.DomainEvents.First());
  }
  ```

## 7. Testing CommandHandlers

- CommandHandlers replace AppServices as the primary unit under test for write operations.
- Required 3 cases for each handler:
  1. **Good Case**: valid command → entity created/updated, `CommitAsync` called once.
  2. **Not Found Case**: entity doesn't exist → `KeyNotFoundException` thrown.
  3. **Invalid Input Case**: domain invariant violated → `DomainException` thrown.
- Example mock setup:
  ```csharp
  _repo.Setup(r => r.UnitOfWork).Returns(_uow.Object);
  _uow.Setup(u => u.CommitAsync(CancellationToken.None)).ReturnsAsync(true);
  ```
