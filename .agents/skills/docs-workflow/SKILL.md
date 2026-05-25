---
name: docs-workflow
description: Orquestra a revisão, criação e atualização de documentações do projeto (PMI, README, Arquitetura), garantindo alinhamento de escopo, formatação e tom profissional.
---

# Docs Workflow Automation Skill

## Propósito
Esta skill é especializada na gestão de documentos e artefatos de planejamento (como PMI, Project Charter, EAP, READMEs e Arquitetura). Ao invés de compilar código, o foco aqui é a **coerência**, **formatação Markdown perfeita** e **alinhamento de escopo do projeto**.

## Estrutura de Memória
A sessão é persistida usando três arquivos (padrão de eficiência de tokens):
- `task_plan.md`: Os passos de atualização documental (ex: 1. Atualizar Charter, 2. Atualizar EAP).
- `findings.md`: Regras de formatação identificadas, siglas importantes usadas (ex: RBAC) e impactos cruzados.
- `progress.md`: O log cronológico do que foi alterado.

---

## O Ciclo de Documentação (4 Fases)

Sempre que invocado para atualizar documentos, siga estas fases:

### FASE 1: Leitura de Contexto e Impacto Cruzado
- **Se não houver `task_plan.md`:** 
  1. Identifique o documento alvo na pasta de documentos reais do projeto (`docs/docs-pmp-uml`).
  2. **Regra de Template:** Se precisar criar ou reescrever algo, SEMPRE consulte a pasta `docs/docs-pmi-base` para extrair o modelo (template) e a estrutura exigida. NUNCA altere os arquivos da pasta `docs-pmi-base`, pois eles são apenas moldes.
  3. Leia o documento alvo e pesquise documentos relacionados. (Ex: Se for alterar o Escopo no `charter.md`, é provável que precise alterar o documento de Requisitos ou EAP).
  4. Identifique o **tom de voz** (acadêmico, técnico ou executivo).
  5. Crie os arquivos de memória (`task_plan.md`, `findings.md`, `progress.md`).

### FASE 2: Redação e Atualização (Drafting)
- **Se houver um plano com fases pendentes:**
  1. Crie uma branch via `git-flow` (ex: `docs/atualizacao-charter`).
  2. Modifique o documento alterando as linhas precisas.
  3. Garanta formatação Markdown impecável: tabelas alinhadas, listas (bullet points) padronizadas e hierarquia de títulos (`#`, `##`, `###`) estritamente respeitada.
  4. Marque a fase como ✅ no `task_plan.md` e registre no `progress.md`.

### FASE 3: Revisão de Qualidade (Self-Review)
- **Antes de fechar a tarefa:**
  1. Releia as alterações feitas usando o comando de diff do git (`git diff`).
  2. O crivo de qualidade exige verificar:
     - O texto tem erros gramaticais ou de concordância?
     - Se o escopo/tempo mudou em um documento, essa mudança gerou contradição em outro documento recém lido?
  3. Se houver falhas, volte à Fase 2.

### FASE 4: Versionamento (git-flow)
- **Quando os documentos estiverem aprovados:**
  1. Faça commit das alterações utilizando estritamente o prefixo `docs(escopo): ...` (Ex: `docs(pmi): atualiza escopo do projeto no charter`).
  2. Dê `git push` na branch atual.
  3. Abra o Pull Request detalhando as motivações das mudanças textuais (o "Por que" essa documentação mudou).
  4. Limpe ou arquive os arquivos temporários de planejamento.

---

## Regras Críticas para Documentação
1. **Mantenha a Formatação:** Ao substituir texto, tenha o máximo cuidado para não destruir a estrutura de tabelas Markdown ou quebrar links internos existentes.
2. **Glossário e Contexto:** Lembre-se do contexto global de negócio da aplicação (ex: Nomes de clientes, siglas corporativas/universitárias) e **nunca** invente regras que não estejam alinhadas ao que foi validado com os Stakeholders.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.
