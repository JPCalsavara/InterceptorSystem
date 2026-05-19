# Task Plan: Correções Parte 3

**Objetivo:** Corrigir dois comportamentos apontados:
1. Exibir o relatório simulado caso o contrato não possua diárias (400 `Diárias totais deve ser maior que zero`) no componente `ContratoDetail`.
2. O erro 500 ao excluir clientes é na verdade um `DbUpdateException` não devidamente capturado pela verificação de FK no `ApplicationDbContext`, resultando em 500 ao invés do 409 (Conflito).

**Branch:** fix/quick-fixes-prod
**Data de início:** 2026-05-19

---

## Fases

| # | Fase | Arquivos Afetados | Status |
|---|------|-------------------|--------|
| 1 | Tratamento Case-Insensitive para Exceção FK Postgres | `backend/src/InterceptorSystem.Infrastructure/Persistence/Contexts/ApplicationDbContext.cs` | ✅ Concluído |
| 2 | Exibir simulação no erro 400 do ContratoDetail | `frontend/src/app/features/contratos/contrato-detail/contrato-detail.component.ts` | ✅ Concluído |
| 3 | Build e validação | — | ✅ Concluído |

---

## Decisões Técnicas
- **Fase 1:** A verificação `current.Message.Contains("FOREIGN KEY")` atual é _case-sensitive_. Como o Postgres retorna a mensagem em minúsculas (`foreign key constraint`), a checagem falha e o sistema lança um erro 500. Vamos alterar para `StringComparison.OrdinalIgnoreCase` ou testar `SqlState`.
- **Fase 2:** No `ContratoDetailComponent`, assim como fizemos no `ClienteWizard`, se o cálculo real com alocações falhar por falta de diárias ou afins, devemos disparar automaticamente a simulação `simularSemAlocacoes` dentro do bloco `error` da requisição original para popular a UI com o painel simulado.

## Bloqueios e Riscos
- Sem bloqueios técnicos.
