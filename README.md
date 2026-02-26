# InterceptorSystem

## **Status:** ✅ Backend | ✅ Frontend | ✅ Docker Compose | ✅ CI/CD

## 📋 Sobre o Projeto

## **InterceptorSystem** é uma plataforma de gestão de segurança patrimonial para condomínios, desenvolvida com **.NET 8** (backend) e **Angular 21** (frontend). Gerencia **condomínios, funcionários, postos de trabalho, alocações e contratos** com regras de negócio robustas em Clean Architecture.

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

### Frontend

- **Dashboard financeiro** com análise por período (mensal, trimestral, semestral, anual)
- **Wizard de criação de condomínio** em 3 steps com validação progressiva
- **3 modos de visualização de alocações**: Diário (lista), Semanal (kanban), Mensal (calendário)
- **Dark mode / Light mode** com toggle no navbar e persistência em localStorage
- **Cálculos em tempo real** nos formulários de contrato e condomínio
- **Formulários com máscaras**: CNPJ, CPF, celular
- **Detail de condomínio** com breakdown financeiro completo
- **Detail de funcionário** com alocações, faltas e cálculo de custo
- **Detail de posto de trabalho** com alocações e estatísticas

### Infraestrutura

- **Docker Compose** com 4 serviços orquestrados (DB + API + Frontend + Nginx)
- **Hot-reload** para backend (`dotnet watch`) e frontend (`ng serve --poll`)
- **npm 11.10.1** atualizado na imagem Docker do frontend
- **CI/CD GitHub Actions** testando Backend + Frontend + Docker em cada PR
- **Nginx** como reverse proxy para a API

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
| Regra | Descrição |
|-------|-----------|
| Consistência | `QuantidadeIdealPorTurno` == `QuantidadeFuncionarios` do contrato |
| Divisibilidade | Quantidade de funcionários divisível pelo número de postos |
| Horários automáticos | `24h / NumeroDePostos` por turno |

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
InterceptorSystem.Infrastructure/ → DbContext, Configurations, Repositórios
InterceptorSystem.Api/            → Controllers, Program, Middlewares
InterceptorSystem.Tests/          → Unity + Integration tests
```

**Enums:**
| Enum | Valores |
|------|---------|
| `StatusContrato` | `ATIVO`, `PENDENTE`, `FINALIZADO` |
| `StatusFuncionario` | `ATIVO`, `FERIAS`, `AFASTADO`, `DEMITIDO` |
| `TipoEscala` | `DOZE_POR_TRINTA_SEIS`, `SEIS_POR_UM` |
| `TipoFuncionario` | `CLT`, `TERCEIRIZADO`, `FREELANCE` |
| `StatusAlocacao` | `CONFIRMADA`, `CANCELADA`, `FALTA_REGISTRADA` |
| `TipoAlocacao` | `REGULAR`, `DOBRA_PROGRAMADA`, `SUBSTITUICAO` |

### Frontend (Angular 21 Standalone)

```
features/
  condominios/    → list/, form/, detail/, condominio-wizard/
  funcionarios/   → list/, form/, detail/
  contratos/      → list/, form/
  postos/         → list/, form/, detail/
  alocacoes/      → list/, form/, detail/
services/         → comunicação com API
models/           → interfaces TypeScript (alinhados com DTOs)
shared/           → navbar, sidebar, layout
pages/            → dashboard
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
```

### Hot-Reload

**Backend:** `dotnet watch run` — detecta mudanças e recompila automaticamente  
**Frontend:** `ng serve --host 0.0.0.0 --poll 1000` — hot module replacement ativo

---

## 🔄 CI/CD

Pipeline GitHub Actions executado em todo PR para `main`:
| Job | O que testa |
|-----|-------------|
| **Backend** | Restore → Build → 167 testes (unit + integration) com PostgreSQL |
| **Frontend** | `npm ci` → Build produção (`--configuration=production`) |
| **Docker** | `docker compose build` valida Dockerfiles |
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

### Frontend

| Tecnologia | Versão  |
| ---------- | ------- |
| Angular    | 21      |
| TypeScript | 5.7     |
| RxJS       | 7.8     |
| Node.js    | 20 LTS  |
| npm        | 11.10.1 |

### Infraestrutura

| Ferramenta         | Uso           |
| ------------------ | ------------- |
| Docker Compose 2.x | Orquestração  |
| Nginx Alpine       | Reverse proxy |
| GitHub Actions     | CI/CD         |

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
│       ├── InterceptorSystem.Application/
│       ├── InterceptorSystem.Domain/
│       ├── InterceptorSystem.Infrastructure/
│       ├── InterceptorSystem.Tests/
│       ├── compose.yml
│       ├── compose.override.yml
│       └── nginx.conf
│
├── frontend/
│   ├── src/app/
│   │   ├── features/
│   │   ├── services/
│   │   ├── models/
│   │   ├── shared/
│   │   └── pages/
│   ├── Dockerfile
│   ├── angular.json
│   └── package.json
│
├── docs/
│   ├── backend/
│   ├── frontend/
│   └── refatoracao/
│
├── .env.example
├── .github/workflows/ci.yml
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

## **Total: 167 testes automatizados**

## ⏭️ Próximos Passos

- [ ] Sistema de login e autenticação
- [ ] Gerenciamento de assinaturas e contas
- [ ] Notificações por email/SMS (contratos vencendo, faltas)
- [ ] Relatórios em PDF (escalas, folha de pagamento)
- [ ] Testes E2E com Playwright
- [ ] Observabilidade (logs estruturados + métricas)
- [ ] Subir na nuvem (AWS / GCP)
- [ ] Acesso via WhatsApp (integração)

---

## Contato e Colaboração

- Abra issues detalhando Situação, Tarefa, Ação, Resultado esperados
- Pull Requests devem incluir testes e seguir o padrão de validação existente
- Dúvidas sobre regras de negócio? Consulte os módulos de domínio primeiro
  **Licença:** MIT
