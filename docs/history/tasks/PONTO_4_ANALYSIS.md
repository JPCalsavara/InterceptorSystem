# Análise Detalhada: Ponto 4 — Ajustar Wizard para `quantidadeIdealPorTurno`

## 1. Problema Atual (Estado Divergente)

### 1.1 Campos no Wizard

O wizard atualmente tem 3 dimensões de configuração de pessoal que **nunca se conversam**:

```typescript
// Etapa 1: ClienteWizard (formCliente)
quantidadeIdealPorTurno: 2; // ← Pessoas por turno de UM POSTO

// Etapa 2: ClienteWizard (formContrato)
numeroPostos: 1; // ← Quantos postos (turnos) existem
postosConfig: [
  {
    tipoPosto: "ESCALA_12X36",
    quantidadeAlocacoes: 2, // ← Turnos DENTRO deste posto
    quantidadeFuncionariosPorAlocacao: 1, // ← Pessoas POR turno
    // ...
  },
];
```

### 1.2 Confusão de Semantica

- `quantidadeIdealPorTurno` = pessoas por turno de **1 posto** (ex: 2)
- `numeroPostos` = quantos postos no contrato (ex: 2 postos = 2 escalas diferentes)
- `postosConfig[0].quantidadeFuncionariosPorAlocacao` = pessoas por turno **neste posto** (ex: 1)

**Problema**: Quando o usuário coloca:

- `quantidadeIdealPorTurno: 3`
- `numeroPostos: 2`
- Qual é o total esperado? **6 pessoas** ou algo diferente?

### 1.3 Impacto no Backend

O payload mandado para `POST /api/clientes-completos` contém:

```json
{
  "numeroDePostos": 2,
  "contrato": {
    "valorTotalMensal": "calculado"
  }
}
```

Backend usa isso em `ClienteOrquestradorService`:

```csharp
// Lógica atual do backend
QuantidadeFuncionarios = Cliente.QuantidadeIdealPorTurno × Contrato.NumeroDePostos
// = 3 × 2 = 6
```

**Mas** o frontend mandou `postosConfig` com outras alocações! O backend **ignora** `postosConfig` e cria postos automaticamente.

---

## 2. Análise da Regra de Negócio

### 2.1 Definição de `quantidadeIdealPorTurno`

- Campo do **Cliente** (não muda por contrato)
- Representa a **quantidade ideal de pessoas por turno** em qualquer posto deste cliente
- É uma política do cliente: "sempre quero ~2 pessoas por turno"
- **Imutável durante o wizard** (definida na Etapa 1, não muda até Etapa 2)

### 2.2 Definição de `numeroPostos` / `postosConfig`

- Campo do **Contrato** (pode variar entre contratos)
- Representa quantos **postos/escalas diferentes** este contrato precisa
- Exemplos:
  - 1 posto = só escalas 12×36 (1 escala, N pessoas)
  - 2 postos = 12×36 + 5×2 Diurno (2 escalas diferentes)
  - 3 postos = 12×36 + 8h×3 + 5×2 (3 escalas diferentes)

### 2.3 Regra de Prioridade: `quantidadeIdealPorTurno` **NÃO MUDA** `postosConfig`

```
PONTO CRÍTICO:
─────────────

Se o usuário define `quantidadeIdealPorTurno: 3` no Cliente,
mas escolhe TipoPosto = 'ESCALA_5X2_DIURNO' que tem
    funcionariosPorAlocacao: 1

NÃO podemos silenciosamente violar isso mudando para:
    funcionariosPorAlocacao: 3  ← Isso muda a escala!

Ao invés disso, PRECISAMOS AVISAR o usuário:
"Você definiu 3 pessoas/turno mas a escala 5×2 tem 1 pessoa/turno.
 Precisa de 3 escalas 5×2 para obter 3 pessoas/turno?"
```

---

## 3. Dois Cenários de Uso no Wizard

### Cenário A: Reutilizar `quantidadeIdealPorTurno` (Simples)

**Quando**: Usuário quer criar postos "genéricos" respeitando a política de pessoal

**Fluxo**:

1. Etapa 1: Define `quantidadeIdealPorTurno: 3` (política do cliente)
2. Etapa 2: Escolhe `numeroPostos: 2` (2 escalas diferentes)
3. **Automático**: Cada posto recebe `quantidadeFuncionariosPorAlocacao` baseado em `quantidadeIdealPorTurno`

**Dados enviados**:

- Cliente: `quantidadeIdealPorTurno: 3`
- Contrato: `numeroDePostos: 2`
- Backend cria 2 postos com ~3 pessoas cada

### Cenário B: Personalizar (Avançado)

**Quando**: Usuário quer controle fino sobre cada posto

**Fluxo**:

1. Etapa 1: Define `quantidadeIdealPorTurno: 3`
2. Etapa 2: Clica em "Personalizar" ou "Modo Avançado"
3. Define manualmente cada `postosConfig[i]` em detalhe
4. Backend ainda respeita `quantidadeIdealPorTurno` mas permite override

---

## 4. Solução Proposta: Dois Modos no Wizard

### 4.1 Modo 1: "Criar Postos Respeitando `quantidadeIdealPorTurno`" (Padrão)

Simples, seguindo a política do cliente.

**UI/UX:**

```
┌────────────────────────────────────────────────┐
│ Etapa 2: Configurar Contrato                   │
├────────────────────────────────────────────────┤
│                                                │
│ ✓ Criar postos automaticamente?                │
│                                                │
│   Definições de trabalho:                      │
│   ┌──────────────────────────────────────────┐ │
│   │ Quantidade de postos (turnos): [2   ]    │ │
│   │                                          │ │
│   │ Tipo de escala por posto:                │ │
│   │   [ ] 12×36 (1 funcio./turno)           │ │
│   │   [ ] 8h×3 (1 funcio./turno)            │ │
│   │   [ ] 5×2 (1 funcio./turno)             │ │
│   │                                          │ │
│   │ Nota: Sua política de pessoal é          │ │
│   │ "3 pessoas/turno". Cada escala será      │ │
│   │ replicada 3 vezes.                       │ │
│   │                                          │ │
│   │ Total estimado: 6 pessoas (2 × 3)        │ │
│   └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Lógica**:

```typescript
// Para cada tipoPosto escolhido:
const cfg = TIPO_POSTO_CONFIGS[tipoPosto];
const replicasPorTipo = Math.ceil(
  quantidadeIdealPorTurno / cfg.funcionariosPorAlocacao,
);
// Exemplo: 3 pessoas / 1 funcio. = 3 réplicas da escala 12×36
```

### 4.2 Modo 2: "Personalizar Postos" (Avançado)

Para setups complexos.

**UI/UX:**

```
┌────────────────────────────────────────────────┐
│ ⚠️ Aviso: Modo Personalizado Ativado            │
├────────────────────────────────────────────────┤
│                                                │
│ Sua política é 3 pessoas/turno, mas você está │
│ personalizando. Certifique-se de respeitar:   │
│                                                │
│ Posto 1: Escala 5×2 - 1 funcio./turno         │
│          ⚠️ Apenas 1 pessoa/turno (vs 3!)     │
│                                                │
│ Você precisa de 3 postos 5×2 para obter       │
│ 3 pessoas/turno.                              │
│                                                │
│ [Criar mais postos] [Sugerir configuração]    │
└────────────────────────────────────────────────┘
```

---

## 5. Implementação no Frontend (Passo a Passo)

### 5.1 Helper: `computePostosByQuantidadeIdeal()`

```typescript
/**
 * Calcula configurações de postos respeitando quantidadeIdealPorTurno
 *
 * @param quantidadeIdeal - Pessoas por turno (do cliente)
 * @param tiposEscolhidos - Array de TipoPosto selecionados
 * @returns Array de postos pré-configurados
 */
export function computePostosByQuantidadeIdeal(
  quantidadeIdeal: number,
  tiposEscolhidos: TipoPosto[],
): Array<{
  tipoPosto: TipoPosto;
  quantidadeAlocacoes: number;
  quantidadeFuncionariosPorAlocacao: number;
  alocacoesNoturnas: number;
}> {
  const result: typeof result = [];

  for (const tipo of tiposEscolhidos) {
    const cfg = TIPO_POSTO_CONFIGS[tipo];
    const replicas = Math.ceil(quantidadeIdeal / cfg.funcionariosPorAlocacao);

    for (let i = 0; i < replicas; i++) {
      result.push({
        tipoPosto: tipo,
        quantidadeAlocacoes: cfg.alocacoes,
        quantidadeFuncionariosPorAlocacao: cfg.funcionariosPorAlocacao,
        alocacoesNoturnas: cfg.alocacoesNoturnas,
      });
    }
  }

  return result;
}
```

### 5.2 Modificação do Wizard Component

#### 5.2.1 Adicionar Toggle para Modo

```typescript
// No formContrato group:
modoPersonalizado: [false], // false = respeitando ideal, true = manual
```

#### 5.2.2 Adicionar Watchers Inteligentes

```typescript
setupQuantidadeIdealRespect(): void {
  const tiposEscolhidosControl = this.formContrato.get('tiposEscolhidos');

  // Quando tipos mudam, recompute os postos (se não em modo personalizado)
  tiposEscolhidosControl?.valueChanges
    .pipe(debounceTime(300))
    .subscribe((tipos: TipoPosto[]) => {
      const modoPersonalizado = this.formContrato.get('modoPersonalizado')?.value;
      if (modoPersonalizado) return; // Ignorar em modo personalizado

      const quantidadeIdeal = this.formCliente.get('quantidadeIdealPorTurno')?.value || 2;
      const postos = computePostosByQuantidadeIdeal(quantidadeIdeal, tipos);

      // Resetar postosConfig com os novos postos
      this.postosConfig.clear();
      postos.forEach(posto => {
        this.postosConfig.push(this.fb.group({
          tipoPosto: [posto.tipoPosto, Validators.required],
          quantidadeAlocacoes: [posto.quantidadeAlocacoes],
          quantidadeFuncionariosPorAlocacao: [posto.quantidadeFuncionariosPorAlocacao],
          alocacoesNoturnas: [posto.alocacoesNoturnas],
          valorDiariaCobrada: [100, Validators.required],
          valorBeneficiosExtrasMensal: [350, Validators.required],
        }));
      });

      // Recalcular breakdown
      this.formContrato.patchValue({ numeroPostos: postos.length }, { emitEvent: true });
    });
}
```

#### 5.2.3 Adicionar Validador

```typescript
customValidators = {
  respectaQuantidadeIdeal: (control: FormControl) => {
    const modoPersonalizado = control.parent?.get("modoPersonalizado")?.value;
    if (modoPersonalizado) return null; // Bypass em modo personalizado

    const quantidadeIdeal =
      this.formCliente.get("quantidadeIdealPorTurno")?.value || 2;
    const postos = control.value || [];

    for (const posto of postos) {
      if (posto.quantidadeFuncionariosPorAlocacao < quantidadeIdeal) {
        // ⚠️ Aviso, não erro
        console.warn(
          `Posto ${posto.tipoPosto} tem apenas ${posto.quantidadeFuncionariosPorAlocacao} ` +
            `pessoas/turno vs. ${quantidadeIdeal} da política`,
        );
      }
    }

    return null;
  },
};
```

### 5.3 Atualizar `montarPayloadCompleto()`

```typescript
private montarPayloadCompleto(): any {
  const formClienteValue = this.formCliente.value;
  const formContratoValue = this.formContrato.value;

  return {
    cliente: {
      nome: formClienteValue.nome,
      quantidadeIdealPorTurno: formClienteValue.quantidadeIdealPorTurno, // ← CRÍTICO
      // ... outros campos
    },
    contrato: {
      // ... campos
    },
    numeroDePostos: formContratoValue.postosConfig.length, // ← Número REAL de postos
    criarPostosAutomaticamente: true,
  };
}
```

---

## 6. Modificações no Backend (Opcional mas Recomendado)

### 6.1 Problema Atual do Backend

O backend ignora `postosConfig` e cria postos de forma "genérica":

```csharp
// Pseudocódigo atual
if (input.CriarPostosAutomaticamente) {
  for (int i = 0; i < input.NumeroDePostos; i++) {
    var posto = new Posto { /* defaults */ };
    await _postoService.CreateAsync(posto);
  }
}
```

### 6.2 Solução: Enviar Config de Postos

Expandir `CreateClienteCompletoDtoInput`:

```csharp
public record CreateClienteCompletoDtoInput(
    CreateClienteDtoInput Cliente,
    CreateContratoCompletoDtoInput Contrato,
    bool CriarPostosAutomaticamente = true,
    int NumeroDePostos = 2,
    IReadOnlyList<CreatePostoConfigInput>? PostoConfigs = null  // ← NOVO
);

public record CreatePostoConfigInput(
    string TipoPosto,
    int QuantidadeAlocacoes,
    int QuantidadeFuncionariosPorAlocacao,
    int AlocacoesNoturnas
);
```

### 6.3 Backend Respeita `quantidadeIdealPorTurno`

```csharp
if (input.CriarPostosAutomaticamente && input.PostoConfigs != null) {
  foreach (var postoConfig in input.PostoConfigs) {
    var alocacoes = new List<Alocacao>();
    for (int i = 0; i < postoConfig.QuantidadeAlocacoes; i++) {
      alocacoes.Add(new Alocacao {
        HorarioInicio = ComputeHorario(i, cliente.QuantidadeIdealPorTurno),
        // ...
      });
    }

    var posto = new Posto {
      TipoPosto = postoConfig.TipoPosto,
      Alocacoes = alocacoes,
      // Validação: Alocacoes.Count × QuantidadeFuncionarios == Cliente.QuantidadeIdealPorTurno
    };

    await _postoService.CreateAsync(posto);
  }
}
```

---

## 7. Testes de Validação

### 7.1 Teste 1: Modo Automático (Simples)

```
Entrada:
  - Cliente.quantidadeIdealPorTurno: 3
  - Contrato.tiposEscolhidos: ['ESCALA_12X36']
  - numeroPostos: ? (auto)

Esperado:
  - 3 postos 12×36 (pois 3 / 1 = 3)
  - Cada um com 1 funcionário por turno
  - Total: 3 × 2 turnos = 6 pessoas
```

### 7.2 Teste 2: Múltiplos Tipos

```
Entrada:
  - Cliente.quantidadeIdealPorTurno: 2
  - Contrato.tiposEscolhidos: ['ESCALA_5X2_DIURNO', 'ESCALA_12X36']

Esperado:
  - 2 postos 5×2 (pois 2 / 1 = 2)
  - 2 postos 12×36 (pois 2 / 1 = 2)
  - Total: 4 postos
```

### 7.3 Teste 3: Modo Personalizado (Validação)

```
Entrada:
  - Cliente.quantidadeIdealPorTurno: 3
  - Contrato.modoPersonalizado: true
  - postosConfig[0]: { tipoP: '5X2', funcPorAloc: 1 }

Esperado:
  - ⚠️ Aviso: "Apenas 1 funcio./turno vs. 3 da política"
  - Permite salvar mesmo assim
```

---

## 8. Summary: Regra de Prioridade Final

| Situação                           | Prioridade                                   | Ação                                         |
| ---------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Modo Automático + tipos escolhidos | **`quantidadeIdealPorTurno` vence**          | Replica escalas até atingir quantidade ideal |
| Modo Personalizado + conflito      | **Avisar, mas permitir**                     | Valida mas não bloqueia o submit             |
| Payload para backend               | **`numeroDePostos` = número real de grupos** | Envia array de configs se disponível         |
| Backend cria alocações             | **Respeita campo `PostoConfigs`**            | Cria postos conforme descritos               |

---

## Apêndice A: Matriz de Decisão — Qual valor vence?

```
┌─────────────────────────────────────────────────────────────────┐
│ CENÁRIOS E REGRAS DE PRIORIDADE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. MODO AUTOMÁTICO (padrão)                                     │
│    ✓ Usuário define quantidadeIdealPorTurno = 3                │
│    ✓ Usuário escolhe tiposEscolhidos = [5X2, 12X36]            │
│    → SISTEMA COMPUTA:                                           │
│        - 5X2 tem 1 funcio./turno → replicas = 3 / 1 = 3        │
│        - 12X36 tem 1 funcio./turno → replicas = 3 / 1 = 3      │
│        - Total: 6 postos (3 + 3)                               │
│    ✅ RESULTADO: quantidadeIdealPorTurno VENCE (governa)        │
│                                                                 │
│ 2. MODO PERSONALIZADO (avançado)                                │
│    ✓ Usuário marca modoPersonalizado = true                    │
│    ✓ Usuário define manualmente:                               │
│        postoA: 5X2 com 1 funcio./turno                          │
│        postoB: 12X36 com 2 funcio./turno (custom!)              │
│    → SISTEMA VALIDA:                                            │
│        ⚠️ PostoB tem 2 vs. 3 da política                        │
│        ⚠️ Total seria 3 pessoas (1 + 2) vs. 3+3=6 esperado      │
│    ✅ RESULTADO: PERMITIR Com AVISOS (quantidadeIdeal é hint)   │
│                                                                 │
│ 3. SE JÁ TEM CONTRATO CRIADO (edição)                           │
│    ✓ Editando contrato existente                                │
│    ✓ Não pode mudar quantidadeIdealPorTurno (campo do cliente) │
│    → SISTEMA PERMITE:                                           │
│        - Modo personalizado sem restrição                       │
│        - (Implementar em Fase 2 se necessário)                  │
│    ✅ RESULTADO: usuário tem liberdade, com avisos              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Apêndice B: Fluxograma de Decisão no Wizard

```
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 1: Define Cliente (quantidadeIdealPorTurno)              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 2: Configurar Contrato                                   │
│                                                                 │
│  [Criar postos automaticamente?]                                │
│  ◉ Sim (padrão)  ○ Não                                          │
│                                                                 │
│  SIM → Modo Automático ─────────────────────────────────────┐   │
│        Escolha tipos de escala: [ ] 5X2  [ ] 12X36 [ ] 8h×3   │
│        [Quantidade ideal será: 3 pessoas/turno]               │
│        → Sistema computa postos automaticamente                │
│        → Mostra preview: "6 postos: 3×5X2 + 3×12X36"          │
│        ◇ Permitir personalizar? [ ] SIM (modo avançado)       │
│                                                                 │
│  NÃO → Modo Personalizado ────────────────────────────────┐   │
│        ⚠️ Você está fora da política oficial.               │
│        Defina manualmente cada posto:                        │
│        Posto 1: [5X2]     Funcs/turno: [1]                  │
│        Posto 2: [5X2]     Funcs/turno: [1]                  │
│        Posto 3: [12X36]   Funcs/turno: [2] ⚠️ (vs 3!)       │
│        [+ Adicionar Posto]  [- Remover]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 3: Revisar & Confirmar                                   │
│                                                                 │
│  Resumo:                                                        │
│  • Cliente: Residencial Estrela                                │
│  • Política: 3 pessoas/turno                                   │
│  • Postos: 6 (3×5X2 + 3×12X36)                                 │
│  • Total estimado: 6 pessoas                                   │
│  • Faturamento mensal: R$ 18.000                               │
│  • [Confirmar Criação]                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Apêndice C: Exemplos de Dados Reais

### C.1 Exemplo 1: Simples (Modo Automático)

```typescript
// Entrada do usuário
const cliente = {
  nome: "Guarda 24h",
  quantidadeIdealPorTurno: 2
};

const contrato = {
  modoPersonalizado: false,
  tiposEscolhidos: ['ESCALA_12X36'],  // Só 1 tipo
  // ... outros campos
};

// Computação automática
const postos = computePostosByQuantidadeIdeal(2, ['ESCALA_12X36']);
// TIPO_POSTO_CONFIGS['ESCALA_12X36'].funcionariosPorAlocacao = 1
// replicas = 2 / 1 = 2

// Resultado
const resultado = [
  { tipoPosto: 'ESCALA_12X36', quantidadeAlocacoes: 2, ... },  // Posto 1
  { tipoPosto: 'ESCALA_12X36', quantidadeAlocacoes: 2, ... },  // Posto 2
];

// Payload para backend
{
  numeroDePostos: 2,
  postoCo...
```

### C.2 Exemplo 2: Múltiplos Tipos (Modo Automático)

```typescript
// Entrada
const cliente = {
  quantidadeIdealPorTurno: 4
};

const contrato = {
  modoPersonalizado: false,
  tiposEscolhidos: ['ESCALA_5X2_DIURNO', 'ESCALA_8H_3TURNOS']
};

// Computação
// 5X2: funcionariosPorAlocacao = 1 → replicas = 4 / 1 = 4
// 8h×3: funcionariosPorAlocacao = 1 → replicas = 4 / 1 = 4
// TOTAL: 8 postos

// Payload
{
  numeroDePostos: 8,
  postoConfigs: [
    { tipoPosto: '5X2', ... },
    { tipoPosto: '5X2', ... },
    { tipoPosto: '5X2', ... },
    { tipoPosto: '5X2', ... },
    { tipoPosto: '8H3', ... },
    { tipoPosto: '8H3', ... },
    { tipoPosto: '8H3', ... },
    { tipoPosto: '8H3', ... }
  ]
}
```

### C.3 Exemplo 3: Personalizado (Modo Manual)

```typescript
// Entrada
const cliente = {
  quantidadeIdealPorTurno: 3
};

const contrato = {
  modoPersonalizado: true,
  postosConfigAtivoDinamico: [
    { tipoPosto: '5X2_DIURNO', quantidadeFuncionariosPorAlocacao: 2 },  // ⚠️ vs 3
    { tipoPosto: '12X36',      quantidadeFuncionariosPorAlocacao: 2 },  // ⚠️ vs 3
    { tipoPosto: '8H3',        quantidadeFuncionariosPorAlocacao: 1 },  // ⚠️ vs 3
  ]
};

// Validação
const warnings = [
  "Post 1 (5×2) tem 2 pessoas/turno vs. 3 da política",
  "Posto 2 (12×36) tem 2 pessoas/turno vs. 3 da política",
  "Posto 3 (8h×3) tem 1 pessoa/turno vs. 3 da política",
  "Total: 5 pessoas vs. 9 esperado (3 × 3)"
];

// UI mostra warnings mas PERMITE salvar
// Payload
{
  numeroDePostos: 3,
  postoConfigs: [
    { tipoPosto: '5X2_DIURNO', quantidadeFuncionariosPorAlocacao: 2 },
    { tipoPosto: '12X36', quantidadeFuncionariosPorAlocacao: 2 },
    { tipoPosto: '8H3', quantidadeFuncionariosPorAlocacao: 1 }
  ]
}
```

---

## Apêndice D: Checklist de Implementação Detalhado

### Frontend (cliente-wizard.component.ts)

- [ ] **Step D.1**: Importar helper `computePostosByQuantidadeIdeal`
  - Arquivo: `shared/helpers/posto-config.helper.ts`
  - Exportar função pública

- [ ] **Step D.2**: Expandir formContrato com novos campos

  ```typescript
  modoPersonalizado: [false]
  tiposEscolhidos: this.fb.array([]),  // ou FormControl multi-select
  ```

- [ ] **Step D.3**: Implementar watcher `setupQuantidadeIdealRespect()`
  - Ouve: `tiposEscolhidos` valueChanges
  - Condição: `!modoPersonalizado`
  - Action: Chama helper → atualiza `postosConfig` FormArray

- [ ] **Step D.4**: Implementar validador `customValidatorQuantidadeIdeal()`
  - Avalia: cada `postosConfig[i].quantidadeFuncionariosPorAlocacao` vs `quantidadeIdealPorTurno`
  - Emite warnings (não erros) para UI

- [ ] **Step D.5**: Atualizar template HTML
  - Adicionar toggle Mode Automático / Personalizado
  - Mostrar `tiposEscolhidos` multi-select em modo automático
  - Mostrar warnings em modo personalizado
  - Preview de quantidade total de postos

- [ ] **Step D.6**: Atualizar `montarPayloadCompleto()`
  - Enviar `quantidadeIdealPorTurno` do cliente
  - Enviar `postosConfigs` com valores reais

- [ ] **Step D.7**: Integração com `setupAutoCalculo()`
  - Recalcular breakdown quando `numeroPostos` muda

### Backend (DTOs e Service)

- [ ] **Step B.1**: Expandir `CreateClienteCompletoDtoInput`

  ```csharp
  public record CreateClienteCompletoDtoInput(
      // ... existentes
      IReadOnlyList<CreatePostoConfigInput>? PostoConfigs = null
  );
  ```

- [ ] **Step B.2**: Criar `CreatePostoConfigInput` record
  - `TipoPosto` (string)
  - `QuantidadeAlocacoes` (int)
  - `QuantidadeFuncionariosPorAlocacao` (int)
  - `AlocacoesNoturnas` (int)

- [ ] **Step B.3**: Atualizar `ClienteOrquestradorService.CriarClienteCompletoAsync()`
  - Se `PostoConfigs != null`: usar configs para criar postos
  - Se `PostoConfigs == null` e `CriarPostosAutomaticamente`: criar genéricos (comportamento atual)

- [ ] **Step B.4**: Validar `PostoConfigs` respeitando `Cliente.QuantidadeIdealPorTurno`
  - Warning: não erro
  - Permitir mesmo com divergência

### Testes

- [ ] **Step T.1**: Unit Tests - Helper `computePostosByQuantidadeIdeal()`
  - Teste 1.1: Entrada simples (1 tipo, quantidade < funcionários/turno)
  - Teste 1.2: Múltiplos tipos
  - Teste 1.3: Quantidade exata (sem replicas)
  - Teste 1.4: Edge case: quantidade = 0 ou negativa

- [ ] **Step T.2**: Integration Tests - Wizard completo
  - Teste 2.1: Salvamento modo automático
  - Teste 2.2: Salvamento modo personalizado
  - Teste 2.3: Validação de warnings (não bloqueia)

- [ ] **Step T.3**: E2E Tests - Contrato criado corretamente
  - Teste 3.1: Verificar contador de postos no dashboard
  - Teste 3.2: Verificar alocações por tipo
  - Teste 3.3: Verificar quantidade total de funcionários

- [ ] **Step T.4**: Backend Integration Tests
  - Teste 4.1: Aceita `PostoConfigs` array
  - Teste 4.2: Respeita configs ao criar alocações
  - Teste 4.3: Comportamento fallback se null

---

## Apêndice E: Perguntas para Validação com o Time

- **Design**: Modo automático deve ser **obrigatório** na primeira criação, ou opcional desde o início?
- **UX**: Mostramos warnings inline (com ícone ⚠️) ou em modal após clique em "Confirmar"?
- **Performance**: Com `computePostosByQuantidadeIdeal()` rodando a cada mudança, há impacto? (Benchmark)
- **Backend**: É aceitável que `PostoConfigs` seja optional (fallback para genéricos)? Ou deve ser obrigatório?
- **Persistência**: Precisa armazenar `modoPersonalizado` no banco ou é só UI?
- **Histórico**: Se usuário corrige um contrato existente, qual modo entra? Detecta modo original?
