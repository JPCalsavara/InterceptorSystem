---
name: bug-workflow
description: Orquestra o ciclo otimizado para resolução de bugs (End-to-End). Passa pelas fases de Investigação (Root Cause), Planejamento (task_plan.md), Correção iterativa, Prevenção de Regressão (Testes) e Versionamento (git-flow/PR).
---

# Bug Workflow Automation Skill

## Propósito
Esta skill é o "investigador e executor" para a resolução de problemas críticos e bugs. Ao contrário do fluxo de features, o foco aqui é a identificação da causa raiz (Root Cause Analysis), criação de testes de reprodução (para evitar regressão) e uma correção cirúrgica baseada nos princípios da arquitetura.

## Estrutura de Memória
A sessão é persistida em disco usando três arquivos:
- `task_plan.md`: Os passos para a reprodução e correção do bug.
- `findings.md`: Onde a "Causa Raiz" (Root Cause), o impacto e o log de erros serão detalhadamente documentados.
- `progress.md`: O log cronológico do que foi tentado (para não ficar em loop no mesmo erro).

---

## O Ciclo de Resolução (5 Fases)

Sempre que iniciar ou retomar o fluxo, leia os arquivos de memória acima (se existirem) e aja de acordo com a fase atual:

### FASE 1: Diagnóstico e Construção de Feedback Loop
- **Se não houver `task_plan.md`:** 
  1. Analise o relato do bug ou os logs fornecidos pelo usuário.
  2. **[OBRIGATÓRIO]** Construa um loop de feedback rápido e determinístico antes de supor qualquer coisa (Teste de Integração, Curl script, Playwright, Bisection Harness). Acelere esse loop ao máximo. Se for não-determinístico (flaky), injete logs/stress até ele falhar confiavelmente.
  3. Formule **3-5 hipóteses testáveis e falsificáveis** (Ex: "Se for cache, limpar cache antes fará passar"). Não pule essa etapa de ranking.
  4. Instrumente variáveis isoladas para testar cada hipótese. Use `[DEBUG-tag]` nos logs para limpeza fácil depois.
  5. Crie o `findings.md` documentando claramente o **Porquê** o bug ocorre.
  6. Crie o `task_plan.md` definindo os passos da correção. **Sempre adicione uma etapa obrigatória de "Adicionar/Atualizar Teste (Seam Correto)"**.

### FASE 2: Reprodução e Prevenção (Test First)
- **Antes de alterar o código de produção:**
  1. Transforme o reprodutor da Fase 1 em um Teste automatizado na camada ("seam") apropriada, onde o bug realmente vive. Se não houver costura, anote isso no findings.
  2. Utilize a skill `generate-tests` para te apoiar na criação deste teste baseado na estrutura existente.
  3. Rode o teste jogando a saída num log (`dotnet test > temp_test.log`). Leia o erro resumido, confirme que falha pelo mesmo motivo do bug relatado, apague o log temporário e registre o sucesso da reprodução no `progress.md`.

### FASE 3: Correção Cirúrgica (Skill Relacionada: `execute`)
- **Com a falha reproduzida:**
  1. **[OBRIGATÓRIO]** Crie uma branch de hotfix a partir da `main`. **NUNCA commite direto na main** — ela está protegida e requer CI/CD via PR:
     ```bash
     git checkout main && git pull
     git checkout -b hotfix/nome-do-bug
     ```
  2. Implemente a alteração no código principal conforme o `task_plan.md`.
  3. Faça alterações focadas, evitando mexer em arquivos não relacionados ao bug.
  4. Atualize o `progress.md` e marque a fase de correção com ✅ no `task_plan.md`.

### FASE 4: Validação de Regressão (Suíte Completa)
- **Após aplicar a correção, execute a validação em cascata, parando ao primeiro erro:**

  #### 4.1 — Backend (Unitários + Integração)
  ```bash
  cd backend/src
  dotnet test --logger "console;verbosity=quiet" > ../../temp_backend_test.log 2>&1
  ```
  Leia o log resumido para confirmar que o teste da Fase 2 passou e que nenhum outro quebrou.

  #### 4.2 — Frontend: Build de Produção
  ```bash
  cd frontend
  npm run build -- --configuration=production > ../temp_build.log 2>&1
  ```
  Confirma que os arquivos `.cy.ts` não estão contaminando o build.

  #### 4.3 — Frontend: Testes Unitários (Vitest)
  ```bash
  cd frontend
  npm run test:ci > ../temp_unit_test.log 2>&1
  ```
  Valida os specs `.spec.ts` de todos os componentes/serviços.

  #### 4.4 — Frontend: Cypress Component Tests (Responsividade)
  ```bash
  cd frontend
  npm run test:component > ../temp_component_test.log 2>&1
  ```
  Valida visualmente que nenhuma media query ou layout CSS quebrou.

  #### 4.5 — Frontend: E2E (Jornadas Críticas) ⚠️ Requer app rodando
  ```bash
  # Pré-requisito: docker compose up -d (ambiente local)
  cd frontend
  npm run test:e2e > ../temp_e2e_test.log 2>&1
  ```
  Roda as jornadas de usuário end-to-end. Execute apenas se o ambiente Docker estiver ativo.

  - **Se qualquer fase falhar:** Anote a causa no `findings.md`, apague todos os `temp_*.log` e retorne para a Fase 3.

### FASE 5: Versionamento e Code Review (Skills Relacionadas: `git-flow`, `code-review`)
- **Quando o bug estiver resolvido e testes passando:**
  1. Faça commit das alterações utilizando prefixo `fix(escopo): ...`.
  2. Dê `git push` na branch atual.
  3. Abra o Pull Request (via GitHub CLI `gh pr create`) descrevendo a "Causa Raiz" (busque no `findings.md`) e a "Solução Aplicada".
  4. Rode a skill `code-review` no diff da branch para ter certeza de que a correção não introduziu vulnerabilidades.
  5. Limpe os arquivos temporários movendo-os para `docs/history/tasks/` como post-mortem do bug.

---

## Regras Críticas para o Agente em Bugs
1. **Pense antes de codar:** Em bugs, ler logs e mapear dependências demora mais que escrever código. Não pule a Fase 1.
2. **Reprodução é a Prova:** A ausência de falha não garante que o bug foi corrigido, por isso a Fase 2 (Test First) é mandatória sempre que for tecnicamente possível.
3. **Limite as saídas (Logs Curtos):** Ao testar ou compilar, NUNCA puxe o output inteiro pro seu contexto. Jogue os logs de erro num `.log` temporário, leia, anote o principal no `findings.md` e apague o log em seguida.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.
