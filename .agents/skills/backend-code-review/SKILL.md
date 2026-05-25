---
name: backend-code-review
description: Revisa os pull requests e as diffs do backend C# para garantir que as regras da Clean Architecture, Multi-Tenant e Fail-Fast (Exceptions) não sejam quebradas.
---

# Backend Code Review

## Propósito
Analisar alterações de código C# .NET no Backend antes do merge ou para gerar feedback em Pull Requests, avaliando apenas questões críticas da arquitetura e vazamento de regras de domínio.

## Foco do Review
- **Clean Architecture:** Entidades de Domínio não podem ter injeção de Repositórios e não podem referenciar o Entity Framework.
- **Controllers Limpos:** Controllers não podem ter if/else de negócio. Eles devem apensar delegar a execução para AppServices.
- **Fail-Fast:** Regras de negócio quebradas devem jogar `DomainException`.
- **Multi-Tenant:** Certifique-se de que buscas estão respeitando o escopo do usuário atual (não ignorando o Global Query Filter).

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.

## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
