---
name: git-flow
description: Automatiza o fluxo de trabalho do Git no repositório. Cria novas branches a partir da main de acordo com o tipo de tarefa, faz commits semânticos em lotes, sobe as alterações para o remoto, abre Pull Requests (podendo atribuir revisores automáticos como o Copilot) e realiza loops iterativos para ler comentários de PR e corrigi-los automaticamente.
---

# Git Flow Skill

## Propósito

Esta skill orienta o assistente a conduzir o versionamento de ponta a ponta:
- Criação de ramificações baseadas na \`main\`.
- Realização de commits usando **Conventional Commits**.
- Push para o repositório remoto.
- Criação de Pull Requests (PRs) no GitHub.
- Leitura e resolução iterativa de comentários de Pull Requests (ex: apontamentos do GitHub Copilot e análise do SonarQube).

Use esta skill para padronizar o ciclo de vida das suas alterações no repositório.

---

## PASSO 1 — Criar ou Validar Branch

Quando o usuário pedir para trabalhar numa nova funcionalidade ou correção:

1. Garanta que você está na ramificação base correta (geralmente \`main\`):
   ```bash
   git checkout main && git pull origin main
   ```
2. Crie a nova branch seguindo o padrão abaixo:
   - \`feat/nome-da-funcionalidade\` (para novas features)
   - \`fix/nome-do-bug\` (para correções de bugs)
   - \`chore/nome-da-tarefa\` (para refatorações, atualizações, etc.)
   
   ```bash
   git checkout -b tipo/nome-breve-em-minusculo
   ```

*(Se o usuário já estiver na branch correta, apenas valide e pule este passo).*

---

## PASSO 2 — Commits Semânticos

Ao longo do desenvolvimento ou ao final de uma sessão de trabalho, quando solicitado a fazer commit:

1. Sempre verifique o que foi modificado primeiro usando \`git status\` e \`git diff\`.
2. Adicione os arquivos apropriados com \`git add <arquivos>\`.
3. Faça commits utilizando o padrão de **Conventional Commits**:
   - `feat(escopo): descrição clara e no tempo presente`
   - `fix(escopo): descrição do bug resolvido`
   - `chore(escopo): atualiza dependências ou configs`
   - `test(escopo): adiciona testes faltantes`
   - `refactor(escopo): refatora pedaço de código`

   *Exemplo:* `git commit -m "fix(operacoes): resolver excecao de FK na exclusao do cliente"`

---

## PASSO 3 — Push e Pull Request

Quando o trabalho estiver concluído, os testes estiverem passando, e o usuário pedir para abrir PR:

1. **Suba as alterações para o remoto:**
   ```bash
   git push -u origin <nome-da-branch>
   ```

2. **Gere um resumo para o PR:**
   Baseado no \`task_plan.md\` ou nas anotações de progresso, gere um breve descritivo markdown para o PR explicando o "Por que" e o "O que" foi feito.

3. **Crie o Pull Request via CLI do GitHub:**
   Se a CLI do GitHub (\`gh\`) estiver disponível e autenticada, utilize-a para abrir o PR sem que o usuário precise sair do terminal:
   ```bash
   gh pr create --title "tipo(escopo): Título do PR" --body "## Descrição
   Resolvidos bugs X e Y.
   
   ## Alterações
   - Implementado debounce para evitar HTTP Flood.
   - Refatorado a enum de Status.
   " --base main --reviewer copilot
   ```
   *(Sempre adicione o Copilot como reviewer usando `--reviewer copilot`, ou as labels padrão, para iniciar a revisão da IA. O SonarQube/SonarCloud, se configurado via CI, executará automaticamente).*
   
   *Após a criação do PR, NÃO aguarde o usuário pedir: prossiga imediatamente e de forma autônoma para o PASSO 4, aguardando alguns segundos para que o Copilot e as análises do SonarQube gerem os comentários/resultados.*

---

## PASSO 4 — Auto-Resolução de Reviews de PR (Copilot e SonarQube)

Após abrir o PR e designar o Copilot, execute esta rotina autônoma de análise e resposta:

1. **Verifique o Status do CI e Baixe Comentários:**
   - Verifique se os checks do SonarQube passaram (`gh pr checks`).
   - Baixe os comentários e diffs do PR atual usando o CLI: (ex: `gh api repos/{owner}/{repo}/pulls/{number}/comments`). Isso trará tanto os apontamentos do Copilot quanto os "Code Smells/Vulnerabilities" do SonarQube.
   - Caso o SonarQube não poste comentários mas reprove o check, baixe o log (`gh run view --log`) para identificar a falha.
2. **Avaliação Crítica e Resolução:** 
   - Leia os comentários de revisão (Copilot ou Sonar). Se eles indicarem problemas no código, lógicas erradas, bugs ou melhorias necessárias, **acione imediatamente a skill `bug-workflow`** para planejar e realizar a correção iterativa.
   - Forneça os comentários/logs como contexto para o `bug-workflow`.
3. **Commit e Push das Correções:**
   - Após o `bug-workflow` terminar e as correções passarem, adicione e faça commit das alterações:
   ```bash
   git add .
   git commit -m "fix(review): aplica melhorias sugeridas pelo code review (Copilot/Sonar)"
   git push origin <nome-da-branch>
   ```
4. **Responda/Resolva a Thread:**
   - Como padrão **obrigatório**, utilize o GitHub CLI para adicionar um comentário no PR explicando detalhadamente o que você fez em resposta ao review.
   - Resuma as ações tomadas com base no bot (ex: quais arquivos foram excluídos, lógicas corrigidas ou rejeitadas).
   ```bash
   gh pr comment <number> --body "### Resolução do Code Review
   - **Problema X:** Sugestão aceita e corrigida usando bug-workflow.
   - **Problema Y:** Falso positivo, mantido o código original justificando o motivo técnico na issue."
   ```

## Regras Críticas

### ⚠️ Não faça "git add ." cegamente
Antes de commitar, sempre confira se você não está incluindo arquivos temporários, logs não documentados ou arquivos sensíveis. Adicione de forma granular: \`git add src/...\`.

### ⚠️ A branch base é sagrada
Sempre verifique se a \`main\` está atualizada antes de derivar uma nova branch, para evitar resolver conflitos com históricos desatualizados.

### ⚠️ Validação antes do PR
A skill \`git-flow\` trabalha em conjunto com os workflows de desenvolvimento específicos (ex: \`bounded-context-workflow\`). Certifique-se de que os testes locais (`dotnet test` e `ng build`) passaram antes de sugerir ou automatizar a abertura do PR.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.
