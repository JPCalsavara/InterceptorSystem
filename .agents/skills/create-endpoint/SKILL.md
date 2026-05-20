---
name: create-endpoint
description: Guides the creation of a new Backend API endpoint following Clean Architecture, CQRS, and DDD standards.
---

# Create Endpoint Skill

When developing a new Backend feature or REST endpoint in InterceptorSystem, you **MUST** deliver the complete vertical slice and follow the Thin Controller pattern.

## 1. O Fluxo Completo Obrigatório (Vertical Slice)
Sempre que o usuário pedir um novo endpoint, você é obrigado a gerar ou atualizar TODAS as seguintes camadas. Não esqueça de nenhuma:
1. **Domain**: Entidade e seus Value Objects.
2. **DTOs**: Classes de `*Input` / `*Output` anêmicas.
3. **Application**: A interface `I*Service` e sua implementação `*Service` (AppService).
4. **Infrastructure (Data)**: A Interface do Repositório (`IRepository`), a Implementação no repositório concreto e o mapeamento no `AppDbContext`.
5. **Dependency Injection**: Registrar as novas interfaces/classes no `DependencyInjection.cs` da respectiva camada.
6. **API Controller**: Expor a rota.

## 2. Regra de Ouro: Thin Controllers (Controladores Magros)
- **NUNCA** faça validação de regras de negócio ou de campos obrigatórios (`if (input.Valor < 0) return BadRequest()`) dentro do Controller.
- **NUNCA** coloque blocos `try-catch` no Controller.
- **Motivo:** O projeto deve utilizar um **Global Exception Handler Middleware** (ou Action Filter) que captura automaticamente `DomainException` ou `ValidationException` e as converte em `400 BadRequest`, e exceções não tratadas em `500 Internal Server Error`.
- O Controller deve ter apenas 3 coisas: Injeção de dependência, a assinatura da Rota/Swagger, e a chamada `return Ok(await _service.Handle(input, ct));`.

## 3. Clean Architecture & AppServices
- **Domain First**: Altere estado usando apenas métodos da Entidade (`entity.Atualizar()`). Use `Enforce(isValid, msg)` dentro da Entidade para invariantes.
- **AppServices**: Os serviços de aplicação orquestram o fluxo. Eles recebem os DTOs, buscam as entidades no repositório, chamam os comportamentos de domínio e persistem as mudanças.

## 4. Database & State Management
- **Transactions**: NUNCA chame `SaveChanges` no Controller ou no Repositório. Confirme transações usando `_repository.UnitOfWork.CommitAsync(ct)` apenas no `AppService`.
- **Async/Await**: Toda operação de I/O deve ser assíncrona, terminar com o sufixo `Async` e repassar o `CancellationToken ct`.

## 5. Multi-Tenancy Security
- Operações de leitura usam o Global Query Filter (`HasQueryFilter(e => e.EmpresaId == _tenantService.EmpresaId)`).
- Não permita que o `EmpresaId` venha no payload da requisição. Ele deve ser obtido exclusivamente do token JWT.

## 6. Validação do Fluxo
- Se você criar a Entidade, mas não mapear no `AppDbContext` (DbSet e Configurations), a task **não está finalizada**.
- Use a skill **generate-tests** na sequência para garantir cobertura.
