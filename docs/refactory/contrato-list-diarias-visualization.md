# Planejamento: Visualização Dinâmica de Diárias e Tags no `contrato-list`

> **Status:** ✅ Implementação completa — 6/6 fases concluídas (27/03/2026)
>
> **Testes:** 212/212 ✓ &nbsp;|&nbsp; **Frontend build:** sem erros &nbsp;|&nbsp; **Migration:** aplicada
>
> **Branch:** `refactory/domain-refactoring`

## Contexto

O `contrato-list` exibe atualmente um board kanban com cards por contrato. Cada card mostra métricas financeiras estáticas (faturamento, custo estimado, lucro) e uma string de preview das tags com seus valores de diária negociados (`getTagRatesPreview`). O custo mensal é calculado no frontend com uma fórmula estimada usando 15 dias hardcoded para escala 12x36, sem consultar as diárias reais registradas no sistema.

O objetivo desta feature é substituir (e complementar) esses estimados por dados reais de diárias, agrupados por tag, com filtro dinâmico de período.

---

## Problemas Atuais

| #   | Problema                                             | Impacto                                                 |
| --- | ---------------------------------------------------- | ------------------------------------------------------- |
| 1   | `DiariaDtoOutput` não expõe `ValorDiaria`            | Impossível calcular custo real de diárias via API       |
| 2   | `Diaria` não armazena qual `TagId` foi aplicado      | Impossível agrupar diárias por tag sem heurística       |
| 3   | Nenhum endpoint retorna diárias por `ContratoId`     | Sem forma de buscar diárias de um contrato específico   |
| 4   | Custo calculado no frontend com `dias = 15` fixo     | Custo exibido no card não reflete realidade operacional |
| 5   | Preview de tags no card é texto plano (mês genérico) | Sem dinâmica de período, sem contagem de diárias reais  |

---

## Solução Proposta

### Visão do card (após a feature)

```
┌─────────────────────────────────────────────────────────┐
│  Cliente XYZ                                            │
│  Contrato de Vigilância Patrimonial                     │
├─────────────────────────────────────────────────────────┤
│  Valor Mensal      Custo Real     Lucro Real            │
│  R$ 28.000         R$ 21.340      R$ 6.660              │
├─────────────────────────────────────────────────────────┤
│  [◄] Mar/2026 [►]          39 diárias · R$ 18.200       │
│  ┌──────────────────────────────────────────┐           │
│  │  PM Vigilante     15 diárias · R$ 7.500  │           │
│  │  Supervisor        8 diárias · R$ 4.200  │           │
│  │  Vigia Avulso     16 diárias · R$ 6.500  │           │
│  └──────────────────────────────────────────┘           │
│  ✓ Confirmadas: 35   ✗ Faltas: 4                       │
├─────────────────────────────────────────────────────────┤
│  Vence em 127 dias         [Ver] [Editar] [Excluir]    │
└─────────────────────────────────────────────────────────┘
```

### Seletor global de período no header da página

```
Contratos  [◄ Fev/2026]  [Mar/2026 ▼]  [Abr/2026 ►]   + Novo Contrato
```

---

## Fases de Implementação

---

### Fase 1 — Backend: Adicionar `TagId` à entidade `Diaria` e expor `ValorDiaria` no DTO ✅

**Objetivo:** Registrar qual tag originou o valor da diária no momento da criação, e expor esse dado via API.

#### 1.1 Entidade `Diaria`

**Arquivo:** `Domain/BoundedContexts/Operacoes/Aggregates/Diaria.cs`

- Adicionar `public Guid? TagId { get; private set; }` (nullable para compatibilidade retroativa)
- Atualizar o construtor para aceitar `Guid? tagId` e atribuir `TagId = tagId`
- A propriedade `ValorDiaria` já existe na entidade — verificar que é `public`

#### 1.2 Configuração EF Core

**Arquivo:** `Infrastructure/Persistence/Configurations/DiariaConfiguration.cs`

- Adicionar `builder.Property(d => d.TagId).IsRequired(false)`
- Adicionar FK nullable: `builder.HasOne<Tag>().WithMany().HasForeignKey(d => d.TagId).IsRequired(false).OnDelete(DeleteBehavior.SetNull)`

#### 1.3 `DiariaAppService` — passar `tagId` resolvido na criação

**Arquivo:** `Application/BoundedContexts/Operacoes/Services/DiariaAppService.cs`

Atualizar `CreateAsync` e `CreateBatchAsync` para identificar o `TagId` que gerou o `ValorDiaria`:

```csharp
var (valorDiaria, tagIdResolvido) = ResolverTagEValorDiaria(funcionario, contrato);
var diaria = new Diaria(input.FuncionarioId, input.AlocacaoId, input.Data,
    valorDiaria, tagIdResolvido, input.StatusDiaria, input.TipoDiaria);
```

O método auxiliar `ResolverTagEValorDiaria` retorna `(decimal valor, Guid? tagId)`, selecionando o par cuja `ValorDiaria` é o maior na interseção `FuncionarioTag x ContratoTag`.

#### 1.4 DTO de saída

**Arquivo:** `Application/BoundedContexts/Operacoes/DTOs/DiariaDto.cs`

- Adicionar `decimal ValorDiaria` e `Guid? TagId` ao `DiariaDtoOutput`
- Atualizar o mapeamento `FromEntity` para incluir os dois campos

#### 1.5 Migration

Nome: `AddTagIdToMDiaria_ExposeValorDiaria`

Operações:

- `AddColumn`: `Diarias.TagId` — `uniqueidentifier`, nullable, FK para `Tags.Id` com `SetNull`
- Sem impacto em dados existentes (campo nullable)

#### Critérios de aceite

- [x] `Diaria.TagId` é persistido corretamente ao criar diária via `POST /api/diarias`
- [x] `GET /api/diarias/{id}` retorna `valorDiaria` e `tagId` no JSON de resposta
- [x] Diárias criadas antes da migration têm `tagId = null` (sem quebra de dados)
- [x] `dotnet test` passa sem regressões (alvo: ≥ 204/204) — 204/204 ✓
- [x] Migration aplicada sem erros com `dotnet ef database update`

---

### Fase 2 — Backend: Endpoint de resumo de diárias por contrato ✅

**Objetivo:** Expor via API um resumo agregado das diárias de um contrato em um período, agrupado por tag e por status.

#### 2.1 Novo DTO

**Arquivo:** `Application/BoundedContexts/Operacoes/DTOs/DiariaDto.cs`

```csharp
record DiariaTagResumoDto(
    Guid? TagId,
    string TagNome,
    int QuantidadeDiarias,
    decimal TotalValor);

record DiariasContratoResumoDto(
    Guid ContratoId,
    int Ano,
    int Mes,
    int TotalDiarias,
    decimal TotalValorDiarias,
    int TotalConfirmadas,
    int TotalFaltas,
    int TotalCanceladas,
    IReadOnlyList<DiariaTagResumoDto> ResumoByTag);
```

#### 2.2 Repositório

**Arquivo:** `Domain/BoundedContexts/Operacoes/Interfaces/IDiariaRepository.cs`

Adicionar:

```csharp
Task<IEnumerable<Diaria>> GetByContratoIdAsync(Guid contratoId, DateOnly inicio, DateOnly fim);
```

**Arquivo:** `Infrastructure/Persistence/Repositories/DiariaRepository.cs`

Implementar com:

```csharp
_ctx.Diarias
    .Include(d => d.Alocacao)
    .Where(d => d.Alocacao!.ContratoId == contratoId
             && d.Data >= inicio && d.Data <= fim)
```

#### 2.3 Interface e Service

**Arquivo:** `Application/BoundedContexts/Operacoes/Interfaces/IDiariaAppService.cs`

Adicionar:

```csharp
Task<DiariasContratoResumoDto> GetResumoByContratoAsync(Guid contratoId, int ano, int mes);
```

**Arquivo:** `Application/BoundedContexts/Operacoes/Services/DiariaAppService.cs`

Implementar agrupando as diárias por `TagId` e cruzando com `ContratoTag` para obter o nome da tag.

#### 2.4 Controller

**Arquivo:** `Api/Controllers/DiariasController.cs`

Adicionar endpoint:

```
GET /api/diarias/contrato/{contratoId}/resumo?ano=2026&mes=3
```

Retorna `DiariasContratoResumoDto`. Parâmetros `ano` e `mes` com default para o mês corrente.

#### Critérios de aceite

- [x] `GET /api/diarias/contrato/{id}/resumo?ano=2026&mes=3` retorna JSON com `totalDiarias`, `totalValorDiarias`, `resumoByTag`
- [x] `resumoByTag` agrupa corretamente por `tagId` (ou `null` para diárias sem tag)
- [x] Sem diárias no período retorna totais zerados e `resumoByTag = []`
- [x] Período respeitado: diárias fora do mês não aparecem nos totais
- [x] `totalConfirmadas + totalFaltas + totalCanceladas == totalDiarias`
- [x] `dotnet test` sem regressões — 204/204 ✓

---

### Fase 3 — Frontend: Model, Service e seletor de período ✅

**Objetivo:** Criar os tipos e o serviço para consumir o novo endpoint, e um signal global de período no `contrato-list`.

#### 3.1 Models

**Arquivo:** `frontend/src/app/models/index.ts`

Adicionar:

```typescript
interface DiariaTagResumo {
  tagId: string | null;
  tagNome: string;
  quantidadeDiarias: number;
  totalValor: number;
}

interface DiariasContratoResumo {
  contratoId: string;
  ano: number;
  mes: number;
  totalDiarias: number;
  totalValorDiarias: number;
  totalConfirmadas: number;
  totalFaltas: number;
  totalCanceladas: number;
  resumoByTag: DiariaTagResumo[];
}
```

Atualizar `Diaria`:

```typescript
valorDiaria: number;  // já existe, confirmar presença
tagId?: string | null;  // NOVO
```

#### 3.2 Service

**Arquivo:** `frontend/src/app/services/diaria.service.ts`

Adicionar método:

```typescript
getResumoByContrato(contratoId: string, ano: number, mes: number): Observable<DiariasContratoResumo> {
  return this.http.get<DiariasContratoResumo>(
    `${this.apiUrl}/diarias/contrato/${contratoId}/resumo`,
    { params: { ano: ano.toString(), mes: mes.toString() } }
  );
}
```

#### 3.3 Seletor de período no `contrato-list`

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`

Adicionar signals:

```typescript
periodoAno = signal<number>(new Date().getFullYear());
periodoMes = signal<number>(new Date().getMonth() + 1);
```

Adicionar métodos de navegação:

```typescript
periodoAnterior(): void { ... }   // mes-1, ajustando ano
proximoPeriodo(): void  { ... }   // mes+1, ajustando ano
periodoLabel = computed(() => {   // ex: "Mar/2026"
  return new Date(this.periodoAno(), this.periodoMes() - 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
});
```

#### Critérios de aceite

- [x] Modelo `DiariasContratoResumo` e `DiariaTagResumo` presentes em `index.ts`
- [x] `DiariaService.getResumoByContrato` retorna `Observable<DiariasContratoResumo>` sem erros de tipo
- [x] Signals `periodoAno` e `periodoMes` iniciam com mês corrente
- [x] `periodoAnterior()` em Jan/2026 navega para Dez/2025 (troca de ano)
- [x] `proximoPeriodo()` em Dez/2026 navega para Jan/2027
- [x] `periodoLabel` retorna string formatada (ex: `"mar/2026"`)

---

### Fase 4 — Frontend: Carregamento dos resumos e atualização dinâmica ✅

**Objetivo:** Buscar os resumos de diárias para todos os contratos ativos ao carregar a página e ao mudar o período.

#### 4.1 Injeção e carregamento no `contrato-list`

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`

- Injetar `DiariaService`
- Adicionar signal: `resumosDiarias = signal<Map<string, DiariasContratoResumo>>(new Map())`
- Adicionar signal: `loadingResumos = signal(false)`
- Método `loadResumosDiarias()`:
  - Filtra apenas contratos ATIVO e PENDENTE com alocações esperadas
  - Para cada contrato, chama `getResumoByContrato(id, periodoAno(), periodoMes())`
  - Usa `forkJoin` para paralelizar todas as requisições
  - Preenche o `Map<contratoId, resumo>` ao concluir

- Chamar `loadResumosDiarias()` ao final de `loadContratos()` (após `contratos.set(data)`)
- Chamar `loadResumosDiarias()` nos métodos `periodoAnterior()` e `proximoPeriodo()`

#### 4.2 Método auxiliar de acesso

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`

```typescript
getResumoDiarias(contratoId: string): DiariasContratoResumo | undefined {
  return this.resumosDiarias().get(contratoId);
}
```

#### Critérios de aceite

- [x] Ao abrir contrato-list, requisições para `/api/diarias/contrato/{id}/resumo?ano=...&mes=...` são disparadas para cada contrato ativo (verificar no Network tab do browser)
- [x] Mudar período dispara novo conjunto de requisições com `ano` e `mes` atualizados
- [x] `loadingResumos()` é `true` enquanto as requisições estão em andamento
- [x] Erro em um resumo individual não bloqueia os demais (tratamento isolado por contrato)
- [x] `getResumoDiarias(id)` retorna `undefined` para contratos sem dados (sem exceção)

---

### Fase 5 — Frontend: Visualização das diárias no card ✅

**Objetivo:** Substituir a linha de tags estática (`card-tags-preview`) por um painel dinâmico com dados reais de diárias do período selecionado.

#### 5.1 Template do card

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.html`

Substituir a seção `.card-tags-preview` em **todos os cards kanban** por:

```html
<!-- Seção de diárias dinâmica -->
<div class="card-diarias-panel">
  @let resumo = getResumoDiarias(contrato.id); @if (loadingResumos()) {
  <div class="diarias-loading">Carregando diárias...</div>
  } @else if (resumo && resumo.totalDiarias > 0) {
  <div class="diarias-totais">
    <span class="diarias-count">{{ resumo.totalDiarias }} diárias</span>
    <span class="diarias-valor"
      >{{ resumo.totalValorDiarias | currency:'BRL' }}</span
    >
  </div>
  <div class="diarias-tags">
    @for (tagResumo of resumo.resumoByTag; track tagResumo.tagId) {
    <div class="diaria-tag-row">
      <span class="tag-nome">{{ tagResumo.tagNome }}</span>
      <span class="tag-qtd">{{ tagResumo.quantidadeDiarias }}x</span>
      <span class="tag-valor">{{ tagResumo.totalValor | currency:'BRL' }}</span>
    </div>
    }
  </div>
  <div class="diarias-status">
    <span class="status-confirmadas">✓ {{ resumo.totalConfirmadas }}</span>
    @if (resumo.totalFaltas > 0) {
    <span class="status-faltas">✗ {{ resumo.totalFaltas }} falta(s)</span>
    }
  </div>
  } @else {
  <div class="diarias-empty">
    Sem diárias em {{ periodoLabel() }}
    <span class="tags-ref">{{ getTagRatesPreview(contrato) }}</span>
  </div>
  }
</div>
```

#### 5.2 Seletor de período no header da página

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.html`

Inserir controles de navegação de período após o título da página:

```html
<div class="periodo-selector">
  <button class="btn-icon" (click)="periodoAnterior()" title="Mês anterior">
    ◄
  </button>
  <span class="periodo-label">{{ periodoLabel() }}</span>
  <button class="btn-icon" (click)="proximoPeriodo()" title="Próximo mês">
    ►
  </button>
</div>
```

#### 5.3 Custo mensal real nos cards

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`

Atualizar `getContratoCusto` para usar dados reais quando disponíveis:

```typescript
getContratoCusto(contrato: Contrato): number {
  const resumo = this.getResumoDiarias(contrato.id);
  if (resumo && resumo.totalDiarias > 0) {
    // Custo real = valor das diárias + benefícios proporcionais
    return resumo.totalValorDiarias + this.getBeneficiosMensais(contrato);
  }
  // Fallback para estimativa quando sem dados reais
  return this.getContratoCustoEstimado(contrato);
}
```

#### Critérios de aceite

- [x] Cards com diárias no período mostram totais de diárias e valor
- [x] Breakdown por tag exibe nome da tag, quantidade e total em R$
- [x] Cards sem diárias no período exibem mensagem "Sem diárias em [período]" com preview de tags como referência
- [x] Seletor de período aparece no header da página e navega corretamente
- [x] Ao mudar o mês, todos os cards atualizam seus dados de diárias
- [x] Indicador de faltas só aparece quando `totalFaltas > 0`

---

### Fase 6 — Frontend: Atualização das métricas globais com dados reais ✅

**Objetivo:** Atualizar os summary cards do topo (Faturamento, Custo, Lucro) para refletir dados reais de diárias do período selecionado.

#### 6.1 Computed signals de métricas reais

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`

Adicionar:

```typescript
custoRealMensal = computed(() => {
  return this.contratos()
    .filter((c) => c.status === StatusContrato.ATIVO)
    .reduce((sum, c) => {
      const resumo = this.getResumoDiarias(c.id);
      if (resumo && resumo.totalDiarias > 0) {
        return sum + resumo.totalValorDiarias + this.getBeneficiosMensais(c);
      }
      return sum + this.getContratoCustoEstimado(c);
    }, 0);
});

lucroRealMensal = computed(
  () => this.faturamentoMensal() - this.custoRealMensal(),
);

totalDiariasGlobal = computed(() => {
  let total = 0;
  this.resumosDiarias().forEach((r) => {
    total += r.totalDiarias;
  });
  return total;
});
```

#### 6.2 Atualização dos summary cards no template

**Arquivo:** `frontend/src/app/features/contratos/contrato-list/contrato-list.component.html`

- Substituir `custoMensal()` por `custoRealMensal()` no card "Custo Mensal"
- Substituir `lucroMensal()` por `lucroRealMensal()` no card "Lucro Mensal"
- Adicionar novo summary card "Diárias no Período" com `totalDiariasGlobal()`

#### Critérios de aceite

- [x] Summary card "Custo Mensal" reflete soma de diárias reais quando disponíveis, estimativa quando não há dados
- [x] Summary card "Lucro Mensal" = Faturamento − Custo Real
- [x] Novo summary card "Diárias [mês]" exibe total de diárias no período selecionado
- [x] Mudar período atualiza todos os 4 summary cards
- [x] Contratos sem diárias no período usam fallback de estimativa (sem exibir R$ 0)

---

## Resumo de Arquivos Afetados

### Backend

| Ação      | Arquivo                                                            |
| --------- | ------------------------------------------------------------------ |
| Modificar | `Domain/.../Aggregates/Diaria.cs`                                  |
| Modificar | `Infrastructure/Persistence/Configurations/DiariaConfiguration.cs` |
| Modificar | `Domain/.../Interfaces/IDiariaRepository.cs`                       |
| Modificar | `Infrastructure/Persistence/Repositories/DiariaRepository.cs`      |
| Modificar | `Application/.../DTOs/DiariaDto.cs`                                |
| Modificar | `Application/.../Interfaces/IDiariaAppService.cs`                  |
| Modificar | `Application/.../Services/DiariaAppService.cs`                     |
| Modificar | `Api/Controllers/DiariasController.cs`                             |
| Criar     | Migration `AddTagIdToDiaria`                                       |

### Frontend

| Ação      | Arquivo                                                         |
| --------- | --------------------------------------------------------------- |
| Modificar | `models/index.ts`                                               |
| Modificar | `services/diaria.service.ts`                                    |
| Modificar | `features/contratos/contrato-list/contrato-list.component.ts`   |
| Modificar | `features/contratos/contrato-list/contrato-list.component.html` |
| Modificar | `features/contratos/contrato-list/contrato-list.component.scss` |

---

## Checklist Geral de Verificação (Pós-implementação)

### Fase 1 — `TagId` na `Diaria` e `ValorDiaria` no DTO ✅

- [x] Migration criada e aplicada sem erros
- [x] `POST /api/diarias` com funcionário com tag no contrato → `tagId` persistido
- [x] `GET /api/diarias/{id}` retorna `valorDiaria != 0` e `tagId` não nulo
- [x] Diárias antigas sem tag → `tagId = null` sem quebra

### Fase 2 — Endpoint de resumo por contrato ✅

- [x] `GET /api/diarias/contrato/{id}/resumo?ano=2026&mes=3` retorna JSON correto
- [x] Agrupamento por tag correto com nomes enriquecidos
- [x] Endpoint cobre meses sem diárias (totais zerados)
- [x] Autenticação e tenant scope aplicados no controller

### Fase 3 — Model e service frontend ✅

- [x] `DiariasContratoResumo` tipado corretamente em `index.ts`
- [x] `DiariaService.getResumoByContrato` funciona sem erro de CORS / rota

### Fase 4 — Carregamento dinâmico ✅

- [x] `forkJoin` não bloqueia a listagem em caso de erro em 1 resumo
- [x] `loadingResumos` visível durante carregamento

### Fase 5 — Visualização no card ✅

- [x] Cards com dados mostram breakdown por tag com valores
- [x] Cards sem dados mostram fallback com tags de referência
- [x] Seletor de período navegável no header
- [x] Ao mudar período, todos os resumos são re-buscados

### Fase 6 — Métricas globais ✅

- [x] Summary cards atualizados com dados reais
- [x] Novo card "Diárias no período" exibido
- [x] Lucro = Faturamento − Custo Real (não estimado)

### Build e Testes

- [x] `dotnet build InterceptorSystem.sln` sem erros
- [x] `dotnet test InterceptorSystem.Tests/InterceptorSystem.Tests.csproj` — 212/212 ✓
- [x] `npm run build` no frontend sem erros
