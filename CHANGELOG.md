# 📝 CHANGELOG

---

## [3.0.0] - 2026-02-28

### 🎉 Autenticação, SaaS & Integrações

**Impacto:** Alto — novo módulo Auth, novas entidades, 3 migrations, integração externa

#### ✨ Novidades

**Autenticação JWT completa:**
- Registro de conta (`POST /api/auth/registrar`) — cria tenant/empresa automaticamente
- Login com JWT Bearer (`POST /api/auth/login`)
- Verificação de e-mail via token (`POST /api/auth/email/confirmar`)
- Reenvio de e-mail de verificação (`POST /api/auth/email/reenviar`)
- Solicitação e confirmação de reset de senha (`/api/auth/senha/*`)
- Solicitação e confirmação de alteração de e-mail (`/api/auth/email/*-alteracao`)

**Gestão de Conta SaaS:**
- Perfil da conta (`GET /api/conta`)
- Atualização de dados (`PUT /api/conta` — nome empresa, e-mail, senha)
- Cadastro e verificação de telefone via WhatsApp (`/api/conta/telefone/*`)
- Planos de assinatura: `FREE`, `BASIC`, `PRO`

**Notificações por E-mail (SMTP):**
- Implementação com MailKit
- Templates HTML para: verificação de e-mail, reset de senha, alteração de e-mail
- Configuração via variáveis de ambiente (`SMTP__HOST`, `SMTP__PORT`, etc.)

**WhatsApp Bot (Meta API):**
- Webhook para receber mensagens (`GET/POST /api/whatsapp/webhook`)
- Máquina de estados conversacional (`EstadoConversa`) para substituição de diárias
- Sessão persistida por telefone (`SessaoWhatsapp`) com expiração de 15 minutos
- Processamento assíncrono (fire-and-forget)

**Frontend — Páginas de Autenticação:**
- Landing page pública
- Login, cadastro, esqueci a senha, nova senha, verificar e-mail
- Perfil, conta, seleção de plano
- Auth Guard protegendo rotas
- Auth Interceptor injetando JWT

#### 📦 Novas Entidades

- `Conta` — conta SaaS (Id = EmpresaId do tenant)
- `TokenVerificacao` — tokens temporários com expiração
- `SessaoWhatsapp` — estado da conversa do bot

#### 🔧 Migrations

- `AddContaAuth` — tabela de contas
- `AddEmailVerification` — tokens de verificação
- `AddSessaoWhatsappTable` — sessões do WhatsApp

---

## [2.2.0] - 2026-02-06

### Refatoração: QuantidadeFuncionarios → Calculado Automaticamente

**Impacto:** Médio — breaking change na API, 1 migration

#### ✨ Mudanças

- `QuantidadeFuncionariosIdeal` renomeado para `QuantidadeIdealPorTurno` em `Cliente`
- `QuantidadeFuncionarios` removido da persistência de `Contrato` — agora propriedade `[NotMapped]` calculada: `QuantidadeIdealPorTurno × NumeroDePostos`
- Eager loading do `PostoRepository` simplificado (não carrega mais lista de postos desnecessariamente)
- Configuração EF Core atualizada em `ClienteConfiguration`

#### ⚠️ Breaking Changes (API)

- `POST /api/clientes` e `GET /api/clientes`: campo `quantidadeFuncionariosIdeal` → `quantidadeIdealPorTurno`
- `POST /api/contratos` e `POST /api/clientes-completos`: campo `quantidadeFuncionarios` **removido** do input (calculado automaticamente)
- `GET /api/contratos/{id}`: campo `quantidadeFuncionarios` mantido no output (retornado calculado)

#### 🔧 Fórmula

```
QuantidadeFuncionarios = Cliente.QuantidadeIdealPorTurno × Contrato.NumeroDePostos
```

#### 🐛 Benefícios

- Elimina inconsistências entre `QuantidadeFuncionarios` e os campos de origem
- Single Source of Truth: cada entidade tem sua responsabilidade clara
- Menos validações necessárias (o cálculo é sempre correto)

#### 📦 Arquivos Modificados

- Domain: `Cliente.cs`, `Contrato.cs`, `Posto.cs`
- Application: `ClienteDto.cs`, `ContratoDto.cs`, `ClienteCompletoDto.cs`, `ClienteAppService.cs`, `ContratoAppService.cs`, `ClienteOrquestradorService.cs`
- Infrastructure: migration `RenameQuantidadeFuncionariosIdealToQuantidadeIdealPorTurno`, `ClienteConfiguration.cs`, `PostoRepository.cs`

---

## [2.1.0] - 2026-02-06

### Correção: Adicional Noturno (CLT Art. 73)

**Impacto:** Baixo — zero mudanças no banco de dados

#### 🐛 Bug Corrigido

Adicional noturno era calculado com base na **escala do funcionário** (ex: 12x36), o que é incorreto segundo a CLT. O correto é verificar se o **horário do posto de trabalho** passa pelo período noturno (22h às 5h).

#### ✨ Mudanças

- Nova propriedade calculada `TemHorarioNoturno` em `Posto`: retorna `true` se o turno passa pelo período 22h–5h
- `Funcionario.AdicionalNoturno` agora depende de `Posto.TemHorarioNoturno`
- 7 novos testes unitários em `AdicionalNoturnoTests.cs` cobrindo todos os cenários de horário

#### 📊 Exemplos

| Posto   | Antes              | Depois        |
| ------- | ------------------ | ------------- |
| 6h–18h  | Dependia da escala | Sem adicional |
| 18h–6h  | Com adicional      | Com adicional |
| 22h–10h | Com adicional      | Com adicional |
| 0h–12h  | Dependia da escala | Com adicional |

#### 🧪 Testes

- **167/167 testes passando** (era 160 antes desta correção)
- Zero quebras de compatibilidade
- Zero mudanças no banco de dados

---

## [2.0.0] - 2026-01-08

### 🎉 Versão Principal - Refatoração Completa

**Resumo:** 5 fases implementadas focando em consistência financeira e automação.

### ✨ Novidades

#### **FASE 5: Criação em Cascata**

- ✅ Endpoint `POST /api/clientes-completos` (1 request ao invés de 4)
- ✅ Validação dry-run: `POST /api/clientes-completos/validar`
- ✅ Cálculo automático de horários de turnos
- ✅ 75% redução em código frontend

#### **FASE 4: Posto Simplificado**

- ✅ `QuantidadeIdealFuncionarios` agora é calculado do Cliente
- ❌ Removidos campos duplicados

#### **FASE 3: Salários Automáticos**

- ✅ Salários calculados em tempo real do Contrato
- ✅ **CORREÇÃO CRÍTICA:** Margens de lucro e faltas agora consideradas
- ❌ Removidos campos de salário de Funcionário

#### **FASE 2: Vínculo Contrato**

- ✅ Funcionário DEVE ter contrato vigente
- ✅ Validação de expiração automática

#### **FASE 1: Configs Operacionais**

- ✅ Cliente centraliza configs (qtd funcionários, horário troca)

### 🐛 Bugs Críticos Corrigidos

1. **Margens não consideradas:** Fórmula de salário corrigida
2. **Cálculo frontend errado:** Endpoint backend criado
3. **Testes com mocks incorretos:** Reflection configurado

### 📊 Métricas

- 75% menos requests API
- 75% menos código frontend
- 73 testes automatizados
- Zero inconsistências financeiras

---

## [1.0.0] - 2025-12-01

### Versão Inicial

- CRUD completo: Clientes, Postos, Funcionários, Diárias, Contratos
- Multi-tenant por `EmpresaId`
- Validações básicas
- Docker + PostgreSQL

---

**Formato:** [Keep a Changelog](https://keepachangelog.com/)
