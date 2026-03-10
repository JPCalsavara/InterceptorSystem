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

### 2F. Test & Code Alignment ✅
- [x] Fix `ClienteAppServiceUnityTests.cs` — uses old Cliente constructor
- [x] Fix `PostoAppServiceTests.cs` — full rewrite (uses old Posto w/ scheduling)
- [x] Fix `DiariaAppServiceTests.cs` — uses IPostoRepository instead of IAlocacaoRepository
- [x] Fix `DiariaBatchAppServiceTests.cs` — uses old constructors
- [x] Fix `ContratoAppServiceTests.cs` — uses old Cliente constructor
- [x] Fix `FuncionarioAppServiceTests.cs` — uses old Cliente constructor
- [x] Fix `DiariaAppService` stubs (PostoExisteAsync, GetByPostoEDataAsync)
- [x] Fix `Contrato.Postos` → `Contrato.Alocacoes` nav property
- [x] Fix `AlocacaoConfiguration` `.WithMany()` → `.WithMany(c => c.Alocacoes)`

### 2G. Cliente CNPJ Unique ✅
- [x] Make CNPJ unique in Cliente

## Phase 3: Frontend Alignment

### 3A. Cliente Pages
- [ ] Fix Cliente detail page
- [ ] Fix Cliente list page
- [ ] Fix Cliente form page

### 3B. Posto Pages
- [ ] Fix Posto detail page
- [ ] Fix Posto list page
- [ ] Fix Posto form page

### 3C. Alocacao Pages
- [ ] Fix Alocacao detail page
- [ ] Fix Alocacao list page
- [ ] Fix Alocacao form page

### 3D. Cronograma Pages
- [ ] Fix Cronograma detail page
- [ ] Fix Cronograma list page
- [ ] Fix Cronograma form page

### 3E. Diaria Pages
- [ ] Fix Diaria detail page
- [ ] Fix Diaria list page
- [ ] Fix Diaria form page

## Phase 4: Daily Rates & Value Tags
- [ ] Create Tag entity + FuncionarioTag join
- [ ] Create Tag CRUD (backend + frontend)
- [ ] Remove old salary computed properties from Funcionario
- [ ] Add CustoMensalReal + CustoMensalEstimado to Funcionario
- [ ] Remove CalcularSalarioBasePorFuncionario from Contrato
- [ ] Update all tests

## Phase 5: Sidebar & Landing Page
- [ ] Sidebar: "Diárias" → "Cronograma"
- [ ] Landing: update text to "associação condominial"

## Phase 6: Interest Form
- [ ] Frontend: form on landing page
- [ ] Backend: InterestController + email service
