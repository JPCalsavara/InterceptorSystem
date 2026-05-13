# Análise Detalhada dos 8 Erros de Teste

## 📊 Resumo Executivo

- **Total de Erros**: 8
- **Erros de Lógica**: 5 (cálculos financeiros)
- **Erros de Design**: 2 (fire-and-forget em testes síncronos)
- **Erros de Teste**: 1 (assertion incorreta)

---

## 🔴 ERRO 1: CalcularValorTotal_DeveCalcularCustoDiretoERetornarBreakdownCompleto

**Tipo**: ❌ **ERRO DE LÓGICA NO SERVICE** (Crítico)  
**Arquivo**: `ContratoCalculoService.cs` / `ContratoCalculoHelper.cs`  
**Expected**: 2691  
**Actual**: 2957,14  
**Diferença**: 266,14 (+9.8%)

### Causa Raiz

A fórmula de cálculo de faturamento em `CalcularFaturamentoEMargens` está INCORRETA:

```csharp
// ❌ IMPLEMENTAÇÃO ERRADA (atual)
var faturamento = custoBaseMensal / (1m - somaMargens);  // Usa fórmula de markup

// ✅ IMPLEMENTAÇÃO CORRETA (esperada)
var faturamento = custoBaseMensal +
                  (custoBaseMensal * margemLucro) +
                  (custoBaseMensal * margemFaltas);  // Fórmula aditiva simples
```

### Explicação

O código está usando a fórmula de **markup reverso** (quando margens são percentual do faturamento), mas deveria usar a fórmula **aditiva** (quando margens são percentual do custo base).

**Exemplo com dados do teste**:

```
custoBaseMensal = 2070
margemLucro = 0.20 (20%)
margemFaltas = 0.10 (10%)

❌ FÓRMULA ATUAL: 2070 / (1 - 0.30) = 2070 / 0.70 = 2957,14
✅ FÓRMULA CORRETA: 2070 + (2070 × 0.20) + (2070 × 0.10) = 2070 + 414 + 207 = 2691
```

**Impacto**: Este erro afeta TODOS os testes de cálculo (#1, #6, #7, #8)

---

## 🔴 ERRO 2: CreateBatchAsync_ComFuncionarioInexistente_DeveFalhar

**Tipo**: ❌ **ERRO DE TESTE** (Lógica questionável)  
**Arquivo**: `DiariaAppServiceTests.cs`, linha 375  
**Expected**: `r.Add()` chamado 1 vez  
**Actual**: `r.Add()` chamado 0 vezes

### Causa Raiz

O teste espera "all-or-nothing" semantics (atomicidade), mas a implementação do `CreateBatchAsync` não está configurada para parar no primeiro erro e adicionar pelo menos 1 registro.

**Contexto**:

- O teste cria 2 diárias: 1 válida, 1 com funcionário inexistente
- Espera que pelo menos a 1ª seja adicionada antes de falhar
- Mas está recebendo 0 Add calls (falha antes de começar)

### Possíveis Causas

1. **Validação acontece antes do Add**: O serviço valida TODO o batch antes de adicionar qualquer coisa
2. **Mock mal configurado**: Alguma outra validação está falhando antes do Add
3. **Lógica mudou**: O serviço foi refatorado e não faz mais Add parcial

**Recomendação**: Revisar intenção do teste vs. implementação atual

---

## 🔴 ERROS 3-5: WhatsApp Webhook Tests (ReceberMensagem)

**Tipo**: ❌ **ERRO DE DESIGN** (Fire-and-forget em testes síncronos)  
**Arquivo**: `WhatsappWebhookController.cs`, linha 45-56  
**Expected**: `ProcessarMensagemAsync()` invocado 1-2 vezes  
**Actual**: `ProcessarMensagemAsync()` nunca invocado

### Causa Raiz

O controller usa **fire-and-forget** (Task assíncrona desacoplada):

```csharp
// ❌ IMPLEMENTAÇÃO ATUAL (fire-and-forget)
_ = Task.Run(() => _bot.ProcessarMensagemAsync(telefone, texto));
return Ok();  // Retorna imediatamente
```

**Problema**: Em testes síncronos, a Task pode não executar antes do teste terminar, causando race condition.

### Solução

1. **Opção A (Fire-and-forget com await apropriado)**:

   ```csharp
   // Não aguarda, mas garante disparo em context correto
   _ = _bot.ProcessarMensagemAsync(telefone, texto);
   ```

2. **Opção B (Testes assíncronos)**:

   ```csharp
   // Modificar testes para aguardar conclusão da task
   var task = _controller.ReceberMensagem(payload);
   await Task.Delay(100);  // Espera fire-and-forget completar
   ```

3. **Opção C (Usar testable design)**:
   ```csharp
   // Injetar um despachador/queue em vez de task direto
   await _messageDispatcher.DispatchAsync(telefone, texto);
   ```

**Testes Afetados**:

- `ReceberMensagem - Sucesso com mensagem válida`
- `ReceberMensagem - Múltiplos entries com mensagens` (esperava 2 calls, got 0)
- `ReceberMensagem - Mensagem com telefone válido E.164`

---

## 🔴 ERRO 6: CalcularValorTotal_DeveRetornarBreakdownCompleto (Integration)

**Tipo**: ❌ **ERRO DE LÓGICA** (Mesmo que #1)  
**Expected**: 75198,50  
**Actual**: 82635,71  
**Diferença**: 7437,21 (+9.8%)

**Root Cause**: Mesma fórmula de `CalcularFaturamentoEMargens` - ver ERRO #1

---

## 🔴 ERRO 7: CalcularValorTotal_CenarioMaximo_DeveCalcularCorretamente

**Tipo**: ❌ **ERRO DE LÓGICA** (Mesmo que #1)  
**Expected**: 1385112,50  
**Actual**: 1736818,18  
**Diferença**: 351705,68 (+25%)

**Root Cause**: Mesma fórmula - ver ERRO #1

---

## 🔴 ERRO 8: CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400

**Tipo**: ❌ **ERRO DE VALIDAÇÃO**  
**Expected**: `HttpStatusCode.BadRequest`  
**Actual**: `HttpStatusCode.OK`

### Causa Raiz

O teste espera que margens >= 100% sejam rejeitadas, mas a validação não está acontecendo.

**Análise**:

```csharp
// No teste:
MargemLucroPercentual: 0.40m (40%)
MargemCoberturaFaltasPercentual: 0.20m (20%)
Soma = 60% (não >= 100%)

// Espera-se validação para ENCARGOS + MARGENS:
PercentualEncargosProvisoes: 0.50m (50%)
Soma = 50% + 40% + 20% = 110% ✓ (Deveria ser rejeitado)
```

**Problema**: A validação está verificando APENAS se margens >= 100%, não se (encargos + margens) >= 100%.

### Validação Necessária

```csharp
// Adicionar validação:
var totalPercentuais = input.PercentualEncargosProvisoes +
                       input.MargemLucroPercentual +
                       input.MargemCoberturaFaltasPercentual;
if (totalPercentuais >= 1m)
    throw new ArgumentException("Soma de encargos + margens não pode ser >= 100%");
```

---

## 🔧 Resumo de Correções Necessárias

| #     | Arquivo                        | Tipo      | Severidade | Ação                                       |
| ----- | ------------------------------ | --------- | ---------- | ------------------------------------------ |
| 1,6,7 | `ContratoCalculoHelper.cs`     | Lógica    | 🔴 CRÍTICA | Corrigir fórmula de faturamento            |
| 2     | `DiariaAppServiceTests.cs`     | Teste     | 🟡 MÉDIA   | Revisar intenção ou refatorar teste        |
| 3,4,5 | `WhatsappWebhookController.cs` | Design    | 🟡 MÉDIA   | Remover fire-and-forget ou ajustar testes  |
| 8     | `ContratoCalculoService.cs`    | Validação | 🟡 MÉDIA   | Adicionar validação de soma de percentuais |

---

## 📈 Impacto por Área

**Cálculos Financeiros**: 5 falhas (Erros #1, #6, #7, #8 + implicação indireta)  
**Integração WhatsApp**: 3 falhas (Erros #3, #4, #5)  
**Testes Unitários**: 1 falha (Erro #2)
