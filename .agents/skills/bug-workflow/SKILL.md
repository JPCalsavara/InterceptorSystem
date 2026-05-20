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

### FASE 1: Investigação e Causa Raiz (Root Cause Analysis)
- **Se não houver `task_plan.md`:** 
  1. Analise o relato do bug ou os logs fornecidos pelo usuário.
  2. Faça uma busca no código (utilize `grep_search` e navegue pela hierarquia de arquivos) para encontrar o ponto de falha.
  3. Crie o `findings.md` documentando claramente o **Porquê** o bug ocorre (ex: "Exceção de null pointer porque o DTO não mapeou o ID do relacionamento").
  4. Crie o `task_plan.md` definindo os passos da correção. **Sempre adicione uma etapa obrigatória de "Adicionar/Atualizar Teste"**.

### FASE 2: Reprodução e Prevenção (Test First)
- **Antes de alterar o código de produção:**
  1. Se aplicável, escreva um Teste Unitário ou de Integração que **reproduza o bug** (ele deve falhar inicialmente).
  2. Utilize a skill `generate-tests` para te apoiar na criação deste teste baseado na estrutura existente.
  3. Rode o teste jogando a saída num log (`dotnet test > temp_test.log`). Leia o erro resumido, confirme que falha pelo mesmo motivo do bug relatado, apague o log temporário e registre o sucesso da reprodução no `progress.md`.

### FASE 3: Correção Cirúrgica (Skill Relacionada: `execute`)
- **Com a falha reproduzida:**
  1. Crie uma branch de correção via `git-flow` (ex: `fix/nome-do-bug`).
  2. Implemente a alteração no código principal conforme o `task_plan.md`.
  3. Faça alterações focadas, evitando mexer em arquivos não relacionados ao bug.
  4. Atualize o `progress.md` e marque a fase de correção com ✅ no `task_plan.md`.

### FASE 4: Validação de Regressão
- **Após aplicar a correção:**
  1. **[TOKEN EFFICIENCY]** Rode a suíte de testes de backend usando redirecionamento para isolar apenas os erros: `dotnet test --logger "console;verbosity=quiet" > temp_test_errors.log`.
  2. Verifique o arquivo temporário (`temp_test_errors.log`) com a tool de view_file para confirmar se o teste da Fase 2 passou.
  3. Faça o Build jogando possíveis erros num log temporário: `ng build > temp_build_errors.log 2>&1`. Se não quebrou nada, tudo certo.
  4. Se algo falhar, anote a causa resumida no `findings.md`, apague os arquivos `temp_*.log` e desfaça ou elabore um novo plano.

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
