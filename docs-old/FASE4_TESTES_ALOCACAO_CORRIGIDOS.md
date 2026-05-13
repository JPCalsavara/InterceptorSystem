# ✅ FASE 4 - Correção de Testes de Diária

**Data:** 2026-01-08  
**Status:** ✅ CORRIGIDO

---

## 🐛 Problema Identificado

Após a FASE 4, os testes de `DiariaAppServiceTests` estavam falhando com o erro:

```
System.InvalidOperationException: Capacidade máxima do posto atingida para esta data.
```

---

## 🔍 Causa Raiz

A propriedade `CapacidadeMaximaPorDobras` em `Posto` depende de `QuantidadeIdealFuncionarios`:

```csharp
public int CapacidadeMaximaPorDobras => PermiteDobrarEscala 
    ? QuantidadeIdealFuncionarios * 2 
    : QuantidadeIdealFuncionarios;
```

**FASE 4:** `QuantidadeIdealFuncionarios` agora é uma propriedade calculada:

```csharp
[NotMapped]
public int QuantidadeIdealFuncionarios
{
    get
    {
        if (Cliente == null) return 0;  // ❌ PROBLEMA!
        var totalPostos = Cliente.Postos?.Count ?? 1;
        return totalPostos > 0 
            ? Cliente.QuantidadeFuncionariosIdeal / totalPostos 
            : 0;
    }
}
```

**Nos testes unitários:**
- ❌ Mocks de `Posto` não tinham navegação `Cliente` configurada
- ❌ `QuantidadeIdealFuncionarios` retornava **0**
- ❌ `CapacidadeMaximaPorDobras` também era **0**
- ❌ Validação `quantidadeAtual < capacidadeMaxima` sempre falhava!

---

## ✅ Soluções Implementadas

### 1. **Helper CriarPosto com Mock de Cliente**

**ANTES:**
```csharp
private static Posto CriarPosto(Guid clienteId, Guid empresaId) =>
    new(clienteId, empresaId, TimeSpan.FromHours(6), TimeSpan.FromHours(18), true);
    // ❌ Sem Cliente -> QuantidadeIdealFuncionarios = 0
```

**DEPOIS:**
```csharp
private static Posto CriarPosto(Guid clienteId, Guid empresaId) 
{
    // Criar Cliente mock
    var cliente = new Cliente(
        empresaId, "Cliente Teste", "12345678000190", "Rua Teste", 
        12, // QuantidadeFuncionariosIdeal
        TimeSpan.FromHours(6), "test@test.com", "+5511999999999");
    
    var posto = new Posto(clienteId, empresaId, ...);
    
    // Configurar navegação usando Reflection
    var clienteProperty = typeof(Posto).GetProperty("Cliente");
    clienteProperty?.SetValue(posto, cliente);
    
    // Adicionar posto à coleção do cliente
    cliente.GetType().GetProperty("Postos")
        ?.SetValue(cliente, new List<Posto> { posto });
    
    return posto;
    // ✅ Agora QuantidadeIdealFuncionarios = 12 / 1 = 12
}
```

---

### 2. **Helper ConfigurarMocksBasicos**

Centralizou a configuração de mocks repetitivos:

```csharp
private void ConfigurarMocksBasicos(
    Guid empresaId, 
    Funcionario funcionario, 
    Posto posto, 
    IEnumerable<Diaria>? diariasExistentes = null)
{
    _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
    _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
    _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
    _diariaRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id))
        .ReturnsAsync(diariasExistentes ?? Array.Empty<Diaria>());
    // ✅ FASE 4: Mock essencial para validação de capacidade
    _diariaRepo.Setup(r => r.GetByPostoEDataAsync(posto.Id, It.IsAny<DateOnly>()))
        .ReturnsAsync(diariasExistentes ?? Array.Empty<Diaria>());
    _uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);
}
```

---

### 3. **Testes Simplificados**

**ANTES (complexo):**
```csharp
_tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
_funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
_postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
_diariaRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id)).ReturnsAsync(...);
_diariaRepo.Setup(r => r.GetByPostoEDataAsync(posto.Id, ...)).ReturnsAsync(...);
_uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);
```

**DEPOIS (simples):**
```csharp
ConfigurarMocksBasicos(empresaId, funcionario, posto, diariasExistentes);
```

---

## 📝 Arquivos Modificados

1. ✅ `DiariaAppServiceTests.cs`
   - Helper `CriarPosto()` com mock de Cliente
   - Novo helper `ConfigurarMocksBasicos()`
   - Testes atualizados:
     - `CreateAsync_DeveCriarDiaria()`
     - `CreateAsync_DevePermitirConsecutivaQuandoDobra()`
     - `CreateAsync_DevePermitirDobraProgramadaAposDiariaRegular()`

---

## 🧪 Testes Afetados e Corrigidos

| Teste | Status | Correção |
|-------|--------|----------|
| `CreateAsync_DeveCriarDiaria` | ✅ Corrigido | Helper + ConfigurarMocksBasicos |
| `CreateAsync_DevePermitirConsecutivaQuandoDobra` | ✅ Corrigido | ConfigurarMocksBasicos |
| `CreateAsync_DevePermitirDobraProgramadaAposDiariaRegular` | ✅ Corrigido | ConfigurarMocksBasicos |

---

## 🎯 Por Que Funciona Agora?

**Antes:**
```
Posto (mock)
├── Cliente = null                      ❌
└── QuantidadeIdealFuncionarios = 0        ❌
    └── CapacidadeMaximaPorDobras = 0      ❌
        └── Validação sempre falha!        ❌
```

**Depois:**
```
Posto (mock)
├── Cliente (mock configurado)                     ✅
│   ├── QuantidadeFuncionariosIdeal = 12              ✅
│   └── Postos.Count = 1                    ✅
└── QuantidadeIdealFuncionarios = 12 / 1 = 12         ✅
    └── CapacidadeMaximaPorDobras = 12 * 2 = 24       ✅
        └── Validação passa (0 < 24)                   ✅
```

---

## ✅ Resultado Final

- ✅ Todos os testes de `DiariaAppServiceTests` agora passam
- ✅ Mocks corretamente configurados para FASE 4
- ✅ Código mais limpo com helpers reutilizáveis
- ✅ Validação de capacidade funciona corretamente

**FASE 4 - Testes de Diária 100% Corrigidos!** 🎉

