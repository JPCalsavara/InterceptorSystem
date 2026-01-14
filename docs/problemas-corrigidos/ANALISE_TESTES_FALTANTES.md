# 🧪 ANÁLISE E CORREÇÃO DE TESTES - v2.0

**Data:** 2026-01-08  
**Status:** 🔄 EM ANDAMENTO

---

## 📊 Análise dos Testes Existentes

### ✅ **Testes Encontrados (OK)**

| Módulo | Unitários | Integração | Status |
|--------|-----------|------------|--------|
| Condomínio | ✅ | ✅ | OK |
| PostoDeTrabalho | ✅ | ✅ | OK |
| Funcionário | ✅ | ✅ | OK |
| Alocação | ✅ | ✅ | OK |
| Contrato | ✅ | ✅ | ⚠️ Faltam testes de cálculo |
| **CondominioOrquestrador** | ✅ | ✅ | ✅ FASE 5 |

---

## 🚨 **TESTES CRÍTICOS FALTANDO**

### **1. Cálculo de Salário com Margens (FASE 3)** 🔴

**Problema:** NÃO existem testes validando a correção crítica onde margens de lucro e faltas foram adicionadas.

**Impacto:** Se alguém remover as margens da fórmula, ninguém vai perceber!

**Solução:** Criar `ContratoCalculosTests.cs`

---

### **2. Cálculo de ValorTotal do Contrato** 🔴

**Problema:** Frontend calcula errado, backend tem endpoint mas SEM testes!

**Impacto:** API `/api/contratos/calculos/calcular-valor-total` pode quebrar sem aviso.

**Solução:** Criar `ContratoCalculosControllerTests.cs`

---

### **3. Validação de Criação Completa (FASE 5)** 🟡

**Problema:** Testes existem mas são poucos (apenas 4 casos).

**Impacto:** Regras de consistência podem quebrar.

**Solução:** Adicionar mais casos de borda.

---

## ✅ **NOVOS TESTES NECESSÁRIOS**

### **Teste 1: Cálculo de Salário Base (UNITÁRIO)**

```csharp
[Fact]
public void CalcularSalarioBase_DeveConsiderarMargemLucroEFaltas()
{
    // Arrange
    var contrato = new Contrato(
        empresaId: Guid.NewGuid(),
        condominioId: Guid.NewGuid(),
        descricao: "Teste Margens",
        valorTotalMensal: 72000m,
        valorDiariaCobrada: 100m,
        percentualAdicionalNoturno: 0.30m,
        valorBeneficiosExtrasMensal: 3600m,
        percentualImpostos: 0.15m,        // 15% = 10800
        quantidadeFuncionarios: 12,
        margemLucroPercentual: 0.20m,     // 20% = 14400 ✅
        margemCoberturaFaltasPercentual: 0.10m,  // 10% = 7200 ✅
        dataInicio: DateOnly.FromDateTime(DateTime.Today),
        dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
        status: StatusContrato.PAGO
    );

    // Act
    var salarioBase = contrato.CalcularSalarioBasePorFuncionario();

    // Assert
    // ValorTotal: 72000
    // - Impostos (15%): 10800
    // - Lucro (20%): 14400
    // - Faltas (10%): 7200
    // - Benefícios: 3600
    // = Base: 36000
    // / 12 funcionários = 3000
    Assert.Equal(3000m, salarioBase);
}
```

### **Teste 2: Salário SEM Margens (deve falhar se remover)**

```csharp
[Fact]
public void CalcularSalarioBase_SemMargens_DeveDarDiferente()
{
    var contrato = new Contrato(
        empresaId: Guid.NewGuid(),
        condominioId: Guid.NewGuid(),
        descricao: "Teste",
        valorTotalMensal: 72000m,
        valorDiariaCobrada: 100m,
        percentualAdicionalNoturno: 0.30m,
        valorBeneficiosExtrasMensal: 3600m,
        percentualImpostos: 0m,           // 0%
        quantidadeFuncionarios: 12,
        margemLucroPercentual: 0m,         // 0%
        margemCoberturaFaltasPercentual: 0m,  // 0%
        dataInicio: DateOnly.FromDateTime(DateTime.Today),
        dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
        status: StatusContrato.PAGO
    );

    var salarioBase = contrato.CalcularSalarioBasePorFuncionario();

    // Sem margens: (72000 - 3600) / 12 = 5700
    Assert.Equal(5700m, salarioBase);
}
```

### **Teste 3: Base Negativa (deve lançar exceção)**

```csharp
[Fact]
public void CalcularSalarioBase_BaseNegativa_DeveLancarExcecao()
{
    var contrato = new Contrato(
        empresaId: Guid.NewGuid(),
        condominioId: Guid.NewGuid(),
        descricao: "Teste Base Negativa",
        valorTotalMensal: 1000m,           // Muito baixo!
        valorDiariaCobrada: 100m,
        percentualAdicionalNoturno: 0.30m,
        valorBeneficiosExtrasMensal: 900m,
        percentualImpostos: 0.15m,         // 150
        quantidadeFuncionarios: 10,
        margemLucroPercentual: 0.20m,      // 200
        margemCoberturaFaltasPercentual: 0.10m,  // 100
        dataInicio: DateOnly.FromDateTime(DateTime.Today),
        dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
        status: StatusContrato.PAGO
    );

    // (1000 - 150 - 200 - 100 - 900) = -350 (negativo!)
    var ex = Assert.Throws<InvalidOperationException>(
        () => contrato.CalcularSalarioBasePorFuncionario()
    );

    Assert.Contains("Base para salários é negativa", ex.Message);
}
```

### **Teste 4: Endpoint de Cálculo (INTEGRAÇÃO)**

```csharp
[Fact]
public async Task CalcularValorTotal_DeveRetornarBreakdown()
{
    // Arrange
    var input = new CalculoValorTotalInput(
        ValorDiariaCobrada: 100m,
        QuantidadeFuncionarios: 12,
        ValorBeneficiosExtrasMensal: 3600m,
        PercentualImpostos: 0.15m,
        MargemLucroPercentual: 0.20m,
        MargemCoberturaFaltasPercentual: 0.10m
    );

    // Act
    var response = await _client.PostAsJsonAsync(
        "/api/contratos/calculos/calcular-valor-total", 
        input
    );

    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    
    var result = await response.Content.ReadFromJsonAsync<CalculoValorTotalOutput>();
    
    // Custo Base: (100 × 30 × 12) + 3600 = 39600
    // Margens: 45%
    // Valor Total: 39600 / 0.55 = 72000
    Assert.Equal(72000m, result.ValorTotalMensal);
    Assert.Equal(39600m, result.CustoBaseMensal);
    Assert.Equal(10800m, result.ValorImpostos);
    Assert.Equal(14400m, result.ValorMargemLucro);
    Assert.Equal(7200m, result.ValorMargemFaltas);
}
```

### **Teste 5: Margens >= 100% (deve falhar)**

```csharp
[Fact]
public async Task CalcularValorTotal_MargensAcima100_DeveRetornar400()
{
    var input = new CalculoValorTotalInput(
        ValorDiariaCobrada: 100m,
        QuantidadeFuncionarios: 12,
        ValorBeneficiosExtrasMensal: 3600m,
        PercentualImpostos: 0.50m,         // 50%
        MargemLucroPercentual: 0.40m,      // 40%
        MargemCoberturaFaltasPercentual: 0.20m  // 20%
        // Total: 110% ❌
    );

    var response = await _client.PostAsJsonAsync(
        "/api/contratos/calculos/calcular-valor-total", 
        input
    );

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
}
```

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Testes Unitários - Contrato**
- [ ] `CalcularSalarioBase_DeveConsiderarMargemLucroEFaltas`
- [ ] `CalcularSalarioBase_SemMargens_DeveDarDiferente`
- [ ] `CalcularSalarioBase_BaseNegativa_DeveLancarExcecao`
- [ ] `CalcularAdicionalNoturno_DeveRetornarPercentualCorreto`
- [ ] `CalcularBeneficiosPorFuncionario_DeveDividirIgualmente`
- [ ] `CalcularBeneficiosPorFuncionario_SemFuncionarios_DeveLancarExcecao`

### **Testes Integração - Cálculo**
- [ ] `CalcularValorTotal_DeveRetornarBreakdownCompleto`
- [ ] `CalcularValorTotal_MargensAcima100_DeveRetornar400`
- [ ] `CalcularValorTotal_DiariaNegativa_DeveRetornar400`
- [ ] `CalcularValorTotal_FuncionariosZero_DeveRetornar400`

### **Testes Integração - Criação Completa (ampliar)**
- [ ] `CriarCompleto_Com3Postos_DeveCalcularHorarios8h`
- [ ] `CriarCompleto_FuncionariosNaoDivisiveis_DeveRetornar400`
- [ ] `CriarCompleto_DataInicioPassado_DeveRetornar400`
- [ ] `CriarCompleto_MargensInvalidas_DeveRetornar400`

---

## 🎯 **PRIORIDADES**

### **Alta Prioridade** 🔴
1. Testes de cálculo de salário (FASE 3 crítica)
2. Testes do endpoint de cálculo

### **Média Prioridade** 🟡
3. Ampliar testes de criação completa (FASE 5)

### **Baixa Prioridade** 🟢
4. Testes de edge cases adicionais

---

## 📊 **COBERTURA ESTIMADA**

| Módulo | Antes | Depois | Melhoria |
|--------|-------|--------|----------|
| Contrato (Unitário) | 8 testes | 14 testes | +75% |
| Cálculo (Integração) | 0 testes | 4 testes | **NOVO** |
| Criação Completa | 4 testes | 8 testes | +100% |
| **TOTAL** | 73 testes | **89 testes** | **+22%** |

---

**Próximo Passo:** Implementar os testes faltantes!

