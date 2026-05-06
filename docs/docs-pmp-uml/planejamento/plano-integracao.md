# Plano de Integracao do Projeto

**Projeto:** InterceptorSystem
**Data:** 21/04/2026
**Versao:** v2
**Responsavel:** Lideranca tecnica

---

## 1. Objetivo

Garantir integracao consistente entre modulos internos e servicos externos, reduzindo retrabalho entre backend, frontend, infraestrutura e operacao.

## 2. Fronteiras de integracao

- Frontend Angular 21 <-> API REST .NET 8
- API <-> PostgreSQL (EF Core)
- API <-> SMTP (MailKit)
- API <-> Meta WhatsApp Webhook (`/api/whatsapp/webhook`)
- Application/Domain <-> cache e handlers MediatR

## 3. Inventario operacional de APIs

Com base nos controllers atuais, existem rotas para:

- Auth e conta (`/api/auth/*`, `/api/conta*`)
- Operacoes: clientes, funcionarios, postos, contratos, alocacoes, diarias, tags
- Fluxos compostos: clientes completos e calculos de contratos
- Integracao externa: webhook WhatsApp

### 3.1 Endpoints criticos para controle de contrato

| Dominio        | Endpoints de referencia                                                                                              | Objetivo de integracao                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Auth           | `/api/auth/registrar`, `/api/auth/login`, `/api/auth/email/*`                                                        | Ciclo de autenticacao e seguranca de conta |
| Conta          | `/api/conta`, `/api/conta/telefone`, `/api/conta/telefone/confirmar`                                                 | Perfil SaaS e vinculacao de telefone       |
| Operacoes      | `/api/clientes`, `/api/funcionarios`, `/api/postos`, `/api/alocacoes`, `/api/diarias`, `/api/contratos`, `/api/tags` | CRUD e operacao principal                  |
| Fluxo composto | `/api/clientes-completos`, `/api/clientes-completos/validar`, `/api/diarias/batch`                                   | Orquestracao e ganho operacional           |
| Whatsapp       | `/api/whatsapp/webhook` (GET/POST)                                                                                   | Recepcao e processamento conversacional    |

## 4. Integracao entre camadas e BCs

- API expoe contratos REST e traduz para Application Services
- Application orquestra casos de uso e politicas de dominio
- Domain concentra regras (entidades, eventos e interfaces)
- Infrastructure implementa persistencia, adapters externos e cache
- BC Whatsapp consome Auth/Operacoes via ACL ports para evitar acoplamento direto

## 5. Integracao entre Bounded Contexts

- `Operacoes`: entidades centrais de negocio e regras de diaria/contrato
- `Auth`: contas, tokens e assinatura
- `Whatsapp`: sessao conversacional, consulta operacional e envio de mensagens

## 6. Controle integrado de mudanca

- Mudancas de contrato de API exigem revisao de impacto no frontend e testes de integracao
- Mudancas em regras de dominio exigem revisao de cache invalidation handlers
- Mudancas em integracao externa exigem plano de fallback

### 6.1 Gate minimo para mudancas de integracao

1. Evidencia de impacto em frontend/backend
2. Evidencia de teste (unit/integration ou justificativa)
3. Atualizacao de documentacao tecnica afetada
4. Plano de rollback quando atingir API externa

## 7. Indicadores

- Tempo medio de resolucao de incidentes cross-modulo
- Numero de regressao por quebra de contrato de API
- Taxa de incidentes de integracao por release

## 8. Dependencias externas monitoradas

| Dependencia       | Risco principal                         | Contingencia                                    |
| ----------------- | --------------------------------------- | ----------------------------------------------- |
| Meta WhatsApp API | indisponibilidade ou mudanca de webhook | retry controlado + fila de tratamento           |
| SMTP provider     | falha de entrega de email transacional  | fallback de provedor e monitoramento de bounces |
| PostgreSQL        | indisponibilidade de banco              | healthcheck + restauracao por backup            |
