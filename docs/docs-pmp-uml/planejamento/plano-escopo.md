# Plano de Escopo do Projeto

**Projeto:** InterceptorSystem
**Data:** 27/04/2026
**Versao:** v3
**Responsavel:** Gerencia do projeto

---

## 1. Objetivo

Definir e controlar o escopo de evolucao do produto e da documentacao de governanca, com criterios claros de inclusao e exclusao.

## 2. Escopo de produto (baseline)

Inclui os dominios e funcionalidades em operacao:

- CRUDs de cliente, funcionario, posto, alocacao, diaria, contrato e tag
- Auth JWT com fluxo de cadastro, login, confirmacao e reset
- Operacoes multi-tenant por `EmpresaId`
- Integracao WhatsApp para fluxos conversacionais de substituicao
- Cache coordenado com invalidacao orientada a eventos

### 2.1 Modulos funcionais de referencia (README)

| Bloco            | Itens incluidos no baseline                                                            |
| ---------------- | -------------------------------------------------------------------------------------- |
| Core Operacional | Clientes, Funcionarios, Postos, Alocacoes, Diarias, Contratos, Tags                    |
| Auth e Conta     | Registro, login, confirmacao de email, reset de senha, gestao de conta e telefone      |
| Whatsapp         | Webhook Meta (GET/POST), sessao conversacional, ranking de substitutos                 |
| Frontend         | Dashboard financeiro, modos Diario/Semanal/Mensal de diarias, Auth Guard + Interceptor |
| Infra            | Docker Compose (db/api/frontend/nginx), CI/CD GitHub Actions                           |

### 2.2 Novos itens de escopo aprovados para planejamento

- Novo container Python no ambiente de infraestrutura para servicos auxiliares (pipeline de IA/visao e processamento de dados)
- Novo caso de uso para captacao/coleta de curriculos (vigias, manutencao e funcoes relacionadas)
- Novo caso de uso para leitura facial em totens de entrada e saida do condominio (controle de acesso)
- Novo módulo de gestão de manutenção do condomínio integrado ao contexto operacional
- Novo módulo para moradores: recebimento de encomendas e reservas/aluguéis de área gourmet
- Novo Dashboard de Analytics Global (visão administrativa para faturamento, custos, lucros, impactos de faltas e consolidação de usuários)

### 2.3 Priorizacao macro por foco de execucao

| Prioridade | Frente                        | Objetivo da entrega                                                   | Complexidade estimada |
| ---------- | ----------------------------- | --------------------------------------------------------------------- | --------------------- |
| P1         | Core Operacional (fechamento) | **Concluído** - Modulo Core operando com fluxos compostos validados E2E | Alta                  |
| P1         | Saida Financeira              | Consolidar fluxo de saida/relatorio financeiro e regras de fechamento | Alta                  |
| P1         | Captacao de Curriculos        | Disponibilizar intake, triagem inicial e armazenamento padrao         | Media                 |
| P1         | Leitura de Totem (Face)       | Validar fluxo de entrada/saida com rastreabilidade e auditoria        | Alta                  |
| P2         | Gestao de Manutencao          | Planejar chamados, fila e acompanhamento por status                   | Media/Alta            |
| P3         | Modulo Moradores              | Entregas e reservas de area gourmet com regras de uso                 | Media                 |

### 2.4 Matriz de complexidade (produto + tecnologia)

| Iniciativa                              | Complexidade | Principais fatores                                                            |
| --------------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| Fechamento Core Operacional             | Alta         | Dependencias entre dominios, consistencia multi-tenant, regressao funcional   |
| Saida Financeira                        | Alta         | Regras de negocio sensiveis, auditoria de calculo, impacto contratual         |
| Captacao de Curriculos                  | Media        | Novo fluxo de dados, LGPD, triagem por perfil/cargo                           |
| Leitura facial em totem                 | Alta         | Integracao com hardware, biometria/privacidade, disponibilidade em tempo real |
| Gestao de manutencao                    | Media/Alta   | Orquestracao de processos e SLA por tipo de chamado                           |
| Modulo moradores (encomendas e gourmet) | Media        | Novos perfis de usuario, agenda, politicas e notificacoes                     |

## 3. Escopo desta fase documental

- Manter 12 planos PMI aderentes ao sistema real
- Garantir rastreabilidade com arquitetura, endpoints e testes
- Preparar base para UML em `.png`

## 4. Fora do escopo da fase

- Reescrita completa de backlog de produto
- Redesenho de arquitetura de dados
- Migracao de provedores externos sem business case

### 4.1 Fora do escopo imediato (backlog README)

- Implementacao de testes E2E com Playwright
- Integracao Redis como cache L2
- Rate limiting e evolucoes de observabilidade
- Modulo financeiro completo com exportacao PDF

### 4.2 Fora do escopo imediato desta nova expansao

- Automatizacao completa com reconhecimento facial em producao sem piloto controlado
- Integracao com sistemas externos de portaria sem homologacao tecnica e juridica
- Aplicativo mobile dedicado para moradores (fase posterior)

## 5. EAP simplificada

| ID  | Entrega                | Resultado esperado                                                                                         |
| --- | ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Baseline de governanca | Charter e plano de gestao atualizados                                                                      |
| 2   | Planos subsidiarios    | Integracao, escopo, cronograma, custos, qualidade, recursos, comunicacao, riscos, stakeholders, aquisicoes |
| 3   | Preparacao UML         | backlog e convencoes de diagramas                                                                          |

## 6. Criterios de aceite

- Coerencia entre os 12 arquivos
- Referencias tecnicas condizentes com codigo e CI
- Ausencia de contradicoes com `README.md`
- Priorizacao P1/P2/P3 explicita e aceita pelos stakeholders
- Complexidade registrada por iniciativa com premissas tecnicas minimas

## 7. Matriz de rastreabilidade de escopo

| Item README                                                     | Plano que governa                                              |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| DDD com 3 Bounded Contexts                                      | `plano-integracao.md`, `plano-qualidade.md`                    |
| CRUD + fluxos compostos (`clientes-completos`, `diarias/batch`) | Validado 100% via Cypress E2E (`simulacao-visual.cy.ts`)       |
| Auth/SaaS/Conta                                                 | `plano-integracao.md`, `plano-riscos.md`                       |
| WhatsApp Bot + webhooks                                         | `plano-integracao.md`, `plano-riscos.md`                       |
| Docker Compose + CI/CD                                          | `plano-cronograma.md`, `plano-custos.md`, `plano-qualidade.md` |

## 8. Roadmap orientado por foco inicial

| Onda   | Horizonte         | Entregas foco                                              | Resultado esperado                                           |
| ------ | ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| Onda 1 | Curto prazo       | Core operacional + saida financeira                        | Base estavel de operacao e fechamento financeiro consistente |
| Onda 2 | Curto/medio prazo | Captacao de curriculos + piloto de leitura facial em totem | Novos fluxos de pessoas com governanca e rastreabilidade     |
| Onda 3 | Medio prazo       | Gestao de manutencao + modulo moradores                    | Expansao de servicos condominiais orientada a produtividade  |
