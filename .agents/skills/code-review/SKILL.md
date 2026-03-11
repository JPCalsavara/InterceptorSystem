---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
---

# Code Review Skill

When reviewing code, follow these steps:

## Review checklist

1. **Correctness**: Does the code do what it's supposed to?
2. **Edge cases**: Are error conditions handled?
3. **Style**: Does it follow project conventions?
4. **Performance**: Are there obvious inefficiencies?

## Architecture & Best Practices Checklist

When reviewing Backend / C# code, specifically check for:

- **Immutability of the Tenant**: The tenant ID (`EmpresaId`) must never change after creation.
- **DTOs rule the Application Layer**: API controllers interact solely with DTOs, never directly returning or accepting raw Domain Entities.
- **Dependency Injection**: Always use constructor injection for services, repositories, and configurations (`IOptions`).
- **Asynchronous Code**: Use `async/await` exclusively for database I/O and suffix methods with `Async`.
- **Testing Requirements**:
  - Every functionality must have at least 3 unit tests: good case, incomplete case, and bad case.
  - Every endpoint must have 3 test cases: good case, incomplete case, and bad case.
- **Architecture Principles**: Ensure the code follows SOLID, Clean Architecture, Clean Code, and Domain-Driven Design (DDD) principles.

## How to provide feedback

- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible
