---
name: bounded-context-workflow
description: Orquestra o ciclo de desenvolvimento de uma feature de Backend isolada dentro de um Bounded Context específico, respeitando o DDD e a Clean Architecture do projeto.
---

# Bounded Context Workflow

## Propósito
Guiar o Agente na criação ou expansão de um **Bounded Context (BC)** no Backend (ex: `Operacoes`, `Whatsapp`, `Auth`). Garante que a separação de camadas da Clean Architecture (Domain, Application, Infrastructure, Api) seja estritamente respeitada e que as regras de negócio fiquem isoladas.

## Integrações Obrigatórias
- **`git-flow`**: Para branch management e commits.
- **`create-endpoint`**: Usado especificamente na fase de exposição da API.
- **`generate-tests`**: OBRIGATÓRIO acionar ao concluir os Casos de Uso (AppServices) para garantir cobertura xUnit.

---

## Passos de Execução

### PASSO 1: Identificação do Bounded Context
1. Identifique o nome do Bounded Context (ex: `Financeiro`, `Whatsapp`).
2. Leia o `docs/ARCHITECTURE_MAP.md` e o `findings.md` atual para entender os limites arquiteturais.
3. Se o BC não existir, crie as subpastas padronizadas em `InterceptorSystem.Domain`, `InterceptorSystem.Application`, e `InterceptorSystem.Infrastructure`.

### PASSO 2: Modelagem do Domínio (Core)
1. **Entities & Aggregates:** Crie as entidades na pasta `Domain/BoundedContexts/<NomeBC>/Aggregates/`.
   - Propriedades devem ter `private set`.
   - Modificações de estado ocorrem apenas via métodos comportamentais (ex: `MudarStatus()`).
2. **Value Objects:** Encapsule regras locais (ex: CPFs, Moedas) em VOs. Validação no construtor disparando `DomainException`.
3. **Interfaces:** Declare as portas de repositórios (`I<Aggregate>Repository`) e de leitura (`I<Name>QueryPort`) na pasta `Domain/BoundedContexts/<NomeBC>/Interfaces/`.
   - **Regra:** O Domínio NUNCA referencia EF Core ou banco de dados.

### PASSO 3: Camada de Aplicação (AppServices e DTOs)
1. **DTOs:** Crie os modelos de entrada (Request) e saída (Response) em `Application/BoundedContexts/<NomeBC>/DTOs/`.
2. **Services:** Crie os Casos de Uso (`<UseCase>AppService.cs`) implementando a orquestração:
   - Valide entradas.
   - Busque a entidade via repositório.
   - Chame o método da entidade.
   - Salve no repositório.
   - NUNCA coloque regras de negócio "If/Else" que pertençam à Entidade dentro do AppService.

### PASSO 4: Camada de Infraestrutura e Persistência
1. Crie a implementação do repositório em `Infrastructure/Adapters/<NomeBC>/Repositories/`.
2. Crie a configuração do Entity Framework (Mappings) em `Persistence/Configurations/`.
3. Injeção de dependência: Atualize o `DependencyInjection.cs` da Infrastructure para registrar os novos serviços e repositórios usando `AddScoped`.

### PASSO 5: Exposição e Testes
1. Para criar as rotas na camada API, invoque a skill **`create-endpoint`**.
2. Ao finalizar a lógica, invoque imediatamente a skill **`generate-tests`** para construir a suíte de testes xUnit (Cobrindo Caminho Feliz, Bordas e Exceções do Domínio).
3. Após os testes passarem, invoque o **`git-flow`** para submeter as alterações.

## Regras Críticas (Guardrails)
- **Multi-Tenant:** Todas as entidades que são salvos no banco devem lidar com o `EmpresaId` silenciosamente.
- **Fail-Fast:** Regras inválidas sobem `DomainException`, capturadas pelo Middleware Global. Não crie try-catches em Controllers.
