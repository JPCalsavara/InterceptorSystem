# InterceptorSystem

## **Status:** ✅ Backend | ✅ Frontend | ✅ Docker Compose | ✅ CI/CD | ✅ Auth & SaaS | ✅ WhatsApp Bot

## 📋 Sobre o Projeto

**InterceptorSystem** é uma plataforma SaaS de gestão de segurança patrimonial para condomínios, desenvolvida com **.NET 8** (backend) e **Angular 21** (frontend). Gerencia **condomínios, funcionários, postos de trabalho, alocações e contratos** com regras de negócio robustas em Clean Architecture. Inclui **autenticação JWT**, **gestão de contas e assinaturas** (FREE/BASIC/PRO), **notificações por e-mail** (SMTP) e **integração WhatsApp** para substituição de alocações via chatbot.

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

- **CRUD completo** para Condomínio, Funcionário, PostoDeTrabalho, Alocação e Contrato
- **Criação em cascata** via `POST /api/condominios-completos` (Condomínio + Contrato + Postos em 1 request)
- **Cálculo automático de salário** baseado no contrato vigente
- **Alocações em lote** via `POST /api/alocacoes/batch`
- **Cálculos financeiros de contrato** via `POST /api/contrato-calculos`
- **Auto-finalização de contratos** vencidos ao listar
- **Multi-tenant** com filtros globais por `EmpresaId`
- **Quantidade ideal de funcionários por posto** calculada do condomínio
- **Autenticação JWT** com registro, login, verificação de e-mail e reset de senha
- **Gestão de contas SaaS** com planos de assinatura (FREE, BASIC, PRO)
- **Notificações por e-mail** via SMTP (MailKit) — verificação, reset de senha, alteração de e-mail
- **Integração WhatsApp** via Meta API — chatbot para substituição de alocações

### Frontend

- **Landing page pública** com informações do sistema
- **Fluxo de autenticação completo**: login, cadastro, esqueci a senha, nova senha, verificação de e-mail
- **Gestão de conta**: perfil, alteração de dados, seleção de plano
- **Dashboard financeiro** com análise por período (mensal, trimestral, semestral, anual)
- **Wizard de criação de condomínio** em 3 steps com validação progressiva
- **3 modos de visualização de alocações**: Diário (lista), Semanal (kanban), Mensal (calendário)
- **Dark mode / Light mode** com toggle no navbar e persistência em localStorage
- **Cálculos em tempo real** nos formulários de contrato e condomínio
- **Formulários com máscaras** (ngx-mask): CNPJ, CPF, celular — formatação visual com `dropSpecialCharacters`
- **Detail de condomínio** com breakdown financeiro completo
- **Detail de funcionário** com alocações, faltas, salário simulado e projeção de mês completo
- **Detail de posto de trabalho** com alocações e estatísticas
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

O sistema possui um **chatbot WhatsApp** integrado via **Meta Webhook** para processar substituições de alocações de segurança de forma conversacional.

| Endpoint              | Método | Descrição                                    |
| --------------------- | ------ | -------------------------------------------- |
| `/api/whatsapp/webhook` | GET  | Verificação de webhook exigida pela Meta     |
| `/api/whatsapp/webhook` | POST | Recebe mensagens — processamento em background |

### Fluxo Conversacional (Estado da Sessão)

O bot guia o usuário por um fluxo de substituição de alocação:

```
AguardandoCondominio → AguardandoPosto → AguardandoData
→ AguardandoFuncionarioSubstituido → AguardandoFuncionarioSubstituto
→ AguardandoConfirmacao → Concluida / Cancelada
```

- Atalhos globais: `0`, `cancelar`, `sair` → cancela a sessão
- Telefones não autorizados recebem mensagem de bloqueio

### Ranking de Substitutos (`SubstitutoRankerService`)

- Funcionário deve estar `ATIVO` e sem alocação no dia
- Score = quantidade de alocações nos últimos 30 dias (menos = mais disponível)
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

### Condomínio

| Regra                | Descrição                                                                  |
| -------------------- | -------------------------------------------------------------------------- |
| CNPJ único           | Não pode haver dois condomínios com o mesmo CNPJ na mesma empresa          |
| Configs operacionais | `QuantidadeIdealPorTurno`, `HorarioTrocaTurno`, `EmailGestor` obrigatórios |
| Base para postos     | Horário de troca define turnos criados automaticamente                     |

```
✅ Criar condomínio com 6 funcionários ideais por turno → Status 201
❌ CNPJ duplicado → "Já existe um condomínio cadastrado com este CNPJ" (409)
❌ QuantidadeIdealPorTurno ≤ 0 → Validação falha (400)
```

### PostoDeTrabalho

| Regra                     | Descrição                                                                       |
| ------------------------- | ------------------------------------------------------------------------------- |
| Turno de 12h              | Diferença entre `HorarioInicio` e `HorarioFim` deve ser exatamente 12 horas     |
| Vinculado ao condomínio   | `CondominioId` obrigatório e deve pertencer à mesma empresa                     |
| Vinculado ao contrato     | `ContratoId` obrigatório — contrato deve estar `ATIVO` ou `PENDENTE`            |
| Limite de postos          | Não pode exceder `Contrato.NumeroDePostos` postos por contrato                  |
| Permite dobra de escala   | `PermiteDobrarEscala` define se funcionários podem fazer dobra                  |
| Horário noturno detectado | `TemHorarioNoturno` (calculado) — `true` se o turno passa pelo intervalo 22h–5h |

```
✅ Posto 06:00-18:00 → Criado com sucesso
✅ Posto 18:00-06:00 (madrugada) → Criado com sucesso
❌ Posto 08:00-16:00 (8h) → "O turno deve ter exatamente 12 horas" (400)
```

### Funcionário

| Regra                               | Descrição                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| CPF único                           | Não pode haver dois funcionários com mesmo CPF                                                       |
| Vínculo obrigatório com contrato    | Todo funcionário deve ter `ContratoId` apontando para contrato `ATIVO`                               |
| Salários calculados automaticamente | `SalarioBase`, `AdicionalNoturno` e `Beneficios` derivados do contrato                               |
| Adicional noturno por horário       | Baseado em `PostoDeTrabalho.TemHorarioNoturno` — turno que passa pelo intervalo 22h–5h (CLT Art. 73) |

**Fórmula de Salário:**

```
SalarioBase        = Contrato.ValorTotalMensal / Contrato.QuantidadeFuncionarios
AdicionalNoturno   = SalarioBase × Contrato.PercentualAdicionalNoturno  (se PostoDeTrabalho.TemHorarioNoturno = true, i.e., turno passa por 22h–5h)
Beneficios         = Contrato.ValorBeneficiosExtrasMensal / Contrato.QuantidadeFuncionarios
SalarioTotal       = SalarioBase + AdicionalNoturno + Beneficios
```

```
✅ Funcionário com contrato ATIVO → Salário calculado automaticamente
❌ CPF duplicado → "CPF já cadastrado" (409)
❌ Contrato inexistente → "Contrato não encontrado" (404)
❌ Contrato FINALIZADO → "Contrato não está vigente" (400)
```

### Alocação

| Regra                     | Descrição                                                    |
| ------------------------- | ------------------------------------------------------------ |
| Mesmo condomínio          | Funcionário e posto devem ser do mesmo condomínio            |
| Sem alocações simultâneas | Uma alocação por funcionário por data                        |
| Sem dias consecutivos     | Bloqueado exceto para `DOBRA_PROGRAMADA`                     |
| Descanso pós-dobra        | Após dobra programada, obrigatório descansar no dia seguinte |

```
✅ Alocação REGULAR 10/01 → Criada
❌ Mesma pessoa 10/01 e 11/01 REGULAR → "Não é permitido alocações em dias consecutivos" (400)
✅ Mesma pessoa 10/01 REGULAR + 11/01 DOBRA_PROGRAMADA → Permitido
❌ Após DOBRA, nova alocação no dia seguinte → "Funcionário deve descansar após dobra" (400)
❌ Funcionário Cond. A em Posto Cond. B → "Devem pertencer ao mesmo condomínio" (400)
```

### Contrato

| Regra                            | Descrição                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Um vigente por condomínio        | Máximo 1 contrato `ATIVO` ou `PENDENTE` por condomínio                                            |
| Auto-finalização                 | Contratos com `DataFim` vencida são marcados `FINALIZADO` no GetAll                               |
| Período válido                   | `DataFim` > `DataInicio`                                                                          |
| Status                           | `ATIVO` → `PENDENTE` → `FINALIZADO`                                                               |
| QuantidadeFuncionarios calculado | `[NotMapped]` — derivado de `Condominio.QuantidadeIdealPorTurno × NumeroDePostos`, não persistido |

**Fórmula de Cálculo do Valor Total:**

```
QuantidadeFuncionarios = Condominio.QuantidadeIdealPorTurno × NumeroDePostos
custoBase    = (ValorDiariaCobrada × 30 × QuantidadeFuncionarios × NumeroDePostos) + ValorBeneficios
somaMargens  = percentualImpostos + margemLucro + margemCoberturaFaltas
valorTotal   = custoBase / (1 - somaMargens)
```

```
✅ Contrato único por condomínio → Criado
❌ Segundo contrato ATIVO no mesmo condomínio → "Já existe contrato vigente" (409)
✅ Contrato FINALIZADO + novo ATIVO → Permitido
✅ Contrato expirado → Marcado FINALIZADO automaticamente no next GetAll
```

### Criação em Cascata (`POST /api/condominios-completos`)

Cria Condomínio + Contrato + Postos em **1 único request**.

| Regra            | Descrição                                                       |
| ---------------- | --------------------------------------------------------------- |
| Consistência     | `QuantidadeIdealPorTurno` == `QuantidadeFuncionarios` do contrato |
| Divisibilidade   | Quantidade de funcionários divisível pelo número de postos      |
| Horários automáticos | `24h / NumeroDePostos` por turno                            |

```json
POST /api/condominios-completos
{
  "condominio": {
    "nome": "Residencial Estrela",
    "cnpj": "12.345.678/0001-90",
    "endereco": "Rua das Flores, 123",
    "quantidadeIdealPorTurno": 6,
    "horarioTrocaTurno": "06:00:00",
    "emailGestor": "gestor@estrela.com"
  },
  "contrato": {
    "descricao": "Contrato 2026",
    "valorDiariaCobrada": 100.00,
    "quantidadeFuncionarios": 6,
    "numeroDePostos": 1,
    "dataInicio": "2026-01-10",
    "dataFim": "2026-12-31"
  },
  "criarPostosAutomaticamente": true,
  "numeroDePostos": 1
}
```

```
✅ 1 request → Condomínio + Contrato + Postos criados
✅ POST /api/condominios-completos/validar → Dry-run (não persiste)
❌ Quantidades inconsistentes → Erro 400
❌ Não divisível → Erro 400
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
| `Administrativo`  | Condomínio, Funcionário, PostoDeTrabalho, Alocação, Contrato |
| `Auth`            | Conta (SaaS), TokenVerificacao, PlanoAssinatura              |
| `Whatsapp`        | SessaoWhatsapp, EstadoConversa                               |

### Enums

| Enum                  | Valores                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `StatusContrato`      | `ATIVO`, `PENDENTE`, `FINALIZADO`                                         |
| `StatusFuncionario`   | `ATIVO`, `FERIAS`, `AFASTADO`, `DEMITIDO`                                |
| `TipoEscala`          | `DOZE_POR_TRINTA_SEIS`, `SEIS_POR_UM`                                    |
| `TipoFuncionario`     | `CLT`, `TERCEIRIZADO`, `FREELANCE`                                        |
| `StatusAlocacao`      | `CONFIRMADA`, `CANCELADA`, `FALTA_REGISTRADA`                             |
| `TipoAlocacao`        | `REGULAR`, `DOBRA_PROGRAMADA`, `SUBSTITUICAO`                             |
| `PlanoAssinatura`     | `FREE`, `BASIC`, `PRO`                                                    |
| `TipoTokenVerificacao`| `EmailVerificacao`, `AlteracaoSenha`, `AlteracaoEmail`, `VerificacaoTelefone` |
| `EstadoConversa`      | `AguardandoCondominio`, `AguardandoPosto`, `AguardandoData`, `AguardandoFuncionarioSubstituido`, `AguardandoFuncionarioSubstituto`, `AguardandoConfirmacao`, `Concluida`, `Cancelada` |

### Frontend (Angular 21 Standalone)

```
core/
  guards/            → auth.guard.ts
  interceptors/      → auth.interceptor.ts
features/
  condominios/       → list/, form/, detail/, condominio-wizard/
  funcionarios/      → list/, form/, detail/
  contratos/         → list/, form/
  postos/            → list/, form/, detail/
  alocacoes/         → list/, form/, detail/
services/            → comunicação com API (auth, condominios, contratos, etc.)
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
│       │       ├── CondominioController.cs
│       │       ├── CondominiosCompletosController.cs
│       │       ├── ContratosController.cs
│       │       ├── ContratoCalculosController.cs
│       │       ├── FuncionariosController.cs
│       │       ├── PostosDeTrabalhoController.cs
│       │       └── AlocacoesController.cs
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
│   │   ├── features/                 → condominios, funcionarios, contratos,
│   │   │                               postos, alocacoes
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
| Condomínio        | ✅               | ✅                   |
| PostoDeTrabalho   | ✅               | ✅                   |
| Funcionário       | ✅               | ✅                   |
| Alocação          | ✅               | ✅                   |
| Contrato          | ✅               | ✅                   |
| Cálculos Contrato | ✅               | ✅                   |
| Alocações Batch   | ✅               | ✅                   |
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
POST   /api/condominios-completos
POST   /api/condominios-completos/validar
```

### CRUD Principal

```http
GET/POST/PUT/DELETE  /api/condominios
GET/POST/PUT/DELETE  /api/contratos
GET/POST/PUT/DELETE  /api/funcionarios
GET/POST/PUT/DELETE  /api/postos-de-trabalho
GET/POST/PUT/DELETE  /api/alocacoes
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
- [ ] AI Profiler: eficiência operacional, ausências, alocações dupla vs normal

### 🔑 Controle de Acesso & Ponto

- [ ] Reconhecimento facial para entrada no condomínio
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
- [ ] Configuração específica para terceirizados multi-condomínio

---

## Contato e Colaboração

- Abra issues detalhando Situação, Tarefa, Ação, Resultado esperados
- Pull Requests devem incluir testes e seguir o padrão de validação existente
- Dúvidas sobre regras de negócio? Consulte os módulos de domínio primeiro

**Licença:** MIT
