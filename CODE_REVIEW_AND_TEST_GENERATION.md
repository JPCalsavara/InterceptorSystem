# InterceptorSystem — 8 Failing Tests Analysis & Fixes

**Date:** May 12, 2026  
**Status:** Test Failure Root Cause Analysis  
**Focus:** 8 Failing Backend Tests  
**Scope:** Error Categorization + Fix Recommendations

---

## 📊 Executive Summary

| #   | Test Name                                                            | Category       | Severity    | Root Cause                |
| --- | -------------------------------------------------------------------- | -------------- | ----------- | ------------------------- |
| 1   | CalcularValorTotal_DeveCalcularCustoDiretoERetornarBreakdownCompleto | Logic Error    | 🔴 CRITICAL | Wrong faturamento formula |
| 2   | CreateBatchAsync_ComFuncionarioInexistente_DeveFalhar                | Test Assertion | 🟡 MEDIUM   | Fail-fast validation      |
| 3   | ReceberMensagem_ComMensagemValida_DeveProcessarERetornarOk           | Async Race     | 🟡 MEDIUM   | Fire-and-forget Task      |
| 4   | ReceberMensagem_ComMultiplosEntries_DeveProcessarTodas               | Async Race     | 🟡 MEDIUM   | Fire-and-forget Task      |
| 5   | ReceberMensagem_ComTelefoneValidoE164_DeveProcessar                  | Async Race     | 🟡 MEDIUM   | Fire-and-forget Task      |
| 6   | CalcularValorTotal_DeveRetornarBreakdownCompleto (Integration)       | Logic Error    | 🔴 CRITICAL | Wrong faturamento formula |
| 7   | CalcularValorTotal_CenarioMaximo_DeveCalcularCorretamente            | Logic Error    | 🔴 CRITICAL | Wrong faturamento formula |
| 8   | CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400           | Validation Gap | 🟡 MEDIUM   | Missing validation logic  |

**Summary:**

- **Logic Errors (3 tests):** Calculation formula issues
- **Async Race Conditions (3 tests):** Fire-and-forget pattern not awaited
- **Validation Gap (1 test):** Missing margin validation
- **Test Assertion (1 test):** Wrong assumption about implementation behavior

---

## 🔴 CRITICAL ERRORS — Logic Issues (Errors #1, #6, #7)

### Root Cause: Incorrect Faturamento Formula in ContratoCalculoHelper

**File:** `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/ContratoCalculoHelper.cs`

**Method:** `CalcularFaturamentoEMargens()`

#### Current Implementation (WRONG)

```csharp
public static (decimal Faturamento, decimal Lucro, decimal Faltas) CalcularFaturamentoEMargens(
    decimal custoBaseMensal,
    decimal margemLucroPercentual,
    decimal margemCoberturaFaltasPercentual)
{
    var somaMargens = margemLucroPercentual + margemCoberturaFaltasPercentual;

    // ❌ WRONG: Uses markup reverso (fórmula de divisão)
    if (somaMargens >= 1m)
    {
        return (custoBaseMensal, 0m, 0m);
    }

    var faturamento = custoBaseMensal / (1m - somaMargens);  // ❌ ERRO AQUI
    var lucro = faturamento * margemLucroPercentual;
    var faltas = faturamento * margemCoberturaFaltasPercentual;

    return (faturamento, lucro, faltas);
}
```

#### Correct Implementation

```csharp
public static (decimal Faturamento, decimal Lucro, decimal Faltas) CalcularFaturamentoEMargens(
    decimal custoBaseMensal,
    decimal margemLucroPercentual,
    decimal margemCoberturaFaltasPercentual)
{
    var somaMargens = margemLucroPercentual + margemCoberturaFaltasPercentual;

    // ✅ CORRECT: Additive formula (margens sobre custo base)
    var faturamento = custoBaseMensal * (1m + somaMargens);
    var lucro = faturamento * margemLucroPercentual;
    var faltas = faturamento * margemCoberturaFaltasPercentual;

    return (faturamento, lucro, faltas);
}
```

#### Example: Why This Matters

**Test 1 Data:**

```
Input:
  ValorDiariaCobrada = 100
  DiariasTotaisMes = 15
  MargemLucro = 20%
  MargemFaltas = 10%

Backend calculates:
  custoDireto = 1500
  valorImpostos = 570
  custoBaseMensal = 2070

❌ WRONG formula:  faturamento = 2070 / (1 - 0.30) = 2070 / 0.70 = 2957.14
✅ CORRECT formula: faturamento = 2070 * (1 + 0.30) = 2070 * 1.30 = 2691

Expected: 2691
Actual:   2957.14
Difference: 266.14 (+9.8%)
```

#### Impact

This formula error affects:

- ✅ **Error #1**: Unit test expects 2691, gets 2957.14
- ✅ **Error #6**: Integration test expects 75198.50, gets 82635.71
- ✅ **Error #7**: Integration test expects 1385112.50, gets 1736818.18

---

## 🟡 MEDIUM ERRORS — Async Race Conditions (Errors #3, #4, #5)

### Root Cause: Fire-and-Forget Pattern in WhatsappWebhookController

**File:** `backend/src/InterceptorSystem.Api/Controllers/WhatsappWebhookController.cs`

**Method:** `ReceberMensagem()`

#### Current Implementation (PROBLEMATIC)

```csharp
[HttpPost("webhook")]
public IActionResult ReceberMensagem([FromBody] MetaWebhookPayload payload)
{
    var mensagens = payload.Entry
        .SelectMany(e => e.Changes)
        .Where(c => c.Field == "messages")
        .SelectMany(c => c.Value.Messages ?? []);

    foreach (var msg in mensagens)
    {
        if (msg.Type != "text" || msg.Text?.Body is null) continue;

        var telefone = msg.From;
        var texto = msg.Text.Body;

        // ❌ PROBLEM: Fire-and-forget task
        _ = Task.Run(() => _bot.ProcessarMensagemAsync(telefone, texto));
    }

    return Ok();  // Returns immediately, Task may not execute
}
```

#### Why Tests Fail

```csharp
// Test Setup:
var mock = new Mock<IWhatsappBotService>();
mock.Setup(m => m.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>()))
    .Returns(Task.CompletedTask);

// Execute:
var result = controller.ReceberMensagem(payload);

// Verify (FAILS):
mock.Verify(
    m => m.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>()),
    Times.Once);  // ❌ 0 invocations - Task hasn't executed yet!
```

#### Solution Option 1: Remove Task.Run

```csharp
[HttpPost("webhook")]
public IActionResult ReceberMensagem([FromBody] MetaWebhookPayload payload)
{
    var mensagens = payload.Entry
        .SelectMany(e => e.Changes)
        .Where(c => c.Field == "messages")
        .SelectMany(c => c.Value.Messages ?? []);

    foreach (var msg in mensagens)
    {
        if (msg.Type != "text" || msg.Text?.Body is null) continue;

        var telefone = msg.From;
        var texto = msg.Text.Body;

        // ✅ FIXED: Direct call without Task.Run
        _ = _bot.ProcessarMensagemAsync(telefone, texto);
    }

    return Ok();
}
```

#### Solution Option 2: Use Async Test Pattern

```csharp
[Fact]
public async Task ReceberMensagem_ComMensagemValida_DeveProcessarERetornarOk()
{
    var payload = CreateTestPayload();

    // Execute
    var result = controller.ReceberMensagem(payload);

    // Wait for fire-and-forget to complete
    await Task.Delay(100);  // ✅ Allow background task to execute

    // Verify
    mock.Verify(
        m => m.ProcessarMensagemAsync(It.IsAny<string>(), It.IsAny<string>()),
        Times.Once);

    Assert.Equal(StatusCodes.Status200OK, ((OkResult)result).StatusCode);
}
```

#### Affected Tests

- **Error #3**: `ReceberMensagem_ComMensagemValida_DeveProcessarERetornarOk`
  - Expected: Mock called 1x
  - Actual: Mock called 0x (Task not awaited)

- **Error #4**: `ReceberMensagem_ComMultiplosEntries_DeveProcessarTodas`
  - Expected: Mock called 2x (2 messages)
  - Actual: Mock called 0x (Tasks not awaited)

- **Error #5**: `ReceberMensagem_ComTelefoneValidoE164_DeveProcessar`
  - Expected: Mock called 1x
  - Actual: Mock called 0x (Task not awaited)

---

## 🟡 VALIDATION GAP — Missing Margin Check (Error #8)

### Root Cause: Incomplete Margin Validation

**File:** `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/ContratoCalculoService.cs`

**Method:** `ValidarInput()`

#### Current Implementation (INCOMPLETE)

```csharp
private static void ValidarInput(CalculoValorTotalInput input)
{
    // ... other validations ...

    if (input.MargemLucroPercentual < 0m || input.MargemLucroPercentual > 1m)
        throw new ArgumentException("Margem de lucro deve estar entre 0% e 100%.",
                                    nameof(input.MargemLucroPercentual));

    if (input.MargemCoberturaFaltasPercentual < 0m || input.MargemCoberturaFaltasPercentual > 1m)
        throw new ArgumentException("Margem de cobertura deve estar entre 0% e 100%.",
                                    nameof(input.MargemCoberturaFaltasPercentual));

    // ❌ MISSING: Valida margens SOZINHAS, não com encargos
}
```

#### What Test Expects

```csharp
// Test data:
{
    PercentualEncargosProvisoes: 0.50m (50%)
    MargemLucroPercentual: 0.40m (40%)
    MargemCoberturaFaltasPercentual: 0.20m (20%)

    Total = 50% + 40% + 20% = 110% ✓ (Should be rejected as > 100%)
}

// Expected: HttpStatusCode.BadRequest (400)
// Actual: HttpStatusCode.OK (200) - No validation triggered
```

#### Correct Implementation

```csharp
private static void ValidarInput(CalculoValorTotalInput input)
{
    // ... existing validations ...

    if (input.MargemLucroPercentual < 0m || input.MargemLucroPercentual > 1m)
        throw new ArgumentException("Margem de lucro deve estar entre 0% e 100%.",
                                    nameof(input.MargemLucroPercentual));

    if (input.MargemCoberturaFaltasPercentual < 0m || input.MargemCoberturaFaltasPercentual > 1m)
        throw new ArgumentException("Margem de cobertura deve estar entre 0% e 100%.",
                                    nameof(input.MargemCoberturaFaltasPercentual));

    // ✅ NEW: Validate total of encargos + margens
    var totalPercentuais = input.PercentualEncargosProvisoes +
                          input.MargemLucroPercentual +
                          input.MargemCoberturaFaltasPercentual;

    if (totalPercentuais >= 1m)
        throw new ArgumentException(
            $"Soma de encargos ({input.PercentualEncargosProvisoes:P}) + " +
            $"margens ({input.MargemLucroPercentual:P} + {input.MargemCoberturaFaltasPercentual:P}) " +
            $"não pode ser >= 100%. Total: {totalPercentuais:P}",
            nameof(input.PercentualEncargosProvisoes));
}
```

#### Affected Test

- **Error #8**: `CalcularValorTotal_MargensAcima100Porcento_DeveRetornar400`
  - Expected: HttpStatusCode.BadRequest (400)
  - Actual: HttpStatusCode.OK (200)
  - Reason: Validation never triggered because it doesn't check sum of (encargos + margens)

---

## 🟡 TEST ASSUMPTION ERROR (Error #2)

### Root Cause: Incorrect Expectation of Batch Behavior

**File:** `backend/src/InterceptorSystem.Tests/BoundedContexts/Operacoes/CreateBatchAsync_ComFuncionarioInexistente_DeveFalhar`

**Test Location:** `DiariaAppServiceTests.cs`, line 375

#### Current Test Expectation (WRONG)

```csharp
[Fact]
public async Task CreateBatchAsync_ComFuncionarioInexistente_DeveFalhar()
{
    var inputs = new List<DiariaCreateInput>
    {
        new DiariaCreateInput { /* ... valid data ... */ },
        new DiariaCreateInput { FuncionarioId = Guid.NewGuid() }  // Non-existent
    };

    // Test expects: First diaria added, then fails on second
    await Assert.ThrowsAsync<ArgumentException>(
        () => _service.CreateBatchAsync(inputs, CancellationToken.None));

    // ❌ WRONG: Expects Add() to be called once
    _mockRepository.Verify(
        r => r.Add(It.IsAny<Diaria>()),
        Times.Once);  // But actually: Times.Never (validation happens first)
}
```

#### Why It Fails

The service implements **fail-fast validation**:

1. Validates ALL inputs before adding any
2. If ANY input is invalid, throws immediately
3. NO partial adds happen

```csharp
// Service implementation (simplified):
public async Task<List<DiariaDto>> CreateBatchAsync(
    List<DiariaCreateInput> inputs,
    CancellationToken ct)
{
    // ✅ Validates ALL inputs first
    foreach (var input in inputs)
    {
        if (!funcionarioExists)
            throw new ArgumentException("Funcionário não encontrado");
    }

    // Only if ALL validations pass:
    foreach (var input in inputs)
    {
        var diaria = new Diaria(input);
        _repository.Add(diaria);  // Never reached if any validation fails
    }

    await _repository.UnitOfWork.CommitAsync(ct);
}
```

#### Correct Test Expectation

```csharp
[Fact]
public async Task CreateBatchAsync_ComFuncionarioInexistente_DeveFalhar()
{
    var inputs = new List<DiariaCreateInput>
    {
        new DiariaCreateInput { /* ... valid data ... */ },
        new DiariaCreateInput { FuncionarioId = Guid.NewGuid() }  // Non-existent
    };

    // Execute
    await Assert.ThrowsAsync<ArgumentException>(
        () => _service.CreateBatchAsync(inputs, CancellationToken.None));

    // ✅ CORRECT: Expects NO adds (fail-fast validation)
    _mockRepository.Verify(
        r => r.Add(It.IsAny<Diaria>()),
        Times.Never);  // All-or-nothing: either all or none
}
```

---

## 📋 Summary Table: All 8 Errors

| #   | Test File                                  | Method              | Error Type | Expected   | Actual      | Fix                                      |
| --- | ------------------------------------------ | ------------------- | ---------- | ---------- | ----------- | ---------------------------------------- |
| 1   | ContratoCalculoServiceTests                | CalcularValorTotal  | Logic      | 2691       | 2957.14     | Fix formula in ContratoCalculoHelper     |
| 2   | DiariaAppServiceTests                      | CreateBatchAsync    | Assertion  | Times.Once | Times.Never | Update test to expect Times.Never        |
| 3   | WhatsappWebhookControllerIntegrationTests  | ReceberMensagem (1) | Async      | 1 call     | 0 calls     | Remove Task.Run or use Delay             |
| 4   | WhatsappWebhookControllerIntegrationTests  | ReceberMensagem (2) | Async      | 2 calls    | 0 calls     | Remove Task.Run or use Delay             |
| 5   | WhatsappWebhookControllerIntegrationTests  | ReceberMensagem (3) | Async      | 1 call     | 0 calls     | Remove Task.Run or use Delay             |
| 6   | ContratoCalculosControllerIntegrationTests | CalcularValorTotal  | Logic      | 75198.50   | 82635.71    | Fix formula in ContratoCalculoHelper     |
| 7   | ContratoCalculosControllerIntegrationTests | CenarioMaximo       | Logic      | 1385112.50 | 1736818.18  | Fix formula in ContratoCalculoHelper     |
| 8   | ContratoCalculosControllerIntegrationTests | Margens >= 100%     | Validation | 400        | 200         | Add validation in ContratoCalculoService |

---

## 🔧 Implementation Checklist

### Priority 1: Fix Critical Logic Errors (Errors #1, #6, #7)

- [ ] Update `CalcularFaturamentoEMargens()` formula in ContratoCalculoHelper.cs
- [ ] Change from: `custoBaseMensal / (1m - somaMargens)`
- [ ] Change to: `custoBaseMensal * (1m + somaMargens)`
- [ ] Run all calculation tests to verify fix

### Priority 2: Fix Async Race Conditions (Errors #3, #4, #5)

- [ ] Option A: Remove `Task.Run()` from WhatsappWebhookController.ReceberMensagem()
- [ ] Option B: Add `await Task.Delay(100)` in tests before verification
- [ ] Update WhatsappWebhookControllerIntegrationTests accordingly

### Priority 3: Fix Validation Gap (Error #8)

- [ ] Add margin sum validation to `ValidarInput()` in ContratoCalculoService.cs
- [ ] Check: `(PercentualEncargosProvisoes + MargemLucro + MargemFaltas) < 1m`
- [ ] Throw ArgumentException if sum >= 100%

### Priority 4: Fix Test Assumption (Error #2)

- [ ] Update `CreateBatchAsync_ComFuncionarioInexistente_DeveFalhar`
- [ ] Change mock verification from `Times.Once` to `Times.Never`
- [ ] Add comment explaining fail-fast validation behavior

---

## 🎯 Expected Outcomes

After fixes:

- ✅ All 8 tests should pass
- ✅ Total test suite: **263/263 passing** (100%)
- ✅ Financial calculations will be mathematically correct
- ✅ WhatsApp webhook integration will be properly tested
- ✅ Margin validation will prevent invalid configurations
