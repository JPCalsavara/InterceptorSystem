# InterceptorSystem

## Plano (Método STAR)

- **Situação**: Descrever o contexto que originou o InterceptorSystem e os desafios enfrentados pelo time de segurança patrimonial.
- **Tarefa**: Explicar os objetivos técnicos e de negócio que o sistema precisa cumprir para suportar múltiplos condomínios.
- **Ação**: Detalhar as soluções implementadas (arquitetura, tecnologias, processos de desenvolvimento e testes).
- **Resultado**: Evidenciar ganhos obtidos, indicadores de qualidade e próximos passos.

---

## Situação

A Interceptor presta serviços de segurança para diversos condomínios e precisava consolidar todas as operações em um único backend .NET 8. Problemas existentes antes do projeto:

- Cadastros duplicados e sem rastreabilidade de empresa (multi-tenant inexistente).
- Escalamento manual de postos de trabalho, funcionário e alocações, sem validações de regras (ex.: turnos consecutivos).
- Ausência de testes automatizados e documentação técnica mínima.

Esse cenário pressionava a equipe a agir rapidamente, garantindo uma base extensível, observável e preparada para novos módulos (funcionários, alocações, contratos, etc.).

## Tarefa

Definimos quatro metas principais:

1. **Multi-tenant consistente**: toda entidade deveria carregar `EmpresaId`, com filtros globais via `ICurrentTenantService`.
2. **Clean Architecture + DDD**: separar Domínio, Aplicação, Infra e API para reduzir acoplamento.
3. **Regras claras por módulo**:
   - Condomínio como agregado raiz para Funcionários, Postos, Contratos.
   - Funcionários com enums de status/tipo/escala e validação de valores financeiros.
   - Postos obrigatoriamente associados a um condomínio e com janelas de 12h.
   - Alocações bloqueando turnos consecutivos exceto em `DOBRA_PROGRAMADA`.
   - Contratos com ciclo de vida e status bem definidos.
4. **Qualidade**: testes unitários e de integração cobrindo cenários bons/ruins, payloads documentados e pipelines via Docker Compose.

## Ação

### Arquitetura e Tecnologias

- **Stack**: .NET 8, ASP.NET Core, Entity Framework Core + PostgreSQL, Docker/Compose, xUnit.
- **Estrutura**: `InterceptorSystem.Domain`, `.Application`, `.Infrastructure`, `.Api`, `.Tests` seguindo Clean Architecture.
- **Multi-tenant**: filtros globais no `ApplicationDbContext` e validação de tenant em cada AppService.

### Casos de uso implementados

| Módulo | Destaques de Regra de Negócio | Cobertura de Testes |
|--------|-------------------------------|---------------------|
| Condomínios | CRUD isolado por empresa, validações de CNPJ/ endereço | Integração (Controllers) |
| Postos de Trabalho | Vínculo 1:N com condomínio, turnos 12h | Unit + Integração |
| Funcionários | Enums fortes, CPF único, salários positivos | Unit (casos bons e ruins) + Integração |
| Alocações | Respeita tenant, valida funcionário/posto, bloqueio de dias consecutivos | Unit (múltiplos cenários) + Integração |
| Contratos | Status enumerado, valores/ datas coerentes | Unit + Integração |

### Qualidade e Documentação

- **Testes**: `dotnet test src/InterceptorSystem.Tests/InterceptorSystem.Tests.csproj` (124 cenários).
- **Payloads**: `src/docs/test-payloads/*.json` alinhados aos enums atuais.
- **Infra**: Docker Compose com API, PostgreSQL e NGINX. `.env` centraliza variáveis (`POSTGRES_*`, `ConnectionStrings__DefaultConnection`).
- **CI/CD-ready**: projeto organizado para pipelines (build, test, migrations).

## Resultado

- **Confiabilidade**: Regras críticas cobertas por testes unitários/integrados; foi possível detectar regressões durante o desenvolvimento das enums e contratos.
- **Escalabilidade**: Limpeza arquitetural facilita adicionar novos módulos (ex.: Alocações avançadas, Folha de Pagamento) sem romper os existentes.
- **Operacional**: Compose sobe todo o stack rapidamente; README/documentação de payloads reduz onboarding.
- **Próximos passos sugeridos**:
  1. Automatizar migrations em pipeline e nos ambientes Docker.
  2. Implementar observabilidade (logs estruturados + métricas).
  3. Expor APIs públicas com autenticação JWT e rate limiting.
  4. Acrescentar testes de contrato (Swagger + Postman) para garantir compatibilidade externa.

## Como executar

```bash
# Restaurar pacotes e rodar testes
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem
DOTNET_ENVIRONMENT=Development dotnet test src/InterceptorSystem.Tests/InterceptorSystem.Tests.csproj

# Subir ambiente local
cd src
cp ../.env.example ../.env   # ajuste variáveis antes
docker compose up --build
```

## Estrutura de pastas (resumo)

```
 src/
 ├── InterceptorSystem.Api/           # Controllers, Program
 ├── InterceptorSystem.Application/   # DTOs, AppServices, Interfaces
 ├── InterceptorSystem.Domain/        # Entidades, Enums, Interfaces
 ├── InterceptorSystem.Infrastructure/# DbContext, Configurations, Repositories
 ├── InterceptorSystem.Tests/         # Unity + Integration tests
 └── docs/test-payloads/              # JSONs para cURL/Swagger
```

## Contato e colaboração

- Abra issues detalhando Situação, Tarefa, Ação, Resultado esperados.
- Pull Requests devem incluir testes e seguir o mesmo padrão de validação já existente.
- Dúvidas sobre tenant, enums ou regras de negócio? Consulte as classes nos módulos de domínio antes de propor mudanças.
