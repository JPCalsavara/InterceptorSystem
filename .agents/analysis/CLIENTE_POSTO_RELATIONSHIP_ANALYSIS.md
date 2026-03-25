# Cliente ↔ Posto: Mapa de Acesso de Dados

## Visualização da Relação

```
┌─────────────┐
│   CLIENTE   │ 1──────N ┌─────────────┐
│             │          │   POSTO     │
│ .Postos () ─┼──────────→ .ClienteId  │
│             │          │ .Cliente    │
└─────────────┘          └─────────────┘
```

**Tipo:** One-to-Many (1 Cliente possui N Postos)  
**Navegação:** Bidirecional (Cliente.Postos / Posto.Cliente)  
**Lazy Loading:** ❌ Desabilitado (eager loading obrigatório)  
**Eager Loading:** ✅ Sempre incluídos em todas as queries

---

## Padrões de Acesso aos Dados

### Padrão 1️⃣: ListarPostos de um Cliente

#### Código

```csharp
// PostoAppService.cs
var postos = await _postoRepository.GetByClienteIdAsync(clienteId)
```

#### Flow de Dados

```
Usuario → Controller → AppService
                          ↓
                    IPostoRepository.GetByClienteIdAsync()
                          ↓
                    [CACHE CHECK] 🔍
                          ├─ CACHE HIT (60%)
                          │   └─ Return cached Postos with Cliente loaded
                          │
                          └─ CACHE MISS (40%)
                              ├─ Query: SELECT * FROM Posto WHERE ClienteId=x
                              │   └─ Include Posto.Cliente (eager)
                              │   └─ Include Posto.Tags.Tag
                              ├─ Cache resultado por 10 minutos
                              └─ Return Postos
```

#### Análise de N+1

```
✅ NÃO há N+1: Uma única query, Cliente já vem loaded
   Mesmo em loop: Cache evita múltiplas queries

   for (var clienteId in clienteIds) {
       var postos = await _postoRepository.GetByClienteIdAsync(clienteId);
       // Query 1: Cliente 1
       // Query 2: Cliente 2 (se não em cache)
       // Query 3: Cliente 3 (se não em cache)
   }
```

---

### Padrão 2️⃣: Obter Detalhe de um Posto

#### Código

```csharp
// PostoAppService.cs
var posto = await _postoRepository.GetByIdAsync(postoId)
```

#### Flow de Dados

```
Usuario → Controller → AppService
                          ↓
                    IPostoRepository.GetByIdAsync()
                          ↓
                    [PASS-THROUGH] ❌ NÃO CACHED
                          ↓
                    Query: SELECT * FROM Posto WHERE Id=x
                          ├─ Include Posto.Cliente (eager)
                          ├─ Include Posto.Tags.Tag
                          └─ Return Posto with Cliente
```

#### Análise de N+1

```
❌ RISCO: Se chamar GetByIdAsync em loop

   for (var postoId in postoIds) {
       var posto = await _postoRepository.GetByIdAsync(postoId);
       // Query 1: Posto 1
       // Query 2: Posto 2  ← N+1!
       // Query 3: Posto 3  ← N+1!
   }

✅ SOLUÇÃO: Usar GetAllAsync() (cached) + filter

   var todosPostos = await _postoRepository.GetAllAsync();
   var filtrado = todosPostos.Where(p => postoIds.Contains(p.Id));
   // Query 1: Todos Postos (cached)
   // Filter em memória ✅
```

**Recomendação:** Adicionar cache a GetByIdAsync com TTL de ~5 minutos.

---

### Padrão 3️⃣: Filtrar Postos por Critério

#### Código

```csharp
// AlocacaoAppService.cs
var postos = await _postoRepository.GetAllAsync();
var postosFiltrados = postos
    .Where(p => p.ClienteId == clienteId && p.Ativo)
    .ToList();
```

#### Flow de Dados

```
GetAllAsync()
    ├─ [CACHE CHECK]
    │   └─ Cache key: "Postos_{EmpresaId}"
    │
    ├─ CACHE MISS
    │   ├─ Query: SELECT * FROM Posto WHERE Ativo=true
    │   ├─ Include Posto.Cliente
    │   ├─ OrderBy Posto.CreatedAt
    │   ├─ Cache por 10 minutos
    │   └─ Return 500+ Postos em memória
    │
    └─ Filter em C# (memória)
        └─ Where ClienteId + Ativo
            └─ ~50 Postos resultado
```

#### Análise de Performance

```
⚙️ Custo:
  - Primeira chamada: 1 DB query
  - Próximas 600 segundos: 0 DB queries (cache hit)
  - Total: 1 query por 10 minutos

🎯 Quando é eficiente:
  - Múltiplas chamadas GetAllAsync (hit cache)
  - Filtros diversos (memória rápida)
  - N < 1000 Postos

⚠️ Quando é ineficiente:
  - Load muito alta (1M+ Postos em memória)
  - Filtros muito específicos (cache > resultado)
  - Solução: Usar Query específica (Future optimization)
```

---

### Padrão 4️⃣: Acessar Cliente através de Posto Navigation

#### Código

```csharp
// Em algum lugar que tem Posto carregado
var clientes = postos.Select(p => p.Cliente?.Nome).ToList();
```

#### Flow de Dados

```
Assumindo que Posto foi carregado via GetByClienteIdAsync():

Posto objeto na memória
    ├─ Posto.Cliente: Object já carregado (eager)
    │   └─ Cliente.Nome ✅ Acesso direto (sem query)
    │
    └─ Se Posto foi carregado via GetByIdAsync():
        ├─ Posto.Cliente: Object já carregado (eager)
        └─ Cliente.Nome ✅ Acesso direto (sem query)
```

#### Análise de N+1

```
✅ NÃO há N+1 quando eager loading está correto

❌ Haveria N+1 se lazy loading fosse ativado:
   // Com lazy loading habilitado no DbContext
   var posto = await _postoRepository.GetByIdAsync(postoId);
   var nomeCliente = posto.Cliente.Nome;  // Query adicional!
```

**Conclusão:** Eager loading está correto configurado, nenhum risco aqui.

---

## Padrões de Chamadas Cruzadas (Cross-Boundary)

### ⚠️ Usar IPostoRepository Diretamente

#### Localização 1: AlocacaoAppService

```csharp
public class AlocacaoAppService
{
    private readonly IPostoRepository _postoRepository;

    public async Task<...> GetAlocacoesComPostoAsync(Guid postoId, CancellationToken ct)
    {
        var alocacoes = await _alocacaoRepository.GetByPostoIdAsync(postoId);

        // Acesso direto a Posto dentro de Operacoes BC ✅ OK
        var posto = await _postoRepository.GetByIdAsync(postoId, ct);

        return alocacoes.Select(a => new AlocacaoDto(a.Id, posto.Nome)).ToList();
    }
}
```

**Status:** ✅ Dentro do mesmo BC (Operacoes), permitido.

#### Localização 2: PostoAppService

```csharp
public class PostoAppService
{
    private readonly IPostoRepository _repository;
    private readonly IClienteRepository _clienteRepository;

    public async Task<PostoComClienteDto> GetPostoComClienteAsync(Guid postoId, CancellationToken ct)
    {
        var posto = await _repository.GetByIdAsync(postoId, ct);

        // Acesso a Cliente (agregado do mesmo BC) ✅ OK
        var cliente = await _clienteRepository.GetByIdAsync(
            posto.ClienteId, ct);

        return new PostoComClienteDto(
            posto.Id,
            posto.Nome,
            cliente.Nome);
    }
}
```

**Status:** ✅ Dentro do mesmo BC (Operacoes), permitido.

#### Localização 3: OperacoesQueryAdapter (Whatsapp BC → Operacoes BC)

```csharp
public class OperacoesQueryAdapter : IOperacoesQueryPort
{
    private readonly IPostoRepository _postoRepository;  // ⚠️ Cross-BC
    private readonly IClienteRepository _clienteRepository;  // ⚠️ Cross-BC

    public async Task<IReadOnlyList<PostoResumo>> GetPostosByClienteAsync(
        Guid clienteId,
        CancellationToken ct)
    {
        // ⚠️ Anti-padrão: Direto repository injection
        var postos = await _postoRepository.GetByClienteIdAsync(clienteId);

        return postos.Select(p => new PostoResumo(p.Id, p.Nome)).ToList();
    }
}
```

**Status:** ⚠️ CROSS-BOUNDARY (Phase 4 já reconheceu, mas pode ficar por agora)

**Melhoria Futura:**

```csharp
// Criar interface em Operacoes BC que Whatsapp usa
public interface IOperacoesPostoQueryService
{
    Task<IReadOnlyList<PostoResumo>> GetPostosByClienteAsync(Guid clienteId);
}

// Implementação em Infrastructure
public class OperacoesPostoQueryService : IOperacoesPostoQueryService
{
    private readonly IPostoRepository _postoRepository;

    public async Task<IReadOnlyList<PostoResumo>> GetPostosByClienteAsync(Guid clienteId)
    {
        var postos = await _postoRepository.GetByClienteIdAsync(clienteId);
        return postos.Select(p => new PostoResumo(p.Id, p.Nome)).ToList();
    }
}

// Registrar em DI
services.AddScoped<IOperacoesPostoQueryService, OperacoesPostoQueryService>();
```

---

## Recomendações Finais

### ✅ Mantém Assim

| Padrão                                        | Status        | Razão                                                                   |
| --------------------------------------------- | ------------- | ----------------------------------------------------------------------- |
| **GetByClienteIdAsync com cache**             | ✅ Excelente  | Eager loading de Cliente, cache 10 min, sem N+1                         |
| **GetAllAsync com cache**                     | ✅ Bom        | Performance em múltiplos filtros, data pode estar ~10 min desatualizado |
| **Eager loading de Cliente em todas queries** | ✅ Necessário | Lógica de negócio precisa QuantidadeIdealPorTurno                       |
| **Navigation property Posto.Cliente**         | ✅ Correto    | Não há lazy loading, sempre eager                                       |

### ⚠️ Considerar Melhorias

| Melhoria                                | Impacto                                | Esforço                  |
| --------------------------------------- | -------------------------------------- | ------------------------ |
| **Cache GetByIdAsync**                  | Médio (alto N+1 risk em loops)         | Baixo (1 arquivo)        |
| **CachedAlocacaoRepository**            | Alto (Alocacao muito volátil)          | Médio (novo decorator)   |
| **Query composta PostoComCliente**      | Médio (evita eager loading redundante) | Médio (novo DTO/adapter) |
| **Extract IOperacoesPostoQueryService** | Baixo (já funciona)                    | Alto (refator cross-BC)  |

### 🚀 Roadmap Sugerido

**Sprint Próximo:**

1. ✅ Documentação (feito)
2. ⏳ Adicionar cache a GetByIdAsync Posto
3. ⏳ Implementar CachedAlocacaoRepository

**Sprint +2:** 4. ⏳ PostoComClienteQueryAdapter (query composta com cache-aside) 5. ⏳ PostoClienteCacheWarmupHandler (prefill cache após mudanças)

**Sprint +3:** 6. ⏳ Migrar OperacoesQueryAdapter para usar IOperacoesPostoQueryService 7. ⏳ Validação completa de cache em ambiente staging

---

## Diagrama Completo de Acesso

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENTE APP                               │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ListarClientes                                              │
│     └─ IClienteRepository.GetAllAsync()                         │
│        ├─ [CACHE] "Clientes_{EmpresaId}" (10 min) ✅          │
│        └─ Evento: ClienteCreatedEvent → invalidate cache       │
│                                                                  │
│  2. ListarPostosDoCliente                                       │
│     └─ IPostoRepository.GetByClienteIdAsync(clienteId)          │
│        ├─ [CACHE] "Postos_{EmpresaId}_Cliente_{id}" (10 min) ✅│
│        ├─ Include Posto.Cliente (eager)                        │
│        └─ Evento: PostoCreated/Updated/Deleted → invalidate    │
│                                                                  │
│  3. DetalhePostoCom Cliente                                     │
│     ├─ IPostoRepository.GetByIdAsync(postoId)                  │
│     │  ├─ [CACHE] ❌ Não cached (GAP!)                         │
│     │  ├─ Include Posto.Cliente (eager)                        │
│     │  └─ Recomendação: Adicionar cache 5 min                  │
│     │                                                            │
│     └─ Se chamar em loop: ❌ N+1 Risk                          │
│        Solução: GetAllAsync() + filter em memória ✅           │
│                                                                  │
│  4. ListarAlocacoesDoCliente                                    │
│     └─ IAlocacaoRepository.GetByClienteIdAsync(clienteId)       │
│        ├─ [CACHE] ❌ Não cached (IMPROVEMENT!)                 │
│        └─ Recomendação: Adicionar cache 60s (volátil)          │
│                                                                  │
│  5. ListarDiáriasDoCliente                                      │
│     └─ IDiariaRepository.GetAllAsync()                          │
│        ├─ [CACHE] ❌ Não cached (IMPROVEMENT!)                 │
│        └─ Recomendação: Adicionar cache 60s (volátil)          │
│                                                                  │
└────────────────────────────────────────────────────────────────┘

Legend:
  ✅ Implementado e otimizado
  ⚠️ Implementado mas pode melhorar
  ❌ Não implementado (gap)
```
