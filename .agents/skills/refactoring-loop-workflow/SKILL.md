---
name: refactoring-loop-workflow
description: Orquestra um ciclo fechado de refatoração, testagem e depuração para frontend. Ele planeja, refatora, executa testes de componente e E2E, analisa os erros (debug) e corrige repetidamente até sucesso absoluto.
---

# Refactoring Loop Workflow

## Propósito
Esta skill garante que as refatorações arquiteturais no Frontend ou Backend não introduzam regressões visuais, estruturais ou falhas de Cypress. O agente deve entrar em um "loop ininterrupto" de refatorar, testar, debugar erros e reescrever código, até que o build e todos os testes (E2E e Componentes) passem completamente, sem exigir intervenção constante do usuário a cada erro.

## Integrações
- Delega análise e planejamento de refatoração estrutural (Angular) para o **frontend-refactoring**.
- Delega testes Cypress para **frontend-test-workflow**.
- Delega commits e PRs para o **git-flow** somente APÓS a conclusão com sucesso do ciclo.
- Delega diagnóstico de erros em cascata para **diagnose** ou **bug-workflow**.

## Passos de Execução
1. **Planejamento da Refatoração (`task_plan.md`):** Entenda o escopo do problema relatado ou da arquitetura que precisa ser refatorada. Documente um plano de ação estrito.
2. **Execução Inicial:** Aplique a refatoração proposta (ex: extração de Dumb Components, correção de CSS, migração de regras).
3. **Loop de Testes (O Coração da Skill):**
   - Execute o build do projeto (ex: `npm run build`).
   - Execute a suíte de testes relevante em modo *headless* (ex: `npm run test:e2e` ou `npx cypress run --component`).
   - **SE OCORRER ERRO:** NÃO PARE para perguntar ao usuário.
     1. Analise o output do terminal, leia screenshots do Cypress ou inspecione o HTML problemático gerado.
     2. Diagnostique a causa (ex: "CSS quebrou", "filtro de máscara não aplica", "intercept faltando").
     3. Aplique a correção no código.
     4. Volte imediatamente para o início do **Passo 3** (Re-build e Re-test).
4. **Validação Final:** Somente quando TODOS os comandos de build e testes passarem com código de saída `0`, você deve sair do ciclo.
5. **Versionamento:** Chame a skill `git-flow` para commitar e salvar o sucesso da operação.

## Regras Críticas (Guardrails)
- **Autonomia Total:** Durante o loop de erros, o agente NUNCA deve devolver a bola para o usuário pedindo "O que acha disso?". O agente só se comunica com o usuário caso o loop atinja mais de 5 tentativas malsucedidas de resolver o MESMO erro exato.
- **Respeito aos Componentes:** Ao refatorar CSS ou formulários, mantenha os identificadores (`data-cy`, IDs) intocados para não quebrar testes indevidamente.
- **Foco em UI/UX:** A refatoração não pode degradar estilos visuais. Caso máscaras ou validações parem de funcionar (ex: campos esverdeados indevidamente), identifique no CSS ou Reactive Forms onde ocorreu a falha e reverta para a qualidade anterior.
