# Findings: Quick Fixes Prod Version

## 0. 🔴 [BUG CRÍTICO] Erro FK ao criar Posto de Trabalho

**Erro em produção:**
```
Npgsql.PostgresException 23503: insert or update on table "Postos" violates foreign key constraint "FK_Postos_Contratos_ContratoId"
```

**Causa raiz identificada (multicamadas):**
- O domínio `Posto.cs` tem `ContratoId` como campo **obrigatório** no construtor (linha 29: `Guid contratoId`).
- Existe uma migration `AddContratoIdToPosto` que adicionou a FK `FK_Postos_Contratos_ContratoId` no banco.
- O `CreatePostoInput` DTO **não possui o campo `ContratoId`** — só tem `ClienteId`.
- O `PostoAppService.CreateAsync` passa `empresaId` onde deveria estar `contratoId` na chamada `new Posto(clienteId, empresaId, ...)` → salva um Guid de empresa no lugar do ContratoId, quebrando a FK.
- O `posto-form.component.ts` (frontend) também não tem campo de seleção de contrato no formulário.

**Correção necessária:**
1. Adicionar `Guid ContratoId` ao `CreatePostoInput`.
2. Corrigir `PostoAppService.CreateAsync` para usar `input.ContratoId` e não `empresaId` na posição errada.
3. Adicionar dropdown de contrato (filtrado pelo cliente selecionado) no `posto-form.component.html/ts`.
4. O formulário de posto deve buscar `GET /api/clientes/{clienteId}/contratos` ao mudar o cliente.

**Arquivos afetados:**
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/DTOs/PostoDto.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/PostoAppService.cs`
- `frontend/src/app/features/postos/posto-form/posto-form.component.ts`
- `frontend/src/app/features/postos/posto-form/posto-form.component.html`

---

## 1. Mapeamento de Risco: Transação do Orquestrador
Ao adicionar a criação de funcionários no `ClienteOrquestradorService`, precisamos garantir que o `ContratoId` recém-criado seja repassado para cada funcionário antes da inserção no banco. Além disso, se a inserção de um funcionário falhar, o rollback da transação (que já deve estar no orquestrador) precisa reverter o Cliente, Contrato e Postos criados anteriormente.

## 2. Dependência de Payload: Cliente-Completo
O endpoint `/api/clientes-completos` hoje espera apenas cliente, contrato e config de postos. A interface TypeScript no frontend correspondente (`CriarClienteCompletoInput`) precisará de uma nova propriedade opcional `funcionarios` contendo os dados formados no Step 3 do wizard.

## 3. Sidebar Refresh
A atualização dos `counts` no `SidebarComponent` atualmente faz N chamadas de API disparadas no `ngOnInit`. Uma nova chamada de `refresh` via um novo service de sincronização (`AppSyncService`) vai gerar as mesmas N chamadas de API simultaneamente, o que é aceitável, mas pode ser otimizado futuramente. Precisaremos injetar esse novo service em todos os lugares onde criamos/deletamos entidades (formulários e actions).

## 4. Fallback para Simulação de Valores
A conversão do input de cálculo real (`CalculoValorTotalInput`) para simulação (`SimulacaoFinanceiraMensalInput`) requer que o frontend obtenha dados como `DiasUteisMes`, `DiasFimSemanaMes` e `FeriadosAno`. Será necessário usar valores padrões (22, 8, etc.) ou buscar esses dados de um helper local (como o `DIAS_UTEIS_PADRAO` do `contrato-calculo.helper.ts`) para compor o payload de simulação no caso das diárias serem nulas/zero no início da configuração do wizard.
