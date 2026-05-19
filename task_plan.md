# Task Plan: Quick Fixes Prod Version

**Objetivo:** Implementar correções rápidas para o ambiente de produção: criação de funcionários junto com o cliente/contrato no wizard, exibição de simulação financeira ao invés de erro quando não há diárias, e atualização reativa (real-time) da sidebar ao criar novas entidades.
**Branch:** atual
**Data de início:** 2026-05-19

---

## Fases

| # | Fase | Arquivos Afetados | Status |
|---|------|-------------------|---------|
| 1 | 🔴 **[CRÍTICO] Erro FK ao criar Posto de Trabalho** | `backend/.../DTOs/PostoDto.cs` (CreatePostoInput), `backend/.../Services/PostoAppService.cs`, `frontend/.../posto-form/posto-form.component.ts` | ✅ Concluído |
| 2 | Atualização da Sidebar (Reatividade) | `frontend/.../core/services/app-sync.service.ts` (novo), `frontend/.../core/layout/sidebar.component.ts` e demais forms que criam entidades | ✅ Concluído |
| 3 | Exibição de Relatório Simulado no Cliente-Wizard | `frontend/.../clientes/cliente-wizard/cliente-wizard.component.ts` | ⏳ Pendente |
| 4 | Backend: Orquestrar Criação de Funcionários | `backend/.../DTOs/CreateClienteCompletoDtoInput.cs`, `backend/.../Services/ClienteOrquestradorService.cs` | ⏳ Pendente |
| 5 | Frontend: Passar Funcionários no Payload do Wizard | `frontend/.../services/cliente-completo.service.ts`, `frontend/.../cliente-wizard/cliente-wizard.component.ts` | ⏳ Pendente |
| 6 | Build e validação | — | ⏳ Pendente |

---

## Decisões Técnicas
- **Reatividade da Sidebar:** Será criado um serviço singleton `AppSyncService` com um `Subject` ou `Signal` para emitir eventos de atualização global sempre que uma nova entidade for criada. O `SidebarComponent` ouvirá este evento para disparar as rotinas de `ngOnInit()` novamente, recarregando as contagens (semelhante ao `useEffect` observando dependências no React).
- **Simulação vs Erro:** No `cliente-wizard.component.ts`, durante o `setupAutoCalculo`, será verificado se o `input.diariasTotaisMes <= 0`. Se for, o componente mapeará os dados para um input de simulação (`SimulacaoFinanceiraMensalInput`) e chamará `simular-sem-alocacoes` ao invés de `calcular-valor-total`, evitando o erro 400 do backend.
- **Funcionários no Wizard:** Para evitar falhas onde a criação do funcionário exige um contrato já persistido (mas na UI é feito tudo de uma vez), vamos adicionar os funcionários ao `CreateClienteCompletoDtoInput` e processá-los na mesma transação no backend através do `ClienteOrquestradorService`.

## Bloqueios e Riscos
Veja `findings.md` para riscos mapeados.
