---
name: frontend-ui-review
description: Revisa os pull requests e as diffs do frontend Angular com foco estrito em estética, design premium, responsividade, Design Tokens e UX (Micro-interações e Toasts).
---

# Frontend UI Review

## Propósito
Agir como o revisor implacável de estética. O foco é garantir o "Rich Aesthetics" e a responsividade em todos os componentes Angular criados.

## Foco do Review
- **Uso de Tokens SCSS:** Reprove pull requests que utilizem cores chumbadas (ex: `#FF0000`). Exija que as variáveis de cor (ex: `var(--color-primary)`) declaradas no `styles.scss` sejam utilizadas.
- **Responsividade:** Verifique o uso de flexbox, grids e media-queries. Tudo deve quebrar elegantemente para mobile.
- **Micro-Interações:** Exija efeitos de hover (`:hover`), transições (`transition: all 0.3s ease`) em botões, modais e elementos clicáveis.
- **Toasts e Feedback:** O usuário não pode ficar sem saber o que ocorreu. Tudo deve ser reportado de forma amigável e bonita na UI.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.

## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
