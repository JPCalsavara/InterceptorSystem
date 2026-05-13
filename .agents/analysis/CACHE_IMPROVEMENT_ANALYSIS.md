# Análise de Melhoria do Sistema de Cache e Relações de Entidades

**Data:** 24 de março de 2026  
**Status:** Análise Completa + Recomendações  
**Prioridade:** Medium (Cache está funcional, mas pode ser optimizado)

---

## 1. Estado Atual do Sistema de Cache ✅

### 1.1 Arquitetura Existente

**Padrão:** Decorator com MediatR Event-Driven Invalidation

```
IPostoRepository (interface)
    ↑
    ├─ PostoRepository (concrete)
    │   └─ Accesses: _context.Postos
    │
    └─ CachedPostoRepository (decorator)
        ├─ Wraps: PostoRepository
        ├─ Caches: GetAllAsync(), GetByClienteIdAsync()
        ├─ Pass-through: Add(), Update(), Remove(), GetByIdAsync(), GetPagedAsync()
        └─ TTL: 10 minutes fixed
```

### 1.2 Repositórios com Cache

| Repositório     | Métodos Cached                                  | Eventos Invalidam                     |
| --------------- | ----------------------------------------------- | ------------------------------------- |
| **Cliente**     | GetAllAsync                                     | ✅ ClienteCreated/Updated/Deleted     |
| **Contrato**    | GetAllAsync, GetByClienteIdAsync                | ✅ ContratoCreated/Updated/Deleted    |
| **Posto**       | GetAllAsync, GetByClienteIdAsync                | ✅ PostoCreated/Updated/Deleted       |
| **Funcionario** | GetAllAsync, GetByClienteIdAsync, GetByCpfAsync | ✅ FuncionarioCreated/Updated/Deleted |

### 1.3 Repositórios SEM Cache (Volatilidade Alta)

| Repositório  | Razão Provável                                      |
| ------------ | --------------------------------------------------- |
| **Alocacao** | Criada/modificada constantemente (aloc diárias)     |
| **Diaria**   | Volátil (status: pendente → confirmada → cancelada) |
| **Tag**      | Baixa mutação, mas sem load crítico                 |

### 1.4 Eventos de Domínio Já Implementados

- ✅ **18 Domain Events** (Create/Update/Delete para 6 agregados)
- ✅ **4 Cache Invalidation Handlers** (listening via MediatR.INotificationHandler)
- ✅ **Automatic Dispatch** (ApplicationDbContext publica após SaveChangesAsync suceder)
- ✅ **Tenant Isolation** (EmpresaId em todas as cache keys)

---

## 2. Análise de Uso: Cliente ↔ Posto 🔗

### 2.1 Relacionamento no Modelo de Domínio

```csharp
// Cliente.cs
public ICollection<Posto> Postos { get; private set; } = new List<Posto>();

// Posto.cs
public Guid ClienteId { get; private set; }                // Foreign key
public Cliente? Cliente { get; private set; }              // Navigation prop
```

**Tipo:** One-to-Many (1 Cliente : N Postos)  
**Direção:** Cliente possui Postos; Posto referencia Cliente

### 2.2 Estratégia de Carregamento: EAGER LOADING

```csharp
// PostoRepository.cs - TODAS as queries fazem Include(p => p.Cliente)
public async Task<Posto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
{
    return await _context.Postos
        .Include(p => p.Cliente)              // ← SEMPRE carrega Cliente
        .Include(p => p.Tags).ThenInclude(pt => pt.Tag)
        .FirstOrDefaultAsync(p => p.Id == id && p.Ativo, cancellationToken);
}

public async Task<IReadOnlyList<Posto>> GetByClienteIdAsync(Guid clienteId, CancellationToken cancellationToken = default)
{
    return await _context.Postos
        .Where(p => p.ClienteId == clienteId)
        .Include(p => p.Cliente)              // ← SEMPRE carrega Cliente
        .Include(p => p.Tags).ThenInclude(pt => pt.Tag)
        .OrderBy(p => p.CreatedAt)
        .ToListAsync(cancellationToken);
}
```

**Razão:** Comentário no código:

```
// FASE 4: Eager loading do Cliente necessário para QuantidadeIdealFuncionarios
// (vem de Cliente.QuantidadeIdealPorTurno)
```

**Ponto de Atenção:** Quando GetByClienteIdAsync é chamado de dentro de um loop, carrega Cliente redundantemente.

### 2.3 Padrões de Acesso

#### Padrão 1: Acesso via ClienteId (Comum)

```csharp
// AlocacaoAppService.cs
var postos = await _postoRepository.GetByClienteIdAsync(clienteId);
// ✅ Direto e eficiente
// ❌ Carrega Cliente N vezes (uma por Posto)
```

#### Padrão 2: Acesso via Função Específica (Raro)

```csharp
var posto = await _postoRepository.GetByIdAsync(postoId);
// ✅ Usa GetByIdAsync (não há método específico alternativo)
// ❌ Pass-through, não cached
```

#### Padrão 3: Acesso via AppService (Aplicação)

```csharp
// PostoAppService.cs
return await _repository.GetAllAsync();     // Cache de GetAllAsync
return await _repository.GetByClienteIdAsync(clienteId);  // Cache de per-client
```

#### Padrão 4: Acesso Cruzado (Adapter)

```csharp
// OperacoesQueryAdapter.cs (Whatsapp BC)
public async Task<IReadOnlyList<PostoResumo>> GetPostosByClienteAsync(Guid clienteId, CancellationToken ct)
{
    var postos = await _postoRepository.GetByClienteIdAsync(clienteId);
    // ⚠️ Cross-bounded-context dependency (anti-padrão arquitetural)
    // ✅ Mas aproveita cache de Operacoes
}
```

### 2.4 Impacto de N+1 Queries

**Cenário:** ListarDiárias para um Posto

```
User → GET /diarias?postoId=123

AlocacaoAppService.GetDiariasByPostoAsync(postoId)
    ├─ SELECT Alocacao WHERE PostoId = 123           [1 query]
    └─ FOR EACH Alocacao:
        └─ SELECT Posto WHERE id = 123               [N queries!]
            └─ Include Cliente
```

**Solução Atual:** GetByClienteIdAsync cached por ClienteId, mas N+1 ainda ocorre se callers fazem loop.

---

## 3. Oportunidades de Melhoria 🚀

### 3.1 Estender Cache para Alocacao e Diaria

**Situação Atual:**

- Alocacao: Sem cache (criação/update/delete frequente)
- Diaria: Sem cache (estado volátil)

**Proposta:**

```csharp
// CachedAlocacaoRepository - Decorator
// Cached methods:
// - GetAllAsync()           // Todos alocações do tenant
// - GetByFuncionarioIdAsync()  // Alocações de um funcionário
// - GetByPostoIdAsync()     // Alocações de um posto
// - GetPagedAsync()         // Paginado com cache curto (1 min)

// TTL: 1-2 minutos (vs 10 min para Cliente/Posto/Contrato)
// Invalidação: Via AlocacaoCreated/Updated/DeletedEvent
```

**Benefício:** Filtros eficientes em dashboards de alocação.

### 3.2 Cache-Aside para Queries Compostas

```csharp
// Novo método em OperacoesQueryPort
Task<IReadOnlyList<PostoComClienteResumo>> GetPostosComClienteAsync(
    Guid clienteId,
    CancellationToken ct);
```

**Implementação:**

```csharp
// OperacoesQueryAdapter
public async Task<IReadOnlyList<PostoComClienteResumo>> GetPostosComClienteAsync(
    Guid clienteId, CancellationToken ct)
{
    var cacheKey = $"PostosComCliente_{empresaId}_{clienteId}";

    if (!_cache.TryGetValue(cacheKey, out IReadOnlyList<PostoComClienteResumo>? resultado))
    {
        var cliente = await _clienteRepository.GetByIdAsync(clienteId, ct);

        resultado = cliente.Postos
            .Select(p => new PostoComClienteResumo(
                p.Id,
                p.Nome,
                cliente.Nome,
                cliente.QuantidadeIdealPorTurno))
            .ToList();

        _cache.Set(cacheKey, resultado, TimeSpan.FromMinutes(5));
    }

    return resultado;
}
```

**Benefício:** Evita N queries para obter Cliente + Postos juntos.

### 3.3 Event-Driven Cache Prefill (Warm-up)

```csharp
// Novo handler
public class PostoClienteCacheWarmupHandler :
    INotificationHandler<ClienteCreatedEvent>,
    INotificationHandler<ClienteUpdatedEvent>
{
    public async Task Handle(ClienteUpdatedEvent notification, CancellationToken ct)
    {
        // Pré-carrega cache de Postos quando Cliente é atualizado
        var postos = await _postoRepository.GetByClienteIdAsync(
            notification.ClienteId, ct);

        // Cache agora está "quente" para próximas queries
    }
}
```

**Benefício:** Cache sempre atualizado após operações críticas.

### 3.4 TTL Diferenciado por Tipo de Dados

| Repositório     | TTL Sugerido | Razão                                 |
| --------------- | ------------ | ------------------------------------- |
| **Cliente**     | 20 min       | Muda pouco (gestores de cliente)      |
| **Contrato**    | 15 min       | Updates ocasionais (renovações)       |
| **Posto**       | 10 min       | Pode mudar com frequência (locais)    |
| **Funcionario** | 5 min        | Admissões/demissões frequentes        |
| **Alocacao**    | 2 min        | MUITO volátil (confirmação constante) |
| **Diaria**      | 1 min        | EXTREMAMENTE volátil (status)         |

**Implementação:**

```csharp
public class CachedAlocacaoRepository : IAlocacaoRepository
{
    private const int CACHE_TTL_SECONDS = 60;  // 1 min vs 600 (10 min) dos outros

    public async Task<IReadOnlyList<Alocacao>> GetAllAsync(CancellationToken ct)
    {
        var key = $"Alocacoes_{empresaId}";

        if (!_cache.TryGetValue(key, out IReadOnlyList<Alocacao>? result))
        {
            result = await _decorated.GetAllAsync(ct);
            _cache.Set(key, result, TimeSpan.FromSeconds(CACHE_TTL_SECONDS));
        }

        return result;
    }
}
```

**Benefício:** Balance entre performance e consistência.

### 3.5 Cache Key Strategy Melhorada

**Estratégia Atual (simples):**

```
PostosCliente_{EmpresaId}_Cliente_{ClienteId}
```

**Estratégia Proposta (Hierárquica):**

```
// Prefixo por BC
Operacoes:Posto_{EmpresaId}
Operacoes:Posto_{EmpresaId}:Cliente_{ClienteId}

// Com filtros
Operacoes:Posto_{EmpresaId}:Ativo_true
Operacoes:Alocacao_{EmpresaId}:Funcionario_{FuncionarioId}

// Com paginação (opcional)
Operacoes:Posto_{EmpresaId}:Page_1:Size_20
```

**Benefício:** Hierarquia clara para invalidação em cascade.

---

## 4. Recomendação Final 💡

### Roadmap de Implementação

**Fase Imediata (Próxima Sprint):**

1. ✅ Documentar padrões atuais (este documento)
2. ✅ Analisar problemas de N+1 em endpoints críticos
3. ⏳ **IMPLEMENTAR:** CachedAlocacaoRepository com TTL=60s
4. ⏳ **IMPLEMENTAR:** PostoComClienteResumo DTO + query adaptada

**Fase 2 (Futuro):** 5. ⏳ CachedDiariaRepository com TTL=60s 6. ⏳ Event-based prefill handlers 7. ⏳ Cache key hierarchy refactoring

**Não Recomendado (custo/benefício baixo):**

- ❌ Cache distribuído (Redis) - Monolito não justifica ainda
- ❌ Cache Layer na API - Complexidade > ganho
- ❌ Query Result Caching com CQRS - Fase futura

---

## 5. Achados de Uso de Posto 📊

### 5.1 Where Posto is Accessed Directly

| Service                   | Método                       | Cache Impacto                   |
| ------------------------- | ---------------------------- | ------------------------------- |
| **PostoAppService**       | GetAllAsync                  | ✅ CACHED via decorator         |
| **PostoAppService**       | GetByClienteIdAsync          | ✅ CACHED via decorator         |
| **PostoAppService**       | CRUD ops (Add/Update/Remove) | ❌ Pass-through (correto)       |
| **AlocacaoAppService**    | GetByClienteIdAsync          | ✅ CACHED via decorator         |
| **OperacoesQueryAdapter** | GetPostosByClienteAsync      | ✅ CACHED via adapter chain     |
| **ClienteRepository**     | Include(p => p.Postos)       | ❌ Não cached (eager dentro EF) |

### 5.2 Recomendação para Cliente → Posto

**Pergunta:** _"Um cliente sempre pega posto de cliente ou faz chamada direta de posto?"_

**Resposta:** Depende do contexto:

```
┌─ Contexto: LISTAR postos
│  └─ Via: GetByClienteIdAsync() + cache
│  └─ Eficiente ✅

├─ Contexto: DETALHE de um posto
│  └─ Via: GetByIdAsync() + Include(Cliente)
│  └─ Não cached (pass-through)
│  └─ Recomendação: Cache individual Posto com TTL~5min

└─ Contexto: GRÁFICO de Cliente com Postos
   └─ Via: Cliente.Postos (lazy, mas já loaded via Include)
   └─ Recomendação: Novo DTO ComPostoResumo com cache
```

**Padrão Recomendado:**

- ✅ Use GetByClienteIdAsync() para listas (já cached)
- ✅ Cache individual Posto em GetByIdAsync() (novo)
- ✅ Crie PostoWithClienteResumo DTO para compounds queries
- ❌ Evite múltiplas chamadas GetByIdAsync em loops (use GetByClienteIdAsync + filter)

---

## 6. Conclusão

### Status: ✅ Bem Arquitetado

O sistema atual usa **Decorator Pattern + MediatR Event-Driven Invalidation** corretamente:

- ✅ Cache transparent (consumers não sabem que existem)
- ✅ Event-based invalidation (sem polling)
- ✅ Tenant-aware isolation
- ✅ TTL configurável

### Gaps Identificados

| Gap                           | Impacto                  | Solução                      |
| ----------------------------- | ------------------------ | ---------------------------- |
| Alocacao/Diaria sem cache     | Performance em reads     | Adicionar cached decorators  |
| GetByIdAsync Posto não cached | N+1 risk em loops        | Adicionar cache via evento   |
| Composite queries sem cache   | Queries N+1              | DTOs compostos + cache aside |
| TTL fixo (10 min all)         | Pode ser obsoleto rápido | Usar TTL diferenciado        |

### Próximo Passo Recomendado

Implementar **CachedAlocacaoRepository** como prova de conceito para validar padrão com dados mais voláteis.
