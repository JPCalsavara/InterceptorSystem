---
name: frontend-test-workflow
description: Orquestra o ciclo completo de criação e atualização de testes de Frontend (E2E e Componentes) usando Cypress. Passa pelas fases de Análise da UI, Planejamento (task_plan.md), Escrita iterativa dos testes, Validação (Cypress Headless), Versionamento e Code Review.
---

# Cypress Workflow Automation Skill

## Propósito
Esta skill é focada exclusivamente na cobertura de testes do Frontend. Ela segue os passos do `full-workflow` mas é otimizada para identificar elementos na tela, adicionar marcações `data-cy`, escrever os testes no Cypress e validá-los com máxima eficiência de tokens, garantindo que a suíte seja estável e não cause falsos negativos.

## Estrutura de Memória
Toda a memória da sessão DEVE ser persistida em disco usando três arquivos:
- `task_plan.md`: Lista das telas/componentes a testar e os cenários previstos (Caminho Feliz, Validações de Erro, Visual Responsivo).
- `findings.md`: Descobertas e mapeamento, como os seletores DOM adicionados (`data-cy`) e as requisições API que precisam de mock (`cy.intercept()`).
- `progress.md`: O log cronológico (terminal-like) da execução do workflow.

---

## O Ciclo Completo (5 Fases)

Sempre que iniciar ou retomar o fluxo, leia os arquivos de memória acima (se existirem) e identifique em qual das seguintes fases você está:

### FASE 1: Contexto e Planejamento (Skill Relacionada: `plan` / `plan-and-execute`)
- **Se não houver `task_plan.md`:** 
  1. Leia os arquivos alvo no Frontend (HTML e TypeScript dos componentes Angular) para entender as rotas, interações e dados necessários.
  2. Defina os Casos de Teste cobrindo:
     - Navegação Principal (E2E)
     - Tratamento de Falhas (O que ocorre se a API retornar erro)
     - Validação de CSS/Responsividade (Mobile vs Desktop)
  3. Crie os três arquivos (`task_plan.md`, `findings.md`, `progress.md`) quebrando o objetivo em fases gerenciáveis.

### FASE 2: Execução Incremental (Tracer Bullets)
- **Se houver um plano com fases pendentes:**
  1. Crie uma nova branch via `git-flow` (ex: `test/cypress-fluxo-x`) se ainda não estiver nela.
  2. **Regra do TDD (Vertical Slicing):** Não tente escrever todos os testes e todo o código de uma vez. Escolha UM comportamento, escreva UM teste para ele.
  3. **Injeção de Seletores:** Modifique o arquivo `.html` e insira o atributo `data-cy="nome-da-acao"` nos elementos necessários. **Não use classes do Tailwind.**
  4. **Criação do Teste:** Escreva o teste na pasta correspondente. Execute-o no modo de teste ou compilação para vê-lo falhar (RED).
  5. Ajuste a implementação até ele passar (GREEN). 
  6. Repita para o próximo comportamento. Registre o andamento no `progress.md` e marque ✅ no `task_plan.md`.
  7. **Pare e valide**. Não faça 10 testes na mesma iteração.

### FASE 3: Validação em Headless Mode (Skill Relacionada: `generate-tests`)
- **Após implementar os scripts do Cypress:**
  1. Execute os testes no terminal localmente no modo *headless*, direcionando a saída para um arquivo para evitar estourar o limite de tokens do LLM.
     - Comando: `cd frontend && npx cypress run --spec "cypress/e2e/caminho-do-teste.cy.ts" > temp_cypress_errors.log 2>&1`
  2. Utilize ferramentas de pesquisa para procurar falhas no arquivo `temp_cypress_errors.log` (procure por "AssertionError" ou "Failed").
  3. Se houver erro, anote o seletor ou a causa no `findings.md`, apague o `.log` temporário e retorne à Fase 2 para corrigir. 
  4. Se tudo passar, remova o `.log`.

### FASE 4: Versionamento e Pull Request (Skill Relacionada: `git-flow`)
- **Quando todos os testes no plano estiverem passando (Verdes):**
  1. Faça um commit semântico (ex: `test(ui): adiciona e2e para funcionalidade X`).
  2. Dê `git push` na branch.
  3. Abra um Pull Request utilizando o `gh pr create` (ou informe o usuário com a URL para criação do PR), detalhando os cenários que agora possuem cobertura.

### FASE 5: Revisão Final (Skill Relacionada: `code-review`)
- **Após PR Aberto:**
  1. Revise se não foram deixados `cy.wait()` fixos (anti-pattern) ou `.only` no código.
  2. Limpe/Mova os arquivos de plano (`task_plan.md`, `findings.md`, `progress.md`) para `docs/history/tasks/` para que a raiz do repositório continue limpa.

---

## Regras Críticas para Testes no Cypress
1. **Seletores Resilientes:** Use SEMPRE `cy.get('[data-cy="nome"]')`. Se não existir, edite o HTML para adicionar. Evite ao máximo testar acoplado a texto `cy.contains()` a menos que o texto seja a regra vital.
2. **Aliases e Esperas:** Utilize `cy.intercept('GET', '/api/rota').as('getNome')` e `cy.wait('@getNome')` ao invés de usar esperas hardcoded arbitrárias tipo `cy.wait(3000)`.
3. **Respeito ao Token (Token Efficiency):** NUNCA faça dump do log do Cypress no chat. Sempre leia as linhas de erro de dentro do arquivo redirecionado temporário.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.
