# InterceptorSystem

## **Status:** ✅ Backend | ✅ Frontend | ✅ Docker Compose | ✅ CI/CD | ✅ Auth & SaaS | ✅ WhatsApp Bot | ✅ DDD Refactoring

## 📋 Sobre o Projeto

**InterceptorSystem** é uma plataforma SaaS de gestão de segurança patrimonial para clientes, desenvolvida com **.NET 8** (backend) e **Angular 21** (frontend). Gerencia **clientes, funcionários, postos de trabalho, diárias e contratos** com regras de negócio robustas em **Clean Architecture + DDD** com 3 Bounded Contexts (Operações, Auth e Whatsapp).

Inclui **autenticação JWT**, **gestão de contas e assinaturas** (FREE/BASIC/PRO), **notificações por e-mail** (SMTP), **integração WhatsApp** para substituição de diárias via chatbot e um **sistema de cache event-driven** com invalidação automática via Domain Events (MediatR).

## 🚀 Quick Start

```bash
git clone https://github.com/seu-usuario/InterceptorSystem.git
cd InterceptorSystem
cp .env.example .env
cd backend/src
docker compose up -d
```

| Acesso       | URL                      |
| ------------ | ------------------------ |
| Frontend     | http://localhost         |
| API          | http://localhost/api     |
| Swagger      | http://localhost/swagger |
| Frontend Dev | http://localhost:4200    |

---

## 📑 Índice

- [Funcionalidades](#-funcionalidades)
- [Autenticação & Contas](#-autenticação--contas)
- [WhatsApp Bot](#-whatsapp-bot)
- [Regras de Negócio](#-regras-de-negócio-por-entidade)
- [Arquitetura](#️-arquitetura)
- [Docker Compose](#-docker-compose)
- [CI/CD](#-cicd)
- [Tecnologias](#️-tecnologias)
- [Como Executar](#-como-executar)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Testes](#-testes)

---

## ✨ Funcionalidades

### Backend

- **CRUD completo** para Cliente, Funcionário, Posto, Alocação, Diária, Contrato e Tag
- **Cálculos financeiros via Tags** (novo modelo dinâmico substituindo salário fixo)
- **Lazy Fetching e Cache Coordenador**: queries otimizadas (`/api/clientes/{id}/funcionarios`)
- **Turnos flexíveis**: suporte completo a Comercial, 8h (Alcalá), Folguista e 12h
- **Criação em cascata** via `POST /api/clientes-completos` (Cliente + Contrato + Postos + Alocações em 1 request)
- **Diárias em lote** via `POST /api/diarias/batch`
- **Auto-finalização de contratos** vencidos ao listar
- **Autenticação JWT** com registro, login, verificação de e-mail e reset de senha
- **Gestão de contas SaaS** com planos de assinatura (FREE, BASIC, PRO)
- **Notificações por e-mail** via SMTP (MailKit) — verificação, reset de senha, alteração de e-mail
- **Integração WhatsApp** via Meta API — chatbot para substituição de diárias

### Frontend

- **Landing page pública** focada em gestão de serviços e facilities
- **Design System próprio**: uso massivo de CSS tokens, cores semânticas e SVGs otimizados (`docs/design-system`)
- **Gestão de Cache e Invalidação Reativa**: baseada na `EntityCacheCoordinatorService` para poupar requests
- **Sidebar Desktop Colapsável**: com persistência local de layout
- **Padronização Visual**: formulários responsivos, mensagens de erro padronizadas e botões unificados
- **Fluxo de autenticação completo**: login, cadastro, esqueci a senha, nova senha, verificação de e-mail
- **Dashboard financeiro** com análise por período (mensal, trimestral, semestral, anual)
- **3 modos de visualização de diárias**: Diário (lista), Semanal (kanban), Mensal (calendário)
- **Dark mode / Light mode** dinâmico e suportado em todas as telas
- **Formulários validados por Schema (Zod)** e com máscaras (ngx-mask)
- **Auth Guard** protegendo rotas autenticadas e **Auth Interceptor** de JWT

### Infraestrutura

- **Docker Compose** com 4 serviços orquestrados (DB + API + Frontend + Nginx)
- **Hot-reload** para backend (`dotnet watch`) e frontend (`ng serve --poll`)
- **npm 11.10.1** atualizado na imagem Docker do frontend
- **CI/CD GitHub Actions** testando Backend + Frontend + Docker em cada PR
- **Nginx** como reverse proxy para a API

---

## 🔐 Autenticação & Contas

### Sistema de Autenticação (JWT)

| Endpoint                              | Método | Descrição                                    | Autenticado |
| ------------------------------------- | ------ | -------------------------------------------- | ----------- |
| `/api/auth/registrar`                 | POST   | Registro de nova conta (cria tenant/empresa) | ❌          |
| `/api/auth/login`                     | POST   | Login com e-mail e senha → retorna JWT       | ❌          |
| `/api/auth/email/confirmar`           | POST   | Confirma verificação de e-mail via token     | ❌          |
| `/api/auth/email/reenviar`            | POST   | Reenvia e-mail de verificação                | ✅          |
| `/api/auth/senha/solicitar-reset`     | POST   | Solicita link de redefinição de senha        | ❌          |
| `/api/auth/senha/confirmar-reset`     | POST   | Confirma nova senha via token                | ❌          |
| `/api/auth/email/solicitar-alteracao` | POST   | Solicita alteração de e-mail                 | ✅          |
| `/api/auth/email/confirmar-alteracao` | POST   | Confirma novo e-mail via token               | ❌          |

### Gestão de Conta (SaaS)

| Endpoint                        | Método | Descrição                                     |
| ------------------------------- | ------ | --------------------------------------------- |
| `/api/conta`                    | GET    | Retorna perfil da conta autenticada           |
| `/api/conta`                    | PUT    | Atualiza nome da empresa, e-mail ou senha     |
| `/api/conta/telefone`           | POST   | Cadastra telefone e envia código via WhatsApp |
| `/api/conta/telefone/confirmar` | POST   | Confirma telefone com token de verificação    |

### Planos de Assinatura

| Plano   | Descrição                 |
| ------- | ------------------------- |
| `FREE`  | Plano gratuito (padrão)   |
| `BASIC` | Funcionalidades básicas   |
| `PRO`   | Funcionalidades completas |

### Entidades de Autenticação

| Entidade           | Descrição                                                                         |
| ------------------ | --------------------------------------------------------------------------------- |
| `Conta`            | Conta SaaS — o "dono" do tenant. O `Id` é o `EmpresaId` de todo o sistema         |
| `TokenVerificacao` | Token temporário para verificação de e-mail, reset de senha e alteração de e-mail |

### Enums de Autenticação

| Enum                   | Valores                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `PlanoAssinatura`      | `FREE`, `BASIC`, `PRO`                                                        |
| `TipoTokenVerificacao` | `EmailVerificacao`, `AlteracaoSenha`, `AlteracaoEmail`, `VerificacaoTelefone` |

### Notificações por E-mail (SMTP)

O sistema envia e-mails transacionais via **MailKit** (SMTP) para:

- ✅ **Verificação de e-mail** ao registrar nova conta
- ✅ **Redefinição de senha** com link de expiração (1 hora)
- ✅ **Confirmação de alteração de e-mail** para o novo endereço

Configuração via variáveis de ambiente:

```env
SMTP__HOST=smtp.example.com
SMTP__PORT=587
SMTP__USERNAME=user@example.com
SMTP__PASSWORD=senha
SMTP__FROMADDRESS=noreply@interceptorsystem.com
SMTP__FROMNAME=Interceptor System
SMTP__SECURESOCKET=StartTls
```

### Frontend — Páginas de Autenticação

| Página           | Rota               | Descrição                        |
| ---------------- | ------------------ | -------------------------------- |
| Landing          | `/`                | Página pública de apresentação   |
| Login            | `/login`           | Formulário de login              |
| Cadastro         | `/cadastro`        | Registro de nova conta           |
| Esqueci a Senha  | `/esqueci-senha`   | Solicitar reset de senha         |
| Nova Senha       | `/nova-senha`      | Redefinir senha via token        |
| Verificar E-mail | `/verificar-email` | Confirmar verificação de e-mail  |
| Perfil           | `/perfil`          | Visualizar/editar dados da conta |
| Conta            | `/conta`           | Configurações da conta           |
| Plano            | `/plano`           | Seleção/alteração de plano       |

---

## 📱 WhatsApp Bot

### Integração com Meta (WhatsApp Business API)

O sistema possui um **chatbot WhatsApp** integrado via **Meta Webhook** para processar substituições de diárias de segurança de forma conversacional.

| Endpoint                | Método | Descrição                                      |
| ----------------------- | ------ | ---------------------------------------------- |
| `/api/whatsapp/webhook` | GET    | Verificação de webhook exigida pela Meta       |
| `/api/whatsapp/webhook` | POST   | Recebe mensagens — processamento em background |

### Fluxo Conversacional (Estado da Sessão)

O bot guia o usuário por um fluxo de substituição de diária:

```
AguardandoCliente → AguardandoPosto → AguardandoData
→ AguardandoFuncionarioSubstituido → AguardandoFuncionarioSubstituto
→ AguardandoConfirmacao → Concluida / Cancelada
```

- Atalhos globais: `0`, `cancelar`, `sair` → cancela a sessão
- Telefones não autorizados recebem mensagem de bloqueio

### Ranking de Substitutos (`SubstitutoRankerService`)

- Funcionário deve estar `ATIVO` e sem diária no dia
- Score = quantidade de diárias nos últimos 30 dias (menos = mais disponível)
- Indicador de disponibilidade: Alta / Média / Baixa

### Entidade `SessaoWhatsapp`

- Persiste o estado da conversa por número de telefone
- Vinculada à `Conta` (tenant) pelo telefone verificado
- Cache de opções numeradas (`OpcoesCacheJson`) para mapear respostas
- Expiração automática após 15 minutos de inatividade
- **Background cleanup service** remove sessões expiradas a cada 5 minutos

### Configuração

```env
META__WEBHOOKVERIFYTOKEN=seu-token-de-verificacao
META__ACCESSTOKEN=seu-access-token-meta
META__PHONENUMBERID=seu-phone-number-id
```

---

## 📐 Regras de Negócio por Entidade

### Cliente

| Regra           | Descrição                                                             |
| --------------- | --------------------------------------------------------------------- |
| CNPJ único      | Não pode haver dois clientes com o mesmo CNPJ na mesma empresa        |
| Configs Base    | `EmailGestor`, `TelefoneEmergencia` opcionais                         |
| Localidade base | Cidade e Estado fornecem configuração inicial para postos de trabalho |

```
✅ Criar cliente (dados básicos) → Status 201
❌ CNPJ duplicado → "Já existe um cliente cadastrado com este CNPJ" (409)
```

### Posto (Localização Física)

| Regra                | Descrição                                                                     |
| -------------------- | ----------------------------------------------------------------------------- |
| Representação        | Local físico vinculado a um Cliente (preenchido com Cidade/Estado do Cliente) |
| Vinculado ao cliente | `ClienteId` obrigatório e deve pertencer à mesma empresa                      |
| Base para alocações  | Contém múltiplas `Alocações` (turnos) para o funcionamento do posto           |

```
✅ Posto "Portaria Principal" atrelado ao Cliente → Criado com sucesso
```

### Alocação (Slot de Turno)

| Regra                     | Descrição                                                                       |
| ------------------------- | ------------------------------------------------------------------------------- |
| Vínculo Duplo             | Pertence a um `Posto` e vincula-se a um `Contrato` vigente                      |
| Turno flexível            | Suporta Horário Comercial, Alcalá 8h, Folguista e 12h (sem limite rígido)       |
| Horário noturno detectado | `TemHorarioNoturno` (calculado) — `true` se o turno passa pelo intervalo 22h–5h |
| Permite dobra de escala   | `PermiteDobrarEscala` define se funcionários podem fazer dobra                  |

```
✅ Alocação 12x36 (06:00-18:00) → Criado com sucesso
✅ Alocação Alcalá 8h (14:00-22:00) → Criado com sucesso
```

### Funcionário

| Regra               | Descrição                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| CPF único           | Não pode haver dois funcionários com mesmo CPF                                                 |
| Vínculo Opcional    | Pode ter `ClienteId` nulo (Terceirizado/Especial) ou vinculado a um Cliente específico         |
| Tags de Diária      | Possui relação Many-to-Many com `Tag` (ex: "PM", "Vigia Avulso") determinando seu custo diário |
| Custo Real Dinâmico | Valores não são mais fixos, cálculo = Σ `ValorDiaria` (do Contrato via Tag) + `Beneficios`     |

```
✅ Funcionário [PM] → Histórico financeiro mensal via soma de Diárias
❌ CPF duplicado → "CPF já cadastrado" (409)
```

### Diária (Designação)

| Regra                 | Descrição                                                          |
| --------------------- | ------------------------------------------------------------------ |
| Vinculada à Alocação  | Registra a ida do Funcionário a um turno específico (`AlocacaoId`) |
| Snapshot de Preço     | Recebe `ValorDiaria` no momento da criação com base no acordo/Tag  |
| Sem dias consecutivos | Bloqueado exceto para `DOBRA_PROGRAMADA`                           |
| Descanso pós-dobra    | Após dobra programada, obrigatório descansar no dia seguinte       |

```
✅ Diária REGULAR (ValorDiaria=150) → Criada
❌ Após DOBRA, nova diária no dia seguinte → "Funcionário deve descansar após dobra" (400)
```

### Contrato

| Regra                  | Descrição                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Um vigente por cliente | Máximo 1 contrato `ATIVO` ou `PENDENTE` por cliente                                                        |
| Auto-finalização       | Contratos com `DataFim` vencida são marcados `FINALIZADO` no GetAll                                        |
| Precificação via Tags  | Define os valores acordados para cada tipo de serviço (Tag) cobrados pelo cliente através de `ContratoTag` |

```
✅ Contrato com ContratoTags (PM=R$350, Limpeza=R$100) → Criado
❌ Segundo contrato ATIVO no mesmo cliente → "Já existe contrato vigente" (409)
```

### Criação em Cascata (`POST /api/clientes-completos`)

Cria Cliente + Contrato + Postos + Alocações em **1 único request**.

| Regra            | Descrição                                                  |
| ---------------- | ---------------------------------------------------------- |
| Simplicidade     | Permite inicializar a base da associação de forma rápida   |
| Alocações Autom. | Gera alocações divididas igualmente de acordo com o pedido |

```json
POST /api/clientes-completos
{
  "cliente": {
    "nome": "Residencial Estrela",
    "cnpj": "12.345.678/0001-90"
  },
  "contrato": {
    "descricao": "Contrato 2026",
    "valorBeneficios": 300.00,
    "dataInicio": "2026-01-10",
    "dataFim": "2026-12-31"
  },
  "criarPostosAutomaticamente": true,
  "numeroDePostos": 1
}
```

```
✅ 1 request → Cliente + Contrato + Postos + Alocações criados
```

---

## 🏛️ Arquitetura

### Backend (Clean Architecture + DDD — 3 Bounded Contexts)

O backend foi refatorado em **6 fases** seguindo DDD estrito com separação por Bounded Contexts:

```
InterceptorSystem.Domain/
  SharedKernel/             → Entity, IDomainEvent, IUnitOfWork, DomainException
    ValueObjects/           → Cpf, Cnpj, Email, Telefone, Cep
    Interfaces/             → IRepository<T>, IAggregateRoot, IPagedResult<T>
  BoundedContexts/
    Operacoes/              → Cliente, Contrato, Funcionario, Posto, Alocacao, Diaria, Tag
    Auth/                   → Conta, TokenVerificacao
    Whatsapp/               → SessaoWhatsapp + ACL Ports

InterceptorSystem.Application/
  BoundedContexts/
    Operacoes/              → AppServices, DTOs, Interfaces
    Auth/                   → AuthAppService
    Whatsapp/               → WhatsappBotService (usa ACL Ports)
  Ports/Outbound/           → IEmailPort, IJwtTokenPort, IPasswordHasherPort

InterceptorSystem.Infrastructure/
  Adapters/                 → Auth/, Email/, Whatsapp/ (ACL Adapters)
  Caching/
    Repositories/           → CachedCliente, CachedContrato, CachedPosto,
                              CachedFuncionario, CachedAlocacao, CachedDiaria
    Handlers/               → Event-driven cache invalidation (MediatR)
    Configuration/          → CacheConfiguration (TTL centralizado)
  Persistence/              → DbContext, Configurations, Repositories

InterceptorSystem.Api/      → Controllers, Middlewares
InterceptorSystem.Tests/    → 204 testes (Unit + Integration)
```

### Context Map — 3 Bounded Contexts

```
┌─────────────────────────────────────────┐
│  Shared Kernel                          │
│  Entity · IDomainEvent · IUnitOfWork    │
│  Value Objects: Cpf · Cnpj · Email      │
│               Telefone · Cep            │
└─────────────────────────────────────────┘

BC: Auth          BC: Operações (core domain)
  Conta             Cliente → Contrato
  TokenVerificacao  Cliente → Posto → Alocacao → Diaria
                    Funcionario → Diaria

BC: Whatsapp
  SessaoWhatsapp
  IOperacoesQueryPort ──(ACL)──→ Operações
  IContaLookupPort    ──(ACL)──→ Auth
```

**Anti-Corruption Layer (ACL):** `WhatsappBotService` nunca injeta repositórios de outros BCs diretamente. Usa os ports `IContaLookupPort` e `IOperacoesQueryPort`, implementados por adapters em Infrastructure.

### Módulos de Domínio

| BC          | Entidades                                                    | Descrição                                  |
| ----------- | ------------------------------------------------------------ | ------------------------------------------ |
| `Operacoes` | Cliente, Contrato, Funcionario, Posto, Alocacao, Diaria, Tag | Domínio core de segurança patrimonial      |
| `Auth`      | Conta, TokenVerificacao                                      | SaaS multi-tenant — `Conta.Id = EmpresaId` |
| `Whatsapp`  | SessaoWhatsapp                                               | Chatbot conversacional de substituição     |

### Sistema de Cache (Event-Driven)

| Repositório | Decorator                                                   | TTL    | Invalidação                          |
| ----------- | ----------------------------------------------------------- | ------ | ------------------------------------ |
| Cliente     | ✅ Cached (GetAll + GetById)                                | 20 min | `ClienteCreated/Updated/Deleted`     |
| Contrato    | ✅ Cached (GetAll + GetById + ByCliente)                    | 20 min | `ContratoCreated/Updated/Deleted`    |
| Posto       | ✅ Cached (GetAll + GetById + ByCliente)                    | 10 min | `PostoCreated/Updated/Deleted`       |
| Funcionario | ✅ Cached (GetAll + GetById + ByCliente + ByCpf)            | 10 min | `FuncionarioCreated/Updated/Deleted` |
| Alocacao    | ✅ Cached (GetAll + ByCliente + ByPosto)                    | 60 seg | `AlocacaoCreated/Updated/Deleted`    |
| Diaria      | ✅ Cached (GetAll + ByCliente + ByFuncionario + ByAlocacao) | 60 seg | `DiariaCreated/Updated/Deleted`      |

**Flow:** `Domain Event → SaveChangesAsync → MediatR.Publish → CacheInvalidationHandler → _cache.Remove(...)`

### Enums

| Enum                   | Valores                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `StatusContrato`       | `ATIVO`, `PENDENTE`, `FINALIZADO`                                                                                                                                                  |
| `StatusFuncionario`    | `ATIVO`, `FERIAS`, `AFASTADO`, `DEMITIDO`                                                                                                                                          |
| `TipoEscala`           | `DOZE_POR_TRINTA_SEIS`, `OITO_HORAS_SEIS_POR_DOIS`, `SEMANAL_COMERCIAL`, `ALCALA_8H`, `FOLGUISTA`                                                                                  |
| `TipoFuncionario`      | `CLT`, `TERCEIRIZADO`, `FREELANCE`                                                                                                                                                 |
| `StatusDiaria`         | `CONFIRMADA`, `CANCELADA`, `FALTA_REGISTRADA`                                                                                                                                      |
| `TipoDiaria`           | `REGULAR`, `DOBRA_PROGRAMADA`, `SUBSTITUICAO`                                                                                                                                      |
| `PlanoAssinatura`      | `FREE`, `BASIC`, `PRO`                                                                                                                                                             |
| `TipoTokenVerificacao` | `EmailVerificacao`, `AlteracaoSenha`, `AlteracaoEmail`, `VerificacaoTelefone`                                                                                                      |
| `EstadoConversa`       | `AguardandoCliente`, `AguardandoPosto`, `AguardandoData`, `AguardandoFuncionarioSubstituido`, `AguardandoFuncionarioSubstituto`, `AguardandoConfirmacao`, `Concluida`, `Cancelada` |

### Frontend (Angular 21 Standalone)

```
core/
  guards/            → auth.guard.ts
  interceptors/      → auth.interceptor.ts
features/
  clientes/       → list/, form/, detail/, cliente-wizard/
  funcionarios/      → list/, form/, detail/
  contratos/         → list/, form/
  postos/            → list/, form/, detail/
  diarias/         → list/, form/, detail/
services/            → comunicação com API (auth, clientes, contratos, etc.)
models/              → interfaces TypeScript (alinhados com DTOs)
shared/              → navbar, sidebar, layout
pages/               → landing, login, cadastro, esqueci-senha, nova-senha,
                       verificar-email, dashboard, perfil, conta, plano
```

---

## 🐳 Docker Compose

### Serviços

| Container              | Porta          | Descrição     |
| ---------------------- | -------------- | ------------- |
| `interceptor_db`       | 5432           | PostgreSQL 15 |
| `interceptor_api`      | 8080 (interno) | .NET 8 API    |
| `interceptor_frontend` | 4200/80        | Angular 21    |
| `interceptor_nginx`    | 80             | Reverse proxy |

### Comandos Principais

```bash
cd backend/src
# Subir (dev com hot-reload)
docker compose up -d
# Ver logs
docker compose logs -f
# Parar
docker compose down
# Rebuild forçado
docker compose up -d --build --force-recreate
# Migrations
docker compose exec api dotnet ef database update
```

### Variáveis de Ambiente (`.env`)

```env
POSTGRES_USER=interceptor
POSTGRES_PASSWORD=Interceptor@2024
POSTGRES_DB=interceptordb
ASPNETCORE_ENVIRONMENT=Development
ConnectionStrings__DefaultConnection=Host=db;Database=interceptordb;Username=interceptor;Password=Interceptor@2024
JWT__SECRET=sua-chave-secreta-jwt-256-bits
SMTP__HOST=smtp.example.com
SMTP__PORT=587
SMTP__USERNAME=user@example.com
SMTP__PASSWORD=senha
META__WEBHOOKVERIFYTOKEN=seu-token
META__ACCESSTOKEN=seu-access-token
META__PHONENUMBERID=seu-phone-id
```

### Hot-Reload

**Backend:** `dotnet watch run` — detecta mudanças e recompila automaticamente
**Frontend:** `ng serve --host 0.0.0.0 --poll 1000` — hot module replacement ativo

---

## 🔄 CI/CD

Pipeline GitHub Actions executado em todo PR para `main`:

| Job          | O que testa                                                      |
| ------------ | ---------------------------------------------------------------- |
| **Backend**  | Restore → Build → 167 testes (unit + integration) com PostgreSQL |
| **Frontend** | `npm ci` → Build produção (`--configuration=production`)         |
| **Docker**   | `docker compose build` valida Dockerfiles                        |

Arquivo: `.github/workflows/ci.yml`

---

## 🛠️ Tecnologias

### Backend

| Tecnologia            | Versão |
| --------------------- | ------ |
| .NET / ASP.NET Core   | 8.0    |
| Entity Framework Core | 8.0    |
| PostgreSQL            | 15     |
| xUnit + Moq           | 2.6+   |
| Swashbuckle (Swagger) | 6.x    |
| MailKit (SMTP)        | 4.x    |
| JWT Bearer Auth       | 8.x    |

### Frontend

| Tecnologia | Versão  |
| ---------- | ------- |
| Angular    | 21      |
| TypeScript | 5.7     |
| RxJS       | 7.8     |
| Node.js    | 20 LTS  |
| npm        | 11.10.1 |

### Infraestrutura

| Ferramenta         | Uso                      |
| ------------------ | ------------------------ |
| Docker Compose 2.x | Orquestração             |
| Nginx Alpine       | Reverse proxy            |
| GitHub Actions     | CI/CD                    |
| Meta WhatsApp API  | Chatbot de substituições |

---

## 🚀 Como Executar

### Pré-requisitos

```bash
docker --version         # 20+
docker compose --version # 2+
dotnet --version         # 8.0
node --version           # 20+
```

### Docker Compose (Recomendado)

```bash
git clone https://github.com/seu-usuario/InterceptorSystem.git
cd InterceptorSystem
cp .env.example .env
cd backend/src
docker compose up -d
```

### Local — Backend

```bash
cd backend/src
dotnet restore
# Migrations
cd InterceptorSystem.Infrastructure
dotnet ef database update --startup-project ../InterceptorSystem.Api
# Rodar
cd ../InterceptorSystem.Api
dotnet run
# http://localhost:5000
```

### Local — Frontend

```bash
cd frontend
npm install
npm start
# http://localhost:4200
```

---

## 📁 Estrutura de Pastas

```
InterceptorSystem/
├── backend/
│   └── src/
│       ├── InterceptorSystem.Api/
│       │   └── Controllers/          → AuthController, ContaController,
│       │                               ClienteController, PostosController,
│       │                               FuncionariosController, ContratosController,
│       │                               DiariasController, AlocacaoController,
│       │                               TagsController, WhatsappWebhookController
│       ├── InterceptorSystem.Application/
│       │   ├── BoundedContexts/
│       │   │   ├── Operacoes/         → Services, DTOs, Interfaces (domínio principal)
│       │   │   ├── Auth/              → AuthAppService, AuthDto
│       │   │   └── Whatsapp/          → WhatsappBotService + Interfaces
│       │   └── Ports/Outbound/        → IEmailPort, IJwtTokenPort, IPasswordHasherPort
│       ├── InterceptorSystem.Domain/
│       │   ├── SharedKernel/          → Entity, IDomainEvent, IUnitOfWork, DomainException
│       │   │   ├── ValueObjects/      → Cpf, Cnpj, Email, Telefone, Cep
│       │   │   └── Interfaces/        → IRepository<T>, IPagedResult<T>, IAggregateRoot
│       │   └── BoundedContexts/
│       │       ├── Operacoes/         → Aggregates, Events, Interfaces, Enums
│       │       ├── Auth/              → Conta, TokenVerificacao, Enums, Interfaces
│       │       └── Whatsapp/          → SessaoWhatsapp + ACL Ports
│       ├── InterceptorSystem.Infrastructure/
│       │   ├── Adapters/
│       │   │   ├── Auth/              → JwtTokenAdapter, BCryptPasswordHasherAdapter
│       │   │   ├── Email/             → SmtpEmailAdapter
│       │   │   └── Whatsapp/          → MetaWhatsappNotificationAdapter,
│       │   │                            OperacoesQueryAdapter, ContaLookupAdapter
│       │   ├── Caching/
│       │   │   ├── Configuration/     → CacheConfiguration (TTL centralizado)
│       │   │   ├── Handlers/          → *CacheInvalidationHandler (1 por agregado)
│       │   │   └── Repositories/      → Cached* (6 repositórios decorados)
│       │   └── Persistence/           → DbContext, Configurations, Repositories, Migrations
│       └── InterceptorSystem.Tests/
│           ├── Unity/                 → Testes unitários por serviço
│           └── Integration/           → WebApplicationFactory + PostgreSQL
│
├── frontend/
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/               → auth.guard.ts
│   │   │   └── interceptors/         → auth.interceptor.ts
│   │   ├── features/                 → clientes, contratos, funcionarios,
│   │   │                               postos, alocacoes, diarias, tags
│   │   ├── services/                 → *service.ts com Signal-based cache
│   │   │                               + EntityCacheCoordinatorService
│   │   ├── models/                   → interfaces TypeScript (alinhados com DTOs)
│   │   ├── shared/                   → navbar, sidebar, layout
│   │   └── pages/                    → landing, login, cadastro, esqueci-senha,
│   │                                   nova-senha, verificar-email, dashboard,
│   │                                   perfil, conta, plano
│   ├── Dockerfile
│   ├── angular.json
│   └── package.json
│
├── .agents/
│   ├── skills/                       → SKILL.md por domínio
│   └── analysis/                     → Análises arquiteturais geradas
│
├── docs/
│   ├── design-system/
│   ├── guias/
│   ├── refactory/                    → ddd-refactory.md (plano de 6 fases)
│   └── INDEX.md
│
├── .env.example
├── .github/workflows/ci.yml
├── CHANGELOG.md
└── README.md
```

---

## 🧪 Testes

```bash
# Todos os testes
cd backend/src
dotnet test
# Apenas unitários
dotnet test --filter "Category=Unit"
# Apenas integração
dotnet test --filter "Category=Integration"
```

| Módulo            | Testes Unitários | Testes de Integração |
| ----------------- | ---------------- | -------------------- |
| Cliente           | ✅               | ✅                   |
| Posto             | ✅               | ✅                   |
| Funcionário       | ✅               | ✅                   |
| Diária            | ✅               | ✅                   |
| Contrato          | ✅               | ✅                   |
| Cálculos Contrato | ✅               | ✅                   |
| Diárias Batch     | ✅               | ✅                   |
| Criação Cascata   | ✅               | ✅                   |
| Autenticação      | ✅               | ✅                   |

| Alocação | ✅ | ✅ |
| WhatsApp Bot | ✅ | ✅ |

## **Total: 204 testes automatizados (100% passando)**

---

## 🎯 Endpoints da API

### Autenticação & Conta

```http
POST   /api/auth/registrar
POST   /api/auth/login
POST   /api/auth/email/confirmar
POST   /api/auth/email/reenviar
POST   /api/auth/senha/solicitar-reset
POST   /api/auth/senha/confirmar-reset
POST   /api/auth/email/solicitar-alteracao
POST   /api/auth/email/confirmar-alteracao
GET    /api/conta
PUT    /api/conta
POST   /api/conta/telefone
POST   /api/conta/telefone/confirmar
```

### WhatsApp Webhook

```http
GET    /api/whatsapp/webhook       (verificação Meta)
POST   /api/whatsapp/webhook       (recebe mensagens)
```

### Criação em Cascata

```http
POST   /api/clientes-completos
POST   /api/clientes-completos/validar
```

### CRUD Principal & Scoped Endpoints

```http
GET/POST/PUT/DELETE  /api/clientes
GET                  /api/clientes/{id}/postos
GET                  /api/clientes/{id}/funcionarios
GET/POST/PUT/DELETE  /api/contratos
GET/POST/PUT/DELETE  /api/funcionarios
GET/POST/PUT/DELETE  /api/postos
GET/POST/PUT/DELETE  /api/alocacoes
GET/POST/PUT/DELETE  /api/diarias
GET/POST/PUT/DELETE  /api/tags
```

### Cálculos

```http
POST   /api/contrato-calculos/calcular-valor-total
```

---

## ⏭️ Próximos Passos

### ✅ Refatoração DDD — Concluída (6 Fases)

- [x] **Fase 1:** Shared Kernel — `Entity`, `IDomainEvent`, `IUnitOfWork`, `DomainException`, semântica `Enforce()`
- [x] **Fase 2:** Value Objects — `Cpf`, `Cnpj`, `Email`, `Telefone`, `Cep` com mapeamentos `OwnsOne` no EF Core
- [x] **Fase 3:** Reorganização de namespaces — `Modulos/` → `BoundedContexts/` + `SharedKernel/` (3 BCs: Operacoes, Auth, Whatsapp)
- [x] **Fase 4:** Clean Architecture + ACL — Ports/Adapters para Whatsapp BC, remoção de erro PostgreSQL FK da Application, transações explícitas
- [x] **Fase 5:** Paginação — `IPagedResult<T>` + `GetPagedAsync` em todos os 7 repositórios + 4 decoradores de cache
- [x] **Cache Improvements:** `CachedAlocacaoRepository`, `CachedDiariaRepository`, `GetByIdAsync` cacheado, `CacheConfiguration` centralizado (TTL por volatilidade)

### 💼 UX & Business Logic

- [ ] UX Form Contratos: layout aprimorado para adicionar múltiplas ContratoTags rapidamente
- [ ] Contratos: Exibição de totais mensais dinâmicos ao invés de anual
- [ ] Dashboard Super-Admin: Gráficos de receita consolidada, margens e saving do cliente
- [ ] Preview de escalonamento mensal de diárias baseadas no calendário do funcionário

### 🧪 Qualidade

- [ ] Testes E2E com Playwright
- [ ] Observabilidade (logs estruturados + métricas)

### ☁️ Infraestrutura / DevOps

- [ ] Subir na nuvem (AWS Free Tier / VPS Linux)
- [ ] Integrar Redis como Cache L2 no backend
- [ ] Rate limiting (login, API pública)
- [ ] Migração futura BCrypt → Argon2id (quando houver >= 4GB RAM)

### 💰 Módulo Financeiro

- [ ] Geração de folha de pagamento baseada no somatório de diárias reais
- [ ] Relatórios e exportação PDF (escalas, folha)
- [ ] Integração com gateway de pagamento

### 🤖 AI & RAG

- [ ] Sistema RAG para WhatsApp (resolução contextual de dúvidas de plantão)
- [ ] Agente de suporte ao cliente via LLM + RAG
- [ ] AI Profiler: análise de eficiência por funcionário, detecção de absenteísmo

### 🔑 Controle de Acesso & Ponto

- [ ] Reconhecimento facial no aplicativo para batida de ponto
- [ ] Analytics: Diárias agendadas vs Ponto executado
- [ ] Score de assiduidade de colaboradores

---

## Contato e Colaboração

- Abra issues detalhando Situação, Tarefa, Ação, Resultado esperados
- Pull Requests devem incluir testes e seguir o padrão de validação existente
- Dúvidas sobre regras de negócio? Consulte os módulos de domínio primeiro

**Licença:** MIT
