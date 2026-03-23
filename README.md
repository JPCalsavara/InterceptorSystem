# InterceptorSystem

## **Status:** ✅ Backend | ✅ Frontend | ✅ Docker Compose | ✅ CI/CD | ✅ Auth & SaaS | ✅ WhatsApp Bot

## 📋 Sobre o Projeto

**InterceptorSystem** é uma plataforma SaaS de gestão de segurança patrimonial para clientes, desenvolvida com **.NET 8** (backend) e **Angular 21** (frontend). Gerencia **clientes, funcionários, postos de trabalho, diárias e contratos** com regras de negócio robustas em Clean Architecture. Inclui **autenticação JWT**, **gestão de contas e assinaturas** (FREE/BASIC/PRO), **notificações por e-mail** (SMTP) e **integração WhatsApp** para substituição de diárias via chatbot.

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

- **CRUD completo** para Cliente, Funcionário, Posto, Diária e Contrato
- **Criação em cascata** via `POST /api/clientes-completos` (Cliente + Contrato + Postos em 1 request)
- **Cálculo automático de salário** baseado no contrato vigente
- **Diárias em lote** via `POST /api/diarias/batch`
- **Cálculos financeiros de contrato** via `POST /api/contrato-calculos`
- **Auto-finalização de contratos** vencidos ao listar
- **Multi-tenant** com filtros globais por `EmpresaId`
- **Quantidade ideal de funcionários por posto** calculada do cliente
- **Autenticação JWT** com registro, login, verificação de e-mail e reset de senha
- **Gestão de contas SaaS** com planos de assinatura (FREE, BASIC, PRO)
- **Notificações por e-mail** via SMTP (MailKit) — verificação, reset de senha, alteração de e-mail
- **Integração WhatsApp** via Meta API — chatbot para substituição de diárias

### Frontend

- **Landing page pública** com informações do sistema
- **Fluxo de autenticação completo**: login, cadastro, esqueci a senha, nova senha, verificação de e-mail
- **Gestão de conta**: perfil, alteração de dados, seleção de plano
- **Dashboard financeiro** com análise por período (mensal, trimestral, semestral, anual)
- **Wizard de criação de cliente** em 3 steps com validação progressiva
- **3 modos de visualização de diárias**: Diário (lista), Semanal (kanban), Mensal (calendário)
- **Dark mode / Light mode** com toggle no navbar e persistência em localStorage
- **Cálculos em tempo real** nos formulários de contrato e cliente
- **Formulários com máscaras** (ngx-mask): CNPJ, CPF, celular — formatação visual com `dropSpecialCharacters`
- **Detail de cliente** com breakdown financeiro completo
- **Detail de funcionário** com diárias, faltas, salário simulado e projeção de mês completo
- **Detail de posto de trabalho** com diárias e estatísticas
- **Auth Guard** protegendo rotas autenticadas
- **Auth Interceptor** injetando token JWT em todas as requisições

### Infraestrutura

- **Docker Compose** com 4 serviços orquestrados (DB + API + Frontend + Nginx)
- **Hot-reload** para backend (`dotnet watch`) e frontend (`ng serve --poll`)
- **npm 11.10.1** atualizado na imagem Docker do frontend
- **CI/CD GitHub Actions** testando Backend + Frontend + Docker em cada PR
- **Nginx** como reverse proxy para a API

---

## 🔐 Autenticação & Contas

### Sistema de Autenticação (JWT)

| Endpoint                         | Método | Descrição                                   | Autenticado |
| -------------------------------- | ------ | ------------------------------------------- | ----------- |
| `/api/auth/registrar`            | POST   | Registro de nova conta (cria tenant/empresa) | ❌          |
| `/api/auth/login`                | POST   | Login com e-mail e senha → retorna JWT       | ❌          |
| `/api/auth/email/confirmar`      | POST   | Confirma verificação de e-mail via token     | ❌          |
| `/api/auth/email/reenviar`       | POST   | Reenvia e-mail de verificação                | ✅          |
| `/api/auth/senha/solicitar-reset`| POST   | Solicita link de redefinição de senha        | ❌          |
| `/api/auth/senha/confirmar-reset`| POST   | Confirma nova senha via token                | ❌          |
| `/api/auth/email/solicitar-alteracao` | POST | Solicita alteração de e-mail            | ✅          |
| `/api/auth/email/confirmar-alteracao` | POST | Confirma novo e-mail via token           | ❌          |

### Gestão de Conta (SaaS)

| Endpoint                    | Método | Descrição                                    |
| --------------------------- | ------ | -------------------------------------------- |
| `/api/conta`                | GET    | Retorna perfil da conta autenticada          |
| `/api/conta`                | PUT    | Atualiza nome da empresa, e-mail ou senha    |
| `/api/conta/telefone`       | POST   | Cadastra telefone e envia código via WhatsApp |
| `/api/conta/telefone/confirmar` | POST | Confirma telefone com token de verificação   |

### Planos de Assinatura

| Plano   | Descrição                  |
| ------- | -------------------------- |
| `FREE`  | Plano gratuito (padrão)    |
| `BASIC` | Funcionalidades básicas    |
| `PRO`   | Funcionalidades completas  |

### Entidades de Autenticação

| Entidade           | Descrição                                                              |
| ------------------ | ---------------------------------------------------------------------- |
| `Conta`            | Conta SaaS — o "dono" do tenant. O `Id` é o `EmpresaId` de todo o sistema |
| `TokenVerificacao` | Token temporário para verificação de e-mail, reset de senha e alteração de e-mail |

### Enums de Autenticação

| Enum                   | Valores                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `PlanoAssinatura`      | `FREE`, `BASIC`, `PRO`                                                    |
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

| Página             | Rota                | Descrição                            |
| ------------------ | ------------------- | ------------------------------------ |
| Landing            | `/`                 | Página pública de apresentação       |
| Login              | `/login`            | Formulário de login                  |
| Cadastro           | `/cadastro`         | Registro de nova conta               |
| Esqueci a Senha    | `/esqueci-senha`    | Solicitar reset de senha             |
| Nova Senha         | `/nova-senha`       | Redefinir senha via token            |
| Verificar E-mail   | `/verificar-email`  | Confirmar verificação de e-mail      |
| Perfil             | `/perfil`           | Visualizar/editar dados da conta     |
| Conta              | `/conta`            | Configurações da conta               |
| Plano              | `/plano`            | Seleção/alteração de plano           |

---

## 📱 WhatsApp Bot

### Integração com Meta (WhatsApp Business API)

O sistema possui um **chatbot WhatsApp** integrado via **Meta Webhook** para processar substituições de diárias de segurança de forma conversacional.

| Endpoint              | Método | Descrição                                    |
| --------------------- | ------ | -------------------------------------------- |
| `/api/whatsapp/webhook` | GET  | Verificação de webhook exigida pela Meta     |
| `/api/whatsapp/webhook` | POST | Recebe mensagens — processamento em background |

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

| Regra                | Descrição                                                                  |
| -------------------- | -------------------------------------------------------------------------- |
| CNPJ único           | Não pode haver dois clientes com o mesmo CNPJ na mesma empresa          |
| Configs Base         | `EmailGestor`, `TelefoneEmergencia` opcionais                              |
| Localidade base      | Cidade e Estado fornecem configuração inicial para postos de trabalho      |

```
✅ Criar cliente (dados básicos) → Status 201
❌ CNPJ duplicado → "Já existe um cliente cadastrado com este CNPJ" (409)
```

### Posto (Localização Física)

| Regra                  | Descrição                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Representação          | Local físico vinculado a um Cliente (preenchido com Cidade/Estado do Cliente)      |
| Vinculado ao cliente   | `ClienteId` obrigatório e deve pertencer à mesma empresa                        |
| Base para alocações    | Contém múltiplas `Alocações` (turnos) para o funcionamento do posto                |

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

| Regra                               | Descrição                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| CPF único                           | Não pode haver dois funcionários com mesmo CPF                                                       |
| Vínculo Opcional                    | Pode ter `ClienteId` nulo (Terceirizado/Especial) ou vinculado a um Cliente específico               |
| Tags de Diária                      | Possui relação Many-to-Many com `Tag` (ex: "PM", "Vigia Avulso") determinando seu custo diário       |
| Custo Real Dinâmico                 | Valores não são mais fixos, cálculo = Σ `ValorDiaria` (do Contrato via Tag) + `Beneficios`           |

```
✅ Funcionário [PM] → Histórico financeiro mensal via soma de Diárias
❌ CPF duplicado → "CPF já cadastrado" (409)
```

### Diária (Designação)

| Regra                     | Descrição                                                    |
| ------------------------- | ------------------------------------------------------------ |
| Vinculada à Alocação      | Registra a ida do Funcionário a um turno específico (`AlocacaoId`) |
| Snapshot de Preço         | Recebe `ValorDiaria` no momento da criação com base no acordo/Tag  |
| Sem dias consecutivos     | Bloqueado exceto para `DOBRA_PROGRAMADA`                     |
| Descanso pós-dobra        | Após dobra programada, obrigatório descansar no dia seguinte |

```
✅ Diária REGULAR (ValorDiaria=150) → Criada
❌ Após DOBRA, nova diária no dia seguinte → "Funcionário deve descansar após dobra" (400)
```

### Contrato

| Regra                            | Descrição                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Um vigente por cliente        | Máximo 1 contrato `ATIVO` ou `PENDENTE` por cliente                                            |
| Auto-finalização                 | Contratos com `DataFim` vencida são marcados `FINALIZADO` no GetAll                               |
| Precificação via Tags            | Define os valores acordados para cada tipo de serviço (Tag) cobrados pelo cliente através de `ContratoTag` |

```
✅ Contrato com ContratoTags (PM=R$350, Limpeza=R$100) → Criado
❌ Segundo contrato ATIVO no mesmo cliente → "Já existe contrato vigente" (409)
```

### Criação em Cascata (`POST /api/clientes-completos`)

Cria Cliente + Contrato + Postos + Alocações em **1 único request**.

| Regra            | Descrição                                                       |
| ---------------- | --------------------------------------------------------------- |
| Simplicidade     | Permite inicializar a base da associação de forma rápida        |
| Alocações Autom. | Gera alocações divididas igualmente de acordo com o pedido      |

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

### Backend (Clean Architecture + DDD)

```
InterceptorSystem.Domain/         → Entidades, Enums, Interfaces de Repositório
InterceptorSystem.Application/    → DTOs, AppServices, Interfaces de Serviço
InterceptorSystem.Infrastructure/ → DbContext, Configurations, Repositórios, Email, WhatsApp
InterceptorSystem.Api/            → Controllers, Program, Middlewares
InterceptorSystem.Tests/          → Unity + Integration tests
```

### Módulos de Domínio

| Módulo            | Descrição                                                    |
| ----------------- | ------------------------------------------------------------ |
| `Administrativo`  | Cliente, Funcionario, Posto, Alocacao, Diaria, Contrato, Tag |
| `Auth`            | Conta (SaaS), TokenVerificacao, PlanoAssinatura              |
| `Whatsapp`        | SessaoWhatsapp, EstadoConversa                               |

### Enums

| Enum                  | Valores                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `StatusContrato`      | `ATIVO`, `PENDENTE`, `FINALIZADO`                                         |
| `StatusFuncionario`   | `ATIVO`, `FERIAS`, `AFASTADO`, `DEMITIDO`                                |
| `TipoEscala`          | `DOZE_POR_TRINTA_SEIS`, `OITO_HORAS_SEIS_POR_DOIS`, `SEMANAL_COMERCIAL`, `ALCALA_8H`, `FOLGUISTA` |
| `TipoFuncionario`     | `CLT`, `TERCEIRIZADO`, `FREELANCE`                                        |
| `StatusDiaria`      | `CONFIRMADA`, `CANCELADA`, `FALTA_REGISTRADA`                             |
| `TipoDiaria`        | `REGULAR`, `DOBRA_PROGRAMADA`, `SUBSTITUICAO`                             |
| `PlanoAssinatura`     | `FREE`, `BASIC`, `PRO`                                                    |
| `TipoTokenVerificacao`| `EmailVerificacao`, `AlteracaoSenha`, `AlteracaoEmail`, `VerificacaoTelefone` |
| `EstadoConversa`      | `AguardandoCliente`, `AguardandoPosto`, `AguardandoData`, `AguardandoFuncionarioSubstituido`, `AguardandoFuncionarioSubstituto`, `AguardandoConfirmacao`, `Concluida`, `Cancelada` |

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

| Job         | O que testa                                                      |
| ----------- | ---------------------------------------------------------------- |
| **Backend** | Restore → Build → 167 testes (unit + integration) com PostgreSQL |
| **Frontend**| `npm ci` → Build produção (`--configuration=production`)         |
| **Docker**  | `docker compose build` valida Dockerfiles                        |

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

| Ferramenta         | Uso                         |
| ------------------ | --------------------------- |
| Docker Compose 2.x | Orquestração                |
| Nginx Alpine       | Reverse proxy               |
| GitHub Actions     | CI/CD                       |
| Meta WhatsApp API  | Chatbot de substituições    |

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
│       │   └── Controllers/
│       │       ├── AuthController.cs
│       │       ├── ContaController.cs
│       │       ├── WhatsappWebhookController.cs
│       │       ├── ClienteController.cs
│       │       ├── ClientesCompletosController.cs
│       │       ├── ContratosController.cs
│       │       ├── ContratoCalculosController.cs
│       │       ├── FuncionariosController.cs
│       │       ├── PostosController.cs
│       │       └── DiariasController.cs
│       ├── InterceptorSystem.Application/
│       │   └── Modulos/
│       │       ├── Administrativo/    → Services, DTOs, Interfaces
│       │       ├── Auth/              → AuthAppService, AuthDto
│       │       └── Whatsapp/          → WhatsappBotService, DTOs
│       ├── InterceptorSystem.Domain/
│       │   └── Modulos/
│       │       ├── Administrativo/    → Entities, Enums, Interfaces
│       │       ├── Auth/              → Conta, TokenVerificacao, PlanoAssinatura
│       │       └── Whatsapp/          → SessaoWhatsapp, EstadoConversa
│       ├── InterceptorSystem.Infrastructure/
│       │   ├── Auth/                  → JwtTokenService
│       │   ├── Email/                 → SmtpEmailService
│       │   ├── Whatsapp/              → MetaWhatsappMessageSender
│       │   └── Persistence/           → DbContext, Configurations, Repositories
│       ├── InterceptorSystem.Tests/
│       │   ├── Unity/                 → Testes unitários
│       │   └── Integration/           → Testes de integração (incl. Auth/)
│       ├── compose.yml
│       ├── compose.override.yml
│       └── nginx.conf
│
├── frontend/
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/               → auth.guard.ts
│   │   │   └── interceptors/         → auth.interceptor.ts
│   │   ├── features/                 → clientes, funcionarios, contratos,
│   │   │                               postos, diarias
│   │   ├── services/                 → auth.service.ts + outros
│   │   ├── models/                   → interfaces TypeScript
│   │   ├── shared/                   → navbar, sidebar, layout
│   │   └── pages/                    → landing, login, cadastro, esqueci-senha,
│   │                                   nova-senha, verificar-email, dashboard,
│   │                                   perfil, conta, plano
│   ├── Dockerfile
│   ├── angular.json
│   └── package.json
│
├── docs/
│   ├── INDEX.md
│   └── guias/
│       └── QUICK_START.md
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
| Cliente        | ✅               | ✅                   |
| Posto   | ✅               | ✅                   |
| Funcionário       | ✅               | ✅                   |
| Diária          | ✅               | ✅                   |
| Contrato          | ✅               | ✅                   |
| Cálculos Contrato | ✅               | ✅                   |
| Diárias Batch   | ✅               | ✅                   |
| Criação Cascata   | ✅               | ✅                   |
| Autenticação      | ✅               | ✅                   |

## **Total: 167+ testes automatizados**

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

### CRUD Principal

```http
GET/POST/PUT/DELETE  /api/clientes
GET/POST/PUT/DELETE  /api/contratos
GET/POST/PUT/DELETE  /api/funcionarios
GET/POST/PUT/DELETE  /api/postos
GET/POST/PUT/DELETE  /api/diarias
```

### Cálculos

```http
POST   /api/contrato-calculos/calcular-valor-total
```

---

## ⏭️ Próximos Passos

### 🔧 Dívida Técnica / Refatoração

- [ ] Rename completo `PercentualImpostos` → `PercentualEncargosProvisoes` (Domain, DTOs, Tests, Frontend, Migration — 71+ arquivos)
- [ ] Configuração `IOptions<T>` com validação estrita via Data Annotations para todos os settings (SMTP, Meta, JWT já feito)
- [ ] Ajustar BCrypt work factor para 12 (explícito, ao invés do default 11)
- [ ] Value Objects (Email, Telefone, Dinheiro, Cnpj)
- [ ] Domain Events para notificações automáticas
- [ ] CQRS para relatórios financeiros

### 🧪 Qualidade

- [ ] Testes E2E com Playwright
- [ ] Observabilidade (logs estruturados + métricas)

### ☁️ Infraestrutura / DevOps

- [ ] Subir na nuvem (AWS Free Tier — t3.micro)
- [ ] Cache com Redis
- [ ] Rate limiting (login, API pública)
- [ ] Migração futura BCrypt → Argon2id (quando instância ≥ 4 GiB RAM)

### 💰 Módulo Financeiro

- [ ] Geração de folha de pagamento baseada em escalas reais
- [ ] Relatórios em PDF (escalas, folha de pagamento)
- [ ] Geração de PDFs dinâmicos e boletos bancários
- [ ] Integração com gateway de pagamento

### 🤖 AI & RAG

- [ ] Sistema RAG para WhatsApp (atendimento premium)
- [ ] Agente de suporte ao cliente via LLM + RAG
- [ ] AI Profiler: eficiência operacional, ausências, diárias dupla vs normal

### 🔑 Controle de Acesso & Ponto

- [ ] Reconhecimento facial para entrada no cliente
- [ ] Reconhecimento facial para batida de ponto (clock-in)
- [ ] Analytics: ponto planejado vs realizado
- [ ] Avaliação de funcionários por pontualidade e assiduidade

### 🏢 Ecossistema Admin

- [ ] Super-Admin Dashboard (gráficos de uso, receita total, "Valor Economizado")
- [ ] Gestão de amenidades (salão de festas, áreas comuns)

### 💼 UX & Business Logic

- [ ] Contratos: redesign com datas em formato natural para não-programadores
- [ ] Exibição de valores mensais ao invés de total anual nos contratos
- [ ] Cálculo de 13º salário conforme operação
- [ ] Preview de salário base por tipo de escala (12x36, 5x2)
- [ ] Configuração específica para terceirizados multi-cliente

---

## Contato e Colaboração

- Abra issues detalhando Situação, Tarefa, Ação, Resultado esperados
- Pull Requests devem incluir testes e seguir o padrão de validação existente
- Dúvidas sobre regras de negócio? Consulte os módulos de domínio primeiro

**Licença:** MIT
