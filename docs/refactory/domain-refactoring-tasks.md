# Domain Refactoring — InterceptorSystem

## Phase 1: Flexible Shifts & Schedules ✅

- [x] Extend `TipoEscala` enum with `ALCALA_8H`, `FOLGUISTA`
- [x] Remove 12h validation from `Posto.cs` (lines 112, 129)
- [x] Add `TipoEscala` property to `Alocacao`
- [x] Update DTOs, AppService, Controller, EF config
- [x] Frontend: models, forms, list views
- [x] Migration + tests

## Phase 2: Domain Realignment (Cliente, Posto, Alocacao, Diaria) ✅

### 2A. Cliente ✅

- [x] Simplified to Nome, Cidade, Estado, Ativo, EmailGestor, TelefoneEmergencia
- [x] Removed Cnpj, Endereco, QuantidadeIdealPorTurno, HorarioTrocaTurno
- [x] Updated DTOs, AppService, Controller, EF config
- [x] Frontend models and forms aligned

### 2B. Posto (physical location) ✅

- [x] Now contains only: Nome, Endereco, Cidade, Estado, Ativo, ClienteId
- [x] Scheduling properties moved to Alocação
- [x] Updated DTOs, AppService, Controller, EF config
- [x] Frontend models and services aligned

### 2C. Alocação (shift slot — new entity) ✅

- [x] Created `Alocacao.cs` with PostoId, ContratoId, scheduling props
- [x] Full CRUD stack: DTO, AppService, Controller, Repository, EF config
- [x] Frontend: `alocacao.service.ts`, `alocacao-list.component`

### 2D. Diária (daily assignment) ✅

- [x] Replaced `postoId` with `alocacaoId`
- [x] Added `ValorDiaria` (currently defaults to 0m — Phase 3 fills from Tags)
- [x] Updated DTOs, AppService, Controller

### 2E. Cascade Deletes & EF Config ✅

- [x] Posto → Cliente cascade
- [x] Alocacao → Posto cascade
- [x] Alocacao → Contrato cascade
- [x] Diaria → Alocacao cascade

### 2F. Test, Code & Layout Alignment

- [x] Fix `ClienteAppServiceUnityTests.cs` — uses old Cliente constructor
- [x] Fix `PostoAppServiceTests.cs` — full rewrite (uses old Posto w/ scheduling)
- [x] Fix `DiariaAppServiceTests.cs` — uses IPostoRepository instead of IAlocacaoRepository
- [x] Fix `DiariaBatchAppServiceTests.cs` — uses old constructors
- [x] Fix `ContratoAppServiceTests.cs` — uses old Cliente constructor
- [x] Fix `FuncionarioAppServiceTests.cs` — uses old Cliente constructor
- [x] Fix `DiariaAppService` stubs (PostoExisteAsync, GetByPostoEDataAsync)
- [x] Fix `Contrato.Postos` → `Contrato.Alocacoes` nav property
- [x] Fix `AlocacaoConfiguration` `.WithMany()` → `.WithMany(c => c.Alocacoes)`
- [x] Ajustar o padding lateral interno do sistema para ficar igual ao usado no banner de verificação de e-mail

### 2G. Footer Interno do Sistema

- [x] Adicionar um footer interno consistente dentro do sistema

### 2H. Cliente CNPJ Unique ✅

- [x] Make CNPJ unique in Cliente

### 2I. Configuração de Endpoints Lazy Fetching (Nova Tarefa) ✅

- [x] Criar endpoint `GET /api/clientes/{id}/funcionarios` no `FuncionariosController` para carregar funcionários associados sob demanda.
- [x] Criar endpoint `GET /api/clientes/{id}/postos` no `PostosController` para carregar postos associados sob demanda.
- [x] Atualizar `IFuncionarioAppService`/`IPostoAppService` e repositórios para suportar passagem de `clienteId`.
- [x] Frontend: Refatorar interfaces de detalhes (`cliente-detail.component`) para chamar as novas rotas em vez de carregar tudo via `.Include()`.

## Phase 3: Frontend Alignment

### 3A. Cliente Pages ✅

- [x] Fix Cliente detail page
- [x] Fix Cliente list page
- [x] Fix Cliente form page

### 3B. Posto Pages ✅

- [x] Fix Posto detail page
- [x] Fix Posto list page
- [x] Fix Posto form page

### 3C. Alocacao Pages ✅

- [x] Fix Alocacao detail page
- [x] Fix Alocacao list page
- [x] Fix Alocacao form page

### 3D. Cronograma Pages

- [x] Fix Cronograma detail page
- [x] Fix Cronograma list page
- [x] Fix Cronograma form page

### 3E. Diaria Pages

- [x] Fix Diaria detail page
- [x] Fix Diaria list page
- [x] Fix Diaria form page

## Phase 4: Daily Rates & Value Tags ✅

- [x] Create Tag entity + FuncionarioTag join + ContratoTag join
- [x] Create Tag CRUD (backend + frontend)
- [x] Create FuncionarioTag assignment flow (backend + frontend)
- [x] Create ContratoTag pricing CRUD/association flow (backend + frontend)
- [x] Show per-Contrato tag daily rates in contrato list/detail views
- [x] Use ContratoTag as source of truth when filling Diaria.ValorDiaria based on Funcionario tags
- [x] Remove old salary computed properties from Funcionario
- [x] Add CustoMensalReal + CustoMensalEstimado to Funcionario
- [x] Remove CalcularSalarioBasePorFuncionario from Contrato
- [x] Update all tests

## Phase 5: Landing Page ✅

- [x] Landing: update context to "Empresa de Gestão e Facilities em Associações Condominiais"

## Phase 6: Interest Form

- [x] Frontend: forms implemented (`/cadastro`) and aligned with the new context
- [ ] Backend: InterestController + email service

## Phase 7: Caching e Performance do Frontend

## Phase 7: Caching e Performance do Frontend ✅

- [x] Estruturação do Cache no Frontend com Angular Signals (Service layer).
- [x] Implementar sistema para retenção em cache da listagem (`Read-Through`) nos métodos `getAll()`.
- [x] Disparar eventos de Invalidação (`Cache Invalidation Event`) após interações de Create/Update/Delete.
- [ ] Validação visual e de Network (Aba Network) para atestar a ausência de chamadas web constantes/redundantes.

## Phase 8: Improve UI/UX with Tags

- [ ] Melhorar UX do formulário de Contrato com uso de Tags (seleção e precificação por função)
- [ ] Aplicar componentes visuais de Tags no fluxo de criação/edição de Contrato
- [ ] Exibir feedback de validação e preview de impacto financeiro por Tag no formulário
