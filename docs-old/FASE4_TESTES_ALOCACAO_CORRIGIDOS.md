# ✅ FASE 4 - Correção de Testes de Alocação

**Data:** 2026-01-08  
**Status:** ✅ CORRIGIDO

---

## 🐛 Problema Identificado

Após a FASE 4, os testes de `AlocacaoAppServiceTests` estavam falhando com o erro:

```
System.InvalidOperationException: Capacidade máxima do posto atingida para esta data.
```

---

## 🔍 Causa Raiz

A propriedade `CapacidadeMaximaPorDobras` em `PostoDeTrabalho` depende de `QuantidadeIdealFuncionarios`:

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
        if (Condominio == null) return 0;  // ❌ PROBLEMA!
        var totalPostos = Condominio.PostosDeTrabalho?.Count ?? 1;
        return totalPostos > 0 
            ? Condominio.QuantidadeFuncionariosIdeal / totalPostos 
            : 0;
    }
}
```

**Nos testes unitários:**
- ❌ Mocks de `PostoDeTrabalho` não tinham navegação `Condominio` configurada
- ❌ `QuantidadeIdealFuncionarios` retornava **0**
- ❌ `CapacidadeMaximaPorDobras` também era **0**
- ❌ Validação `quantidadeAtual < capacidadeMaxima` sempre falhava!

---

## ✅ Soluções Implementadas

### 1. **Helper CriarPosto com Mock de Condominio**

**ANTES:**
```csharp
private static PostoDeTrabalho CriarPosto(Guid condominioId, Guid empresaId) =>
    new(condominioId, empresaId, TimeSpan.FromHours(6), TimeSpan.FromHours(18), true);
    // ❌ Sem Condominio -> QuantidadeIdealFuncionarios = 0
```

**DEPOIS:**
```csharp
private static PostoDeTrabalho CriarPosto(Guid condominioId, Guid empresaId) 
{
    // Criar Condominio mock
    var condominio = new Condominio(
        empresaId, "Condominio Teste", "12345678000190", "Rua Teste", 
        12, // QuantidadeFuncionariosIdeal
        TimeSpan.FromHours(6), "test@test.com", "+5511999999999");
    
    var posto = new PostoDeTrabalho(condominioId, empresaId, ...);
    
    // Configurar navegação usando Reflection
    var condominioProperty = typeof(PostoDeTrabalho).GetProperty("Condominio");
    condominioProperty?.SetValue(posto, condominio);
    
    // Adicionar posto à coleção do condomínio
    condominio.GetType().GetProperty("PostosDeTrabalho")
        ?.SetValue(condominio, new List<PostoDeTrabalho> { posto });
    
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
    PostoDeTrabalho posto, 
    IEnumerable<Alocacao>? alocacoesExistentes = null)
{
    _tenantService.Setup(t => t.EmpresaId).Returns(empresaId);
    _funcionarioRepo.Setup(r => r.GetByIdAsync(funcionario.Id)).ReturnsAsync(funcionario);
    _postoRepo.Setup(r => r.GetByIdAsync(posto.Id)).ReturnsAsync(posto);
    _alocacaoRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id))
        .ReturnsAsync(alocacoesExistentes ?? Array.Empty<Alocacao>());
    // ✅ FASE 4: Mock essencial para validação de capacidade
    _alocacaoRepo.Setup(r => r.GetByPostoEDataAsync(posto.Id, It.IsAny<DateOnly>()))
        .ReturnsAsync(alocacoesExistentes ?? Array.Empty<Alocacao>());
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
_alocacaoRepo.Setup(r => r.GetByFuncionarioAsync(funcionario.Id)).ReturnsAsync(...);
_alocacaoRepo.Setup(r => r.GetByPostoEDataAsync(posto.Id, ...)).ReturnsAsync(...);
_uow.Setup(u => u.CommitAsync()).ReturnsAsync(true);
```

**DEPOIS (simples):**
```csharp
ConfigurarMocksBasicos(empresaId, funcionario, posto, alocacoesExistentes);
```

---

## 📝 Arquivos Modificados

1. ✅ `AlocacaoAppServiceTests.cs`
   - Helper `CriarPosto()` com mock de Condominio
   - Novo helper `ConfigurarMocksBasicos()`
   - Testes atualizados:
     - `CreateAsync_DeveCriarAlocacao()`
     - `CreateAsync_DevePermitirConsecutivaQuandoDobra()`
     - `CreateAsync_DevePermitirDobraProgramadaAposAlocacaoRegular()`

---

## 🧪 Testes Afetados e Corrigidos

| Teste | Status | Correção |
|-------|--------|----------|
| `CreateAsync_DeveCriarAlocacao` | ✅ Corrigido | Helper + ConfigurarMocksBasicos |
| `CreateAsync_DevePermitirConsecutivaQuandoDobra` | ✅ Corrigido | ConfigurarMocksBasicos |
| `CreateAsync_DevePermitirDobraProgramadaAposAlocacaoRegular` | ✅ Corrigido | ConfigurarMocksBasicos |

---

## 🎯 Por Que Funciona Agora?

**Antes:**
```
PostoDeTrabalho (mock)
├── Condominio = null                      ❌
└── QuantidadeIdealFuncionarios = 0        ❌
    └── CapacidadeMaximaPorDobras = 0      ❌
        └── Validação sempre falha!        ❌
```

**Depois:**
```
PostoDeTrabalho (mock)
├── Condominio (mock configurado)                     ✅
│   ├── QuantidadeFuncionariosIdeal = 12              ✅
│   └── PostosDeTrabalho.Count = 1                    ✅
└── QuantidadeIdealFuncionarios = 12 / 1 = 12         ✅
    └── CapacidadeMaximaPorDobras = 12 * 2 = 24       ✅
        └── Validação passa (0 < 24)                   ✅
```

---

## ✅ Resultado Final

- ✅ Todos os testes de `AlocacaoAppServiceTests` agora passam
- ✅ Mocks corretamente configurados para FASE 4
- ✅ Código mais limpo com helpers reutilizáveis
- ✅ Validação de capacidade funciona corretamente

**FASE 4 - Testes de Alocação 100% Corrigidos!** 🎉

