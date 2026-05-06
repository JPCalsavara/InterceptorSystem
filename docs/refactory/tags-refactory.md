# Refatoração do Sistema de Tags

## Contexto

O sistema de tags está incompleto e inconsistente em quatro pontos críticos que afetam diretamente o cálculo financeiro das diárias e a integridade dos dados exibidos nos formulários.

---

## Problemas Identificados

### 1. `Tag` não tem `Valor` base

O preço de uma função (tag) só existe em `ContratoTag.ValorDiaria`, que é específico por contrato. Não há referência de mercado/padrão na própria entidade `Tag`. Isso impede mostrar quanto o valor negociado representa percentualmente em relação ao valor base da função.

### 2. `PostoTag` é metadado morto

A tabela `PostoTags` existe, é gravada, mas nenhuma lógica de negócio lê ou valida seus dados. O usuário confirmou que não há necessidade de restrição por função/tag no posto. A entidade, configuração e toda a UI relacionada devem ser removidas.

### 3. `Diaria.ValorDiaria` sempre `0m`

O `DiariaAppService` faz hardcode do valor como zero no momento da criação. A lógica correta via `FuncionarioTag → ContratoTag.ValorDiaria` existe no domínio (em `CustoMensalEstimado`) mas nunca é aplicada na criação de diárias.

### 4. `FuncionarioForm` carrega todas as tags do sistema

O formulário de funcionário exibe todas as tags cadastradas na empresa, quando deveria exibir apenas as tags do contrato ativo do cliente selecionado.

### 5. `ClienteWizard` não configura tags de contrato

O step de Contrato no wizard de criação de cliente não permite definir quais tags (funções) fazem parte do contrato, nem seus valores de diária.

---

## Mudanças Planejadas

### Backend

#### 1. Adicionar `Valor` à entidade `Tag`

**`Domain/BoundedContexts/Operacoes/Aggregates/Tag.cs`**

- Adicionar propriedade `public decimal Valor { get; private set; }`
- Atualizar construtor: aceitar `decimal valor` com validação `Enforce(valor >= 0, ...)`
- Atualizar `AtualizarDados`: aceitar e aplicar `decimal valor`

**`Infrastructure/Persistence/Configurations/TagConfiguration.cs`**

- Adicionar `builder.Property(t => t.Valor).HasColumnType("decimal(12,2)").IsRequired()`

**`Application/BoundedContexts/Operacoes/DTOs/TagDto.cs`**

- `CreateTagDtoInput`: adicionar `decimal Valor`
- `UpdateTagDtoInput`: adicionar `decimal Valor`
- `TagDtoOutput`: adicionar `decimal Valor`, atualizar mapeamento em `FromEntity`

**`Application/BoundedContexts/Operacoes/Services/TagAppService.cs`**

- Passar `input.Valor` no construtor `new Tag(empresaId, nome, descricao, valor)`
- Chamar `tag.AtualizarDados(nome, descricao, valor)` no update

---

#### 2. Remover `PostoTag` (metadado sem uso)

**Arquivos a deletar:**

- `Domain/BoundedContexts/Operacoes/Aggregates/PostoTag.cs`
- `Infrastructure/Persistence/Configurations/PostoTagConfiguration.cs`

**`Infrastructure/Persistence/Contexts/ApplicationDbContext.cs`**

- Remover `public DbSet<PostoTag> PostoTags { get; set; }`
- Remover registro de `PostoTagConfiguration` em `OnModelCreating`

**`Domain/BoundedContexts/Operacoes/Aggregates/Posto.cs`**

- Remover `public ICollection<PostoTag> Tags { get; private set; }`
- Remover método `DefinirTags(IEnumerable<PostoTag>)`

**`Application/BoundedContexts/Operacoes/Services/PostoAppService.cs`**

- Remover lógica de `PostoTag` em `CreateAsync` e `UpdateAsync`

**`Application/BoundedContexts/Operacoes/DTOs/PostoDto.cs`**

- Remover `tagIds` de `CreatePostoDtoInput` e `UpdatePostoDtoInput`
- Remover `tags` de `PostoDtoOutput`

---

#### 3. Corrigir `Diaria.ValorDiaria` (atualmente sempre `0m`)

**`Application/BoundedContexts/Operacoes/Services/DiariaAppService.cs`**

Injetar `IContratoRepository` (já existe no projeto).

No método `CreateAsync`, após carregar `funcionario` e `alocacao`:

```csharp
var contrato = await _contratoRepository.GetByIdAsync(alocacao.ContratoId);
var funcionarioTagIds = funcionario.Tags.Select(ft => ft.TagId).ToHashSet();
var valorDiaria = contrato?.Tags
    .Where(ct => funcionarioTagIds.Contains(ct.TagId))
    .Select(ct => ct.ValorDiaria)
    .DefaultIfEmpty(0m)
    .Max() ?? 0m;

var diaria = new Diaria(..., valorDiaria, ...);
```

Aplicar a mesma lógica em `CreateBatchAsync`.

> **Atenção:** Verificar se `IFuncionarioRepository.GetByIdAsync` inclui `Tags` (FuncionarioTags) via eager loading. Se não, ajustar a query para incluir.

---

#### 4. Adicionar tags ao endpoint `POST /api/clientes-completos`

**`Application/BoundedContexts/Operacoes/DTOs/ClienteCompletoDto.cs`**

- Adicionar `IEnumerable<ContratoTagInput>? Tags = null` em `CreateContratoCompletoDtoInput`

**`Application/BoundedContexts/Operacoes/Services/ClienteOrquestradorService.cs`**

- Ao montar `CreateContratoDtoInput`, incluir `Tags: input.Contrato.Tags`

---

#### 5. Nova migration

Nome: `AddValorToTag_RemovePostoTags`

```bash
dotnet ef migrations add AddValorToTag_RemovePostoTags
dotnet ef database update
```

Operações:

- `AddColumn`: `Tags.Valor` — `decimal(12,2)`, `NOT NULL`, `DEFAULT 0`
- `DropTable`: `PostoTags`

---

### Frontend

#### 6. Atualizar models (`index.ts`)

**`frontend/src/app/models/index.ts`**

- `Tag`: adicionar `valor: number`
- `Posto`: remover `tags?: Tag[]`
- `CreatePostoDto`: remover `tagIds?: string[]`
- `UpdatePostoDto`: remover `tagIds?: string[]`

---

#### 7. Atualizar `tag-list.component` — adicionar campo Valor

**`features/tags/tag-list/tag-list.component.ts`**

- Adicionar `valor: [0, [Validators.required, Validators.min(0)]]` ao `FormGroup` do modal
- Passar `valor` no payload de create/update

**`features/tags/tag-list/tag-list.component.html`**

- Adicionar `input[type=number]` para "Valor base (R$)" no modal de criação/edição
- Adicionar coluna "Valor Base" na tabela com formatação de moeda

---

#### 8. Remover seção de tags do `posto-form`

**`features/postos/posto-form/posto-form.component.ts`**

- Remover `contratoTags` signal
- Remover import e injeção do `ContratoService`
- Remover métodos: `loadContratoTags`, `applyTagSelectionRules`, `onToggleTag`, `onToggleAllTags`
- Remover `tagIds` do `FormGroup`
- Remover `tagIds` do payload em `onSubmit`

**`features/postos/posto-form/posto-form.component.html`**

- Remover toda a seção de seleção de tags

---

#### 9. Corrigir `funcionario-form` — exibir apenas tags do contrato do cliente

**`features/funcionarios/funcionario-form/funcionario-form.component.ts`**

- Remover `TagService` e injeção de `tagService`
- Remover `loadTags()` e lógica de `defaultTag`
- Após carregar contratos do cliente selecionado, extrair as tags únicas dos contratos ativos:

```typescript
loadContratoTags(clienteId: string): void {
  this.contratoService.getAll().subscribe({
    next: (data) => {
      const contratosDoCliente = data.filter(
        c => c.clienteId === clienteId && c.status !== StatusContrato.FINALIZADO
      );
      this.contratos.set(contratosDoCliente);

      const tags = contratosDoCliente
        .flatMap(c => c.tags ?? [])
        .reduce((acc, ct) => {
          if (!acc.some(t => t.id === ct.tagId)) {
            acc.push({ id: ct.tagId, nome: ct.tagNome, valor: 0 });
          }
          return acc;
        }, [] as Tag[]);
      this.tags.set(tags);
    }
  });
}
```

---

#### 10. Adicionar tags ao `cliente-wizard` (Step 2 — Contrato)

**`features/clientes/cliente-wizard/cliente-wizard.component.ts`**

- Importar `TagService`, `TagPickerComponent`
- Adicionar signals: `tags`, `selectedTagIds`, `tagRateById`
- Adicionar computed: `selectedTags`
- No `ngOnInit`: chamar `loadTags()`
- Adicionar métodos: `onContratoTagsChange`, `onTagRateChange`, `getTagRate`
- Em `montarPayloadCompleto()`: incluir `tags: selectedTagIds().map(tagId => ({ tagId, valorDiaria: getTagRate(tagId) }))`

**`features/clientes/cliente-wizard/cliente-wizard.component.html`**

- No Step 2, após o bloco de campos financeiros do contrato:
  - Adicionar `<app-tag-picker>` com binding de seleção
  - Adicionar grid de cards por tag com campo de `valorDiaria`

---

#### 11. Exibir percentual acima do valor base no `contrato-form`

**`features/contratos/contrato-form/contrato-form.component.ts`**

Adicionar método:

```typescript
getTagPercentualAcima(tag: Tag, rate: number): string {
  if (!tag.valor || tag.valor === 0) return '';
  const pct = ((rate - tag.valor) / tag.valor) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(0)}% do valor base`;
}
```

**`features/contratos/contrato-form/contrato-form.component.html`**

- Dentro de cada `tag-rate-card`, exibir:
  - `tag.valor | currency:'BRL'` como referência
  - `getTagPercentualAcima(tag, getTagRate(tag.id))` como hint

---

## Resumo de Arquivos Afetados

### Backend (Arquivos)

| Ação      | Arquivo                                                              |
| --------- | -------------------------------------------------------------------- |
| Modificar | `Domain/.../Aggregates/Tag.cs`                                       |
| Modificar | `Infrastructure/Persistence/Configurations/TagConfiguration.cs`      |
| Modificar | `Application/.../DTOs/TagDto.cs`                                     |
| Modificar | `Application/.../Services/TagAppService.cs`                          |
| Modificar | `Application/.../Services/DiariaAppService.cs`                       |
| Modificar | `Application/.../DTOs/ClienteCompletoDto.cs`                         |
| Modificar | `Application/.../Services/ClienteOrquestradorService.cs`             |
| Modificar | `Infrastructure/Persistence/Contexts/ApplicationDbContext.cs`        |
| Modificar | `Domain/.../Aggregates/Posto.cs`                                     |
| Modificar | `Application/.../Services/PostoAppService.cs`                        |
| Modificar | `Application/.../DTOs/PostoDto.cs`                                   |
| Deletar   | `Domain/.../Aggregates/PostoTag.cs`                                  |
| Deletar   | `Infrastructure/Persistence/Configurations/PostoTagConfiguration.cs` |
| Criar     | Nova migration `AddValorToTag_RemovePostoTags`                       |

### Frontend (Arquivos)

| Ação      | Arquivo                                                                  |
| --------- | ------------------------------------------------------------------------ |
| Modificar | `models/index.ts`                                                        |
| Modificar | `features/tags/tag-list/tag-list.component.ts`                           |
| Modificar | `features/tags/tag-list/tag-list.component.html`                         |
| Modificar | `features/postos/posto-form/posto-form.component.ts`                     |
| Modificar | `features/postos/posto-form/posto-form.component.html`                   |
| Modificar | `features/funcionarios/funcionario-form/funcionario-form.component.ts`   |
| Modificar | `features/funcionarios/funcionario-form/funcionario-form.component.html` |
| Modificar | `features/clientes/cliente-wizard/cliente-wizard.component.ts`           |
| Modificar | `features/clientes/cliente-wizard/cliente-wizard.component.html`         |
| Modificar | `features/contratos/contrato-form/contrato-form.component.ts`            |
| Modificar | `features/contratos/contrato-form/contrato-form.component.html`          |

---

## Checklist de Verificação

- [x] Rodar migration: `dotnet ef migrations add AddValorToTag_RemovePostoTags && dotnet ef database update`
- [x] Criar tag via `/api/tags` com `nome`, `descricao`, `valor` → resposta inclui `valor`
- [x] Criar contrato com tags via contrato-form → `ContratoTag.ValorDiaria` persistido corretamente
- [x] Criar diária de funcionário com tag vinculada ao contrato → `Diaria.ValorDiaria != 0`
- [x] Abrir funcionario-form → selecionar cliente → apenas tags do contrato aparecem
- [x] Abrir cliente-wizard → Step 2 com contrato habilitado → seleção de tags + valorDiaria disponível
- [x] Posto-form não exibe mais seção de tags
- [x] Rodar testes: `dotnet test`

---

## Checklist por Fase (Consolidado)

### Fase 1 - `Tag` com valor base

- [x] Entidade `Tag` com propriedade `Valor` e validação de não-negatividade
- [x] Configuração EF `TagConfiguration` com coluna `decimal(12,2)` obrigatória
- [x] DTOs de Tag atualizados (`Create`, `Update`, `Output`)
- [x] `TagAppService` usando `input.Valor` no create/update

Evidências:

- `backend/src/InterceptorSystem.Domain/BoundedContexts/Operacoes/Aggregates/Tag.cs`
- `backend/src/InterceptorSystem.Infrastructure/Persistence/Configurations/TagConfiguration.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/DTOs/TagDto.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/TagAppService.cs`

### Fase 2 - Remoção de `PostoTag`

- [x] Entidade `PostoTag` removida
- [x] Configuração `PostoTagConfiguration` removida
- [x] `ApplicationDbContext` sem `DbSet<PostoTags>`
- [x] Agregado `Posto` sem coleção `Tags` e sem `DefinirTags`
- [x] `PostoAppService` sem lógica de `tagIds`
- [x] `PostoDto` sem `tagIds` e sem retorno de `tags`

Evidências:

- `backend/src/InterceptorSystem.Domain/BoundedContexts/Operacoes/Aggregates/Posto.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/PostoAppService.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/DTOs/PostoDto.cs`
- `backend/src/InterceptorSystem.Infrastructure/Persistence/Contexts/ApplicationDbContext.cs`

### Fase 3 - Correção de `Diaria.ValorDiaria`

- [x] `DiariaAppService` injeta `IContratoRepository`
- [x] `CreateAsync` calcula `valorDiaria` via interseção `FuncionarioTag x ContratoTag`
- [x] `CreateBatchAsync` aplica a mesma regra
- [x] Repositório de funcionário inclui `Funcionario.Tags` em carregamento

Evidências:

- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/DiariaAppService.cs`
- `backend/src/InterceptorSystem.Infrastructure/Persistence/Repositories/FuncionarioRepository.cs`

### Fase 4 - Tags no endpoint `POST /api/clientes-completos`

- [x] DTO de contrato completo aceita `Tags`
- [x] `ClienteOrquestradorService` encaminha `input.Contrato.Tags` para criação do contrato

Evidências:

- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/DTOs/ClienteCompletoDto.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/ClienteOrquestradorService.cs`

### Fase 5 - Migration `AddValorToTag_RemovePostoTags`

- [x] Migration criada no EF com arquivos `.cs` e `.Designer.cs`
- [x] Operações da migration alinhadas ao escopo: `AddColumn(Tags.Valor)` e `DropTable(PostoTags)`
- [x] Migration aplicada via `dotnet ef database update`

Evidências:

- `backend/src/InterceptorSystem.Infrastructure/Persistence/Migrations/20260326182009_AddValorToTag_RemovePostoTags.cs`
- `backend/src/InterceptorSystem.Infrastructure/Persistence/Migrations/20260326182009_AddValorToTag_RemovePostoTags.Designer.cs`

### Fase 6 - Models frontend

- [x] `Tag` com `valor: number`
- [x] `Posto` sem `tags`
- [x] `CreatePostoDto` sem `tagIds`
- [x] `UpdatePostoDto` sem `tagIds`

Evidências:

- `frontend/src/app/models/index.ts`

### Fase 7 - Tela de tags (`tag-list`)

- [x] Formulário com campo `valor` e validação (`required` + `min(0)`)
- [x] Payload de create/update envia `valor`
- [x] Tabela com coluna `Valor Base` formatada em moeda
- [x] Modal com input numérico para valor base

Evidências:

- `frontend/src/app/features/tags/tag-list/tag-list.component.ts`
- `frontend/src/app/features/tags/tag-list/tag-list.component.html`

### Fase 8 - Remoção de tags no `posto-form`

- [x] `ContratoService` removido do componente
- [x] `FormGroup` sem `tagIds`
- [x] Métodos de seleção de tags removidos
- [x] Payload sem `tagIds`
- [x] Seção de tags removida do HTML

Evidências:

- `frontend/src/app/features/postos/posto-form/posto-form.component.ts`
- `frontend/src/app/features/postos/posto-form/posto-form.component.html`

### Fase 9 - `funcionario-form` com tags por contrato

- [x] `TagService` removido
- [x] `loadTags()` e `defaultTag` removidos
- [x] Cálculo das tags a partir de contratos ativos do cliente
- [x] Seleção saneada para manter somente tags válidas do cliente
- [x] Texto de ajuda atualizado para o novo comportamento

Evidências:

- `frontend/src/app/features/funcionarios/funcionario-form/funcionario-form.component.ts`
- `frontend/src/app/features/funcionarios/funcionario-form/funcionario-form.component.html`

### Fase 10 - Tags no `cliente-wizard` (Step 2)

- [x] `TagService` e `TagPickerComponent` integrados
- [x] Signals/computed adicionados: `tags`, `selectedTagIds`, `tagRateById`, `selectedTags`
- [x] Métodos de seleção e edição de diária por tag implementados
- [x] Payload do contrato envia `tags: [{ tagId, valorDiaria }]`
- [x] UI com seletor de tags e cards de valor diária por tag

Evidências:

- `frontend/src/app/features/clientes/cliente-wizard/cliente-wizard.component.ts`
- `frontend/src/app/features/clientes/cliente-wizard/cliente-wizard.component.html`

### Fase 11 - Percentual acima do valor base no `contrato-form`

- [x] Método `getTagPercentualAcima(tag, rate)` implementado
- [x] UI exibindo valor base da tag e percentual relativo

Evidências:

- `frontend/src/app/features/contratos/contrato-form/contrato-form.component.ts`
- `frontend/src/app/features/contratos/contrato-form/contrato-form.component.html`

### Validação de Execução

- [x] `dotnet build InterceptorSystem.sln` concluído com sucesso
- [x] `dotnet test InterceptorSystem.Tests/InterceptorSystem.Tests.csproj` concluído com sucesso (204/204)
- [x] `dotnet test` com filtro `Diaria|ClienteCompleto|Contrato` concluído com sucesso (76/76)
- [x] `npm run build` no frontend concluído com sucesso

---

## Registro de Validação (26/03/2026)

### Banco / Migrations

- [x] `dotnet ef migrations list --project InterceptorSystem.Infrastructure --startup-project InterceptorSystem.Api`
- [x] `dotnet ef migrations has-pending-model-changes --project InterceptorSystem.Infrastructure --startup-project InterceptorSystem.Api` (sem mudanças pendentes)
- [x] `dotnet ef database update --project InterceptorSystem.Infrastructure --startup-project InterceptorSystem.Api`

Migrations presentes no histórico:

- `20260326182009_AddValorToTag_RemovePostoTags`
- `20260326194000_ModifyTags` (no-op)
- `20260326194314_FixMissingTagValorColumn` (corretiva para garantir `Tags.Valor`)

### Build e Testes

- [x] Backend build OK (`dotnet build InterceptorSystem.sln`)
- [x] Suíte completa backend OK (`204/204`)
- [x] Frontend build OK (`npm run build`)

### Observações

- Warnings `Model.Validation[20606]` para `Cliente.EmailGestor` e `Cliente.TelefoneEmergencia` são de owned types opcionais e não bloqueiam migration/update.
- Warnings de `Sass @import` no frontend são deprecações e não quebram build.
