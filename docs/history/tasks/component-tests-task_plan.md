# Task Plan: Cobertura Completa de Testes Cypress (E2E + Component)

## Objetivo
Criar uma rede de segurança de testes para **todo** o frontend Angular. Como o frontend é gerado por IA, os testes são a garantia de que regressões serão capturadas imediatamente.

---

## Inventário de Componentes (46 total)

### Cobertura Atual (3 component tests + 2 E2E)
- ✅ `conta-alterar-senha.component.cy.ts`
- ✅ `action-card.component.cy.ts`
- ✅ `email-verification-banner.component.cy.ts`
- ✅ `critical-journeys-v2.cy.ts` (E2E)
- ✅ `full-crud-journey.cy.ts` (E2E)

### Falta Cobertura (43 componentes)

---

## Fases de Execução

### Lote 1: Componentes Compartilhados (shared/) — Prioridade Alta
Esses são usados por muitas páginas. Um bug aqui impacta todo o sistema.
- [x] `shared/components/diarias-view/diarias-view.component.cy.ts`
- [x] `shared/components/tag-picker/tag-picker.component.cy.ts`

### Lote 2: Layout/Core — Prioridade Alta
Navbar, Sidebar e Shell são o "esqueleto" do sistema. Responsividade é crítica aqui.
- [x] `core/layout/navbar.component.cy.ts`
- [x] `core/layout/sidebar.component.cy.ts`
- [x] `core/layout/app-shell.component.cy.ts`

### Lote 3: Páginas Públicas (Login, Cadastro, Landing) — Prioridade Alta
Primeira impressão do usuário. Devem funcionar perfeitamente.
- [x] `pages/login/login.component.cy.ts`
- [x] `pages/cadastro/cadastro.component.cy.ts`
- [x] `pages/landing/landing.component.cy.ts`
- [x] `pages/esqueci-senha/esqueci-senha.component.cy.ts`
- [x] `pages/nova-senha/nova-senha.component.cy.ts`
- [x] `pages/verificar-email/verificar-email.component.cy.ts`

### Lote 4: Dashboard e Perfil — Prioridade Média
- [x] `pages/dashboard/dashboard.component.cy.ts`
- [x] `pages/conta/conta.component.cy.ts`
- [x] `pages/perfil/perfil.component.cy.ts`
- [x] `pages/plano/plano.component.cy.ts`
- [x] `features/perfil/perfil-page/perfil-page.component.cy.ts`
- [x] `features/suporte/suporte-page/suporte-page.component.cy.ts`

### Lote 5: Feature Clientes (CRUD completo) — Prioridade Alta
- [x] `features/clientes/cliente-list/cliente-list.component.cy.ts`
- [x] `features/clientes/cliente-form/cliente-form.component.cy.ts`
- [x] `features/clientes/cliente-detail/cliente-detail.component.cy.ts`
- [x] `features/clientes/cliente-wizard/cliente-wizard.component.cy.ts`
- [x] `features/clientes/clientes.component.cy.ts`

### Lote 6: Feature Contratos — Prioridade Alta
- [x] `features/contratos/contrato-list/contrato-list.component.cy.ts`
- [x] `features/contratos/contrato-form/contrato-form.component.cy.ts`
- [x] `features/contratos/contrato-detail/contrato-detail.component.cy.ts`
- [x] `features/contratos/contratos.component.cy.ts`

### Lote 7: Feature Funcionários — Prioridade Alta
- [x] `features/funcionarios/funcionario-list/funcionario-list.component.cy.ts`
- [x] `features/funcionarios/funcionario-form/funcionario-form.component.cy.ts`
- [x] `features/funcionarios/funcionario-detail/funcionario-detail.component.cy.ts`
- [x] `features/funcionarios/funcionarios.component.cy.ts`

### Lote 8: Feature Postos — Prioridade Média
- [x] `features/postos/posto-list/posto-list.component.cy.ts`
- [x] `features/postos/posto-form/posto-form.component.cy.ts`
- [x] `features/postos/posto-detail/posto-detail.component.cy.ts`
- [x] `features/postos/postos.component.cy.ts`

### Lote 9: Feature Alocações — Prioridade Média
- [x] `features/alocacoes/alocacao-list/alocacao-list.component.cy.ts`
- [x] `features/alocacoes/alocacao-form/alocacao-form.component.cy.ts`
- [x] `features/alocacoes/alocacao-detail/alocacao-detail.component.cy.ts`

### Lote 10: Feature Diárias — Prioridade Média
- [x] `features/diarias/diaria-list/diaria-list.component.cy.ts`
- [x] `features/diarias/diaria-form/diaria-form.component.cy.ts`
- [x] `features/diarias/diaria-batch-form/diaria-batch-form.component.cy.ts`
- [x] `features/diarias/diaria-detail/diaria-detail.component.cy.ts`

### Lote 11: Feature Tags — Prioridade Baixa
- [x] `features/tags/tag-list/tag-list.component.cy.ts`

---

## Fase Futura: Refatoração e Componentização
Após a conclusão dos testes de componentes base, o código será refatorado para extrair lógicas e templates densos em componentes menores (Smart/Dumb components), utilizando as suítes Cypress que acabamos de criar como garantia anti-regressão.

## Fase Futura: Testes E2E Fim-a-Fim (Páginas e Fluxos)
Após a estabilização da arquitetura e dos componentes, novos testes E2E (`.cy.ts` na pasta `cypress/e2e/`) serão expandidos para mapear todas as jornadas de negócio e garantir o fluxo de dados real de ponta a ponta.

---

## Padrão de Teste (generate-tests skill)
Cada component test DEVE:
1. **Viewport Desktop (1024px):** Testar layout, presença de elementos, estado inicial.
2. **Viewport Mobile (320px):** Testar responsividade (flex-direction, overflow, botão 100%).
3. **Estado de Loading:** Se o componente usa `loading()`, testar o spinner.
4. **Estado Vazio:** Se o componente tem empty state, testar a mensagem.
5. **Interação Básica:** Testar @Output events e botões principais.

## Estratégia de Execução via Terminal
```bash
# Rodar component tests headless
cd frontend && npx cypress run --component

# Rodar E2E tests headless (com backend/compose rodando)
cd frontend && npx cypress run --e2e
```
