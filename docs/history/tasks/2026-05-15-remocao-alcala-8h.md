# Task Plan: Remoção de ALCALA_8H → OITO_HORAS_SEIS_POR_DOIS

**Objetivo:** Remover completamente `ALCALA_8H` do codebase, substituindo por `OITO_HORAS_SEIS_POR_DOIS` onde necessário e limpando referências nos documentos de histórico.

**Branch:** `chore/docs-cleanup-and-reorg`

---

## Status

| Fase | Descrição | Status |
| ---- | --------- | ------ |
| 1 | Enum Backend (TipoEscala.cs) | ✅ Concluído (usuário) |
| 2 | Frontend Models (index.ts) | ✅ Concluído (usuário) |
| 3 | Frontend Component (cliente-detail) | ✅ Concluído (usuário) |
| 4 | Backend: ClienteOrquestradorService.cs | ✅ Concluído |
| 5 | Frontend: contrato-form, alocacao-form, alocacao-detail, alocacao-list, diaria-batch-form, funcionario-form, funcionario-list | ✅ Concluído |
| 6 | Testes: AdicionalNoturnoTests.cs | ✅ Concluído |
| 7 | Documentação: README.md, analise_regras_negocio.md | ✅ Concluído |
| 8 | EF Migration (se necessário) | ✅ Concluído |
| 9 | Build e testes | ✅ Concluído |

---

## Arquivos com referências a ALCALA_8H

### Backend (.cs)
- `ClienteOrquestradorService.cs` — 5 ocorrências (TipoEscala.ALCALA_8H + mapeamento "ESCALA_8H_3TURNOS")
- `AdicionalNoturnoTests.cs` — 1 ocorrência (linha 100: tipoEscala: TipoEscala.ALCALA_8H)

### Frontend (.ts)
- `contrato-form.component.ts` — 1 ocorrência (mapeamento TipoPosto)
- `alocacao-form.component.ts` — 1 ocorrência (lista de opções de select)
- `alocacao-detail.component.ts` — 1 ocorrência (label de exibição)
- `alocacao-list.component.ts` — 1 ocorrência (label de exibição)
- `diaria-batch-form.component.ts` — 1 ocorrência (lógica condicional)
- `funcionario-form.component.ts` — 1 ocorrência (select de tipo de escala)
- `funcionario-list.component.ts` — 1 ocorrência (label de exibição)

### Docs (.md)
- `README.md` — Enums table (verificar se ainda referencia ALCALA_8H)
- `docs/refactory/domain-refactoring-plan.md` — histórico
- `docs/refactory/domain-refactoring-tasks.md` — histórico (checklist)
- `docs/guias/analise_regras_negocio.md` — análise de regras

---

## Decisões

- **Substituição:** `ALCALA_8H` → `OITO_HORAS_SEIS_POR_DOIS` em todo código ativo
- **Label UI:** `'Alcalá 8h'` / `'8 Horas (Diário)'` → `'8h (6x2)'`
- **Docs históricos:** Manter como contexto histórico, sem alterar
- **Migration:** O enum no C# é numérico; o valor que era `ALCALA_8H = 2` agora `FOLGUISTA = 2`, e `OITO_HORAS_SEIS_POR_DOIS = 3`. Verificar se há dados existentes no banco que precisam de atualização.
