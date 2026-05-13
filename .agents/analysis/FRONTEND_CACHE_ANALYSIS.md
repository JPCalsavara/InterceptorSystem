# Frontend Cache Architecture - Análise Completa

**Data:** 24 de março de 2026  
**Status:** Análise de Caching em Produção (Angular 21)

---

## 1. Estratégia Multi-Camada de Cache

### 1.1 In-Memory Cache (Signal-Based) ✅

**Pattern:** Angular Signals + RxJS Observables

```typescript
// Padrão usado em TODOS os 7 services
private _cache = signal<Entity[] | null>(null);

getAll(): Observable<Entity[]> {
  const cached = this._cache();
  if (cached !== null) return of(cached);  // Cache hit

  return this.http.get<Entity[]>('/api/...').pipe(
    tap(data => this._cache.set(data)),    // Populate cache
    finalize(() => this.loading.set(false))
  );
}
```

**Serviços com Cache:**
| Service | Métodos | Invalidação | Storage |
|---------|---------|------------|---------|
| FuncionarioService | getAll() | ✅ Via coordinator | Memory |
| PostoService | getAll() | ✅ Via coordinator | Memory |
| AlocacaoService | getAll() | ✅ Via coordinator | Memory |
| DiariaService | getAll() | ✅ Via coordinator | Memory |
| ClienteService | getAll() | ✅ Via coordinator | Memory |
| ContratoService | getAll() | ✅ Via coordinator | Memory |
| TagService | getAll() | ✅ Via coordinator | Memory |

**TTL:** ∞ (until invalidated ou reload app)

---

### 1.2 RxJS shareReplay Cache 📡

**Localização:** `IbgeService` (dados do governo)

```typescript
// States - lazy init com shareReplay
private estadosCache$?: Observable<IbgeEstado[]>;

getEstados(): Observable<IbgeEstado[]> {
  if (!this.estadosCache$) {
    this.estadosCache$ = this.http.get<IbgeEstado[]>(IBGE_ESTADOS_URL)
      .pipe(shareReplay(1));  // Share + replay latest value
  }
  return this.estadosCache$;
}

// Municipios - per state caching
private municipiosCache: { [uf: string]: Observable<IbgeMunicipio[]> } = {};

getMunicipios(uf: string): Observable<IbgeMunicipio[]> {
  if (!this.municipiosCache[uf]) {
    this.municipiosCache[uf] = this.http.get<IbgeMunicipio[]>(`IBGE_URL/${uf}`)
      .pipe(shareReplay(1));
  }
  return this.municipiosCache[uf];
}
```

**Vantagem:** Múltiplos subscribers → 1 HTTP request  
**TTL:** ∞ (session duration)

---

### 1.3 LocalStorage Cache 💾

**Dados Persistentes Entre Sessões:**

```typescript
// AuthService.ts
private _authToken = signal<string | null>(
  localStorage.getItem('auth_token')
);

private _authUser = signal<User | null>(
  localStorage.getItem('auth_user')
    ? JSON.parse(localStorage.getItem('auth_user')!)
    : null
);

// Quando faz login
login(credentials): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
    tap(response => {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      this._authToken.set(response.token);
      this._authUser.set(response.user);
    })
  );
}
```

**Dados Armazenados:**

- `auth_token` - JWT para autenticação
- `auth_user` - Dados do usuário logado
- `layout.sidebarCollapsed` - Preferência de UI
- Tema escolhido (dark/light mode)

**TTL:** ∞ (ou até clear localStorage / logout)

---

## 2. Cache Invalidation - Dependency Graph

### 2.1 Entity Cache Coordinator Service

**Arquivo:** `entity-cache-coordinator.service.ts`

**Conceito:** Grafo de dependências para invalidação em cascata

```
          cliente
           /    \
          /      \
      posto    contrato
       /  \      /  \
      /    \    /    \
  alocacao diaria funcionario
      \     /          /
       \   /          /
        \ /          /
       tag ◄────────┘
```

**Implementação:**

```typescript
private dependencyGraph = {
  cliente: ['posto', 'alocacao', 'diaria', 'contrato', 'funcionario'],
  contrato: ['funcionario', 'diaria'],
  posto: ['alocacao', 'diaria'],
  alocacao: ['diaria'],
  funcionario: ['diaria'],
  tag: ['funcionario', 'contrato', 'diaria']
};

invalidateWithDependencies(entity: string): void {
  // 1. Invalida o próprio entity
  this.invalidators[entity]?.();

  // 2. Invalida todos os dependentes (transitivamente)
  const dependents = this.dependencyGraph[entity] || [];
  dependents.forEach(dep => this.invalidateWithDependencies(dep));
}
```

### 2.2 Registration Pattern

```typescript
// Em cada service (ex: PostoService)
constructor(
  private http: HttpClient,
  private cacheCoordinator: EntityCacheCoordinatorService
) {
  // Registra function que limpa o cache
  this.cacheCoordinator.registerInvalidator('posto', () => {
    this._cache.set(null);  // Clear cache
  });
}

// Quando POST/PUT/DELETE sucede
create(data): Observable<Posto> {
  return this.http.post<Posto>('/api/postos', data).pipe(
    tap(newPosto => {
      this.cacheCoordinator.invalidateWithDependencies('posto');
      // Cascata: alocacao, diaria também são invalidadas
    })
  );
}
```

---

## 3. HTTP Interceptors

### 3.1 Auth Interceptor

**Padrão:** Modern functional interceptor (Angular 15+)

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("auth_token");

  // Skipa external APIs
  if (!req.url.includes("/api/")) {
    return next(req);
  }

  // Add Bearer token
  if (token) {
    const modifiedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(modifiedReq);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear auth cache
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        // Redirect to login
        window.location.href = "/login";
      }
      return throwError(() => error);
    }),
  );
};
```

**🚫 NÃO há cache interceptor HTTP** (sem ETags, sem Cache-Control headers)

---

## 4. Gaps de Cache Identificados

| Gap                           | Impacto | Localização    | Solução                                        |
| ----------------------------- | ------- | -------------- | ---------------------------------------------- |
| **Sem auto-expiration**       | Medium  | services/\*.ts | Adicionar TTL com `interval()` + `takeUntil()` |
| **Sem cache headers**         | Low     | Frontend setup | Backend enviar `Cache-Control` headers         |
| **Sem request deduplication** | Medium  | HTTP layer     | Implementar `switchMap` com cache check        |
| **Sem prefetching**           | Low     | App boot       | Pre-carregar dados iniciais                    |
| **Sem sessionStorage**        | Low     | Auth/cache     | Usar sessionStorage para session data          |
| **getById não cached**        | Medium  | services/\*.ts | Adicionar cache por id                         |

### 4.1 Exemplo: Cache com TTL

```typescript
// ANTES: Sem TTL
getAll(): Observable<Entity[]> {
  const cached = this._cache();
  if (cached !== null) return of(cached);
  return this.http.get<Entity[]>(url).pipe(tap(data => this._cache.set(data)));
}

// DEPOIS: Com TTL
private _cacheExpiration = signal<number | null>(null);

getAll(): Observable<Entity[]> {
  const cached = this._cache();
  const expiration = this._cacheExpiration();
  const now = Date.now();

  if (cached !== null && expiration && now < expiration) {
    return of(cached);  // Cache válido
  }

  return this.http.get<Entity[]>(url).pipe(
    tap(data => {
      this._cache.set(data);
      this._cacheExpiration.set(now + 5 * 60 * 1000);  // 5 min TTL
    })
  );
}
```

---

## 5. Comparação: Frontend vs Backend Cache

| Aspecto            | Frontend (Angular)      | Backend (.NET)                     |
| ------------------ | ----------------------- | ---------------------------------- |
| **Tecnologia**     | Signals + RxJS          | MemoryCache + MediatR              |
| **Métodos Cached** | getAll()                | GetAllAsync, GetByClienteIdAsync   |
| **TTL**            | ∞ (manual invalidation) | 10 min (Stable), 60 seg (Volatile) |
| **Invalidation**   | Dependency graph        | Domain events + handlers           |
| **Scope**          | Session                 | Per tenant + global                |
| **Distributed**    | N/A (single browser)    | Could be Redis future              |
| **Status**         | ✅ Implemented          | ✅ Implemented (Phase 5)           |

---

## 6. Recomendações Frontend

### Imediata

1. ✅ Manter padrão Signal-based (funciona bem)
2. ✅ Dependency graph está correto
3. ✅ Invalidação em cascata implementada

### Curto Prazo (1-2 sprints)

4. ⏳ Adicionar TTL com signal tracking
5. ⏳ Implementar getById cache (cache por id)
6. ⏳ Request deduplication para simultaneous calls

### Médio Prazo (2-3 sprints)

7. ⏳ Storage strategy: sessionStorage para dados não-persistentes
8. ⏳ Backend enviando `Cache-Control` headers
9. ⏳ Prefetching de dados críticos

### Futuro (Não prioritário)

10. ⏳ ETags + conditional requests (If-None-Match)
11. ⏳ Service Worker + offline cache
12. ⏳ Compression de cache (ngx-lz4)

---

## 7. Code Examples: Frontend Cache Extension

### 7.1 Adicionar getById Cache

```typescript
// No PostoService
private _byIdCache = signal<{ [id: string]: Posto }>({});

getById(id: Guid): Observable<Posto> {
  const cache = this._byIdCache()[id];
  if (cache) return of(cache);

  return this.http.get<Posto>(`/api/postos/${id}`).pipe(
    tap(posto => {
      const current = this._byIdCache();
      this._byIdCache.set({ ...current, [id]: posto });
    })
  );
}
```

### 7.2 TTL-Based Expiration

```typescript
// Centralizado
export class CacheWithTTL<T> {
  private _data = signal<T | null>(null);
  private _expiration = signal<number | null>(null);
  private _ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    // 5 min default
    this._ttlMs = ttlMs;
  }

  isValid(): boolean {
    return (
      this._data() !== null &&
      this._expiration !== null &&
      Date.now() < this._expiration()!
    );
  }

  get(): T | null {
    return this.isValid() ? this._data() : null;
  }

  set(data: T): void {
    this._data.set(data);
    this._expiration.set(Date.now() + this._ttlMs);
  }

  clear(): void {
    this._data.set(null);
    this._expiration.set(null);
  }
}

// Uso
export class PostoService {
  private _cache = new CacheWithTTL<Posto[]>(5 * 60 * 1000); // 5 min

  getAll(): Observable<Posto[]> {
    const cached = this._cache.get();
    if (cached) return of(cached);

    return this.http
      .get<Posto[]>("/api/postos")
      .pipe(tap((data) => this._cache.set(data)));
  }
}
```

### 7.3 Request Deduplication

```typescript
// No service
private _getAll$ = new Subject<void>();
private _cache = signal<Posto[] | null>(null);

constructor() {
  this._getAll$.pipe(
    switchMap(() => {
      const cached = this._cache();
      if (cached !== null) return of(cached);
      return this.http.get<Posto[]>('/api/postos').pipe(
        tap(data => this._cache.set(data))
      );
    }),
    shareReplay(1)
  ).subscribe();  // Keep hot
}

getAll(): Observable<Posto[]> {
  this._getAll$.next();  // Trigger if needed
  return this._getAll$.asObservable();
}
```

---

## 8. Conclusão Frontend

**Status:** ✅ Frontend cache bem arquitetado

**Pontos Fortes:**

- ✅ Signal-based cache transparente e reativo
- ✅ Dependency graph automático para invalidação
- ✅ localStorage para dados persistentes
- ✅ RxJS shareReplay para APIs externas
- ✅ Auth interceptor robusto

**Gaps Identificados:**

- ⏳ Sem TTL automático (∞ até reload)
- ⏳ Sem getById cache (redundante se tem getAll)
- ⏳ Sem request deduplication (múltiplas chamadas = múltiplos requests)

**Alignamento com Backend:**

- ✅ Frontend invalida em cascata (como backend)
- ✅ Ambos usam padrão de Cache Decorator
- ✅ Ambos focam em ter dados sempre frescos (event-driven)
