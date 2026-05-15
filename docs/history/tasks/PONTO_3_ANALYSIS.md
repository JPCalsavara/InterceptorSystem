# Análise Detalhada: Ponto 3 — Contrato Detail (Consistência + Layout)

## 1. Problema Atual

### 1.1 Cálculos Locais Divergem da API

O componente `contrato-detail.component.ts` define **computed signals** que recalculam custos localmente:

```typescript
// ❌ PROBLEMA: isso duplica lógica que o backend já faz
custoBaseDiarias = computed(() => {
  const diariasTotais = this.contrato().diariasTotaisMes || 0;
  const valorDiaria = this.contrato().valorDiariaCobrada || 0;
  return diariasTotais * valorDiaria;
});

adicionalNoturnoTotal = computed(() => {
  const diariasNoturnas = this.contrato().diariasNoturnasMes || 0;
  const valorDiaria = this.contrato().valorDiariaCobrada || 0;
  const percentual = (this.contrato().percentualAdicionalNoturno || 0) / 100;
  return diariasNoturnas * valorDiaria * percentual;
});

custoTotal = computed(() => {
  return (
    this.custoBaseDiarias() +
    this.adicionalNoturnoTotal() +
    this.adicionalFimSemanaTotal() +
    this.beneficiosTotal() -
    this.desonestoTotal()
  );
});
```

**Impacto**:

- Se backend retorna `valorTotalMensal: 18.000`, mas componente calcula `17.999`
- Usuário vê **2 resultados diferentes** na mesma tela
- Auditoria falha: qual número é correto?

### 1.2 Falta de Caching de Resultado da API

Quando `contrato-detail` carrega, não há endpoint específico de "retornar cálculo completo". O componente precisa:

1. Buscar contrato básico: `GET /api/contratos/:id`
2. **Manualmente** recompor payload e chamar `POST /api/contratos/calculos/calcular-valor-total`
3. Renderizar resultado

**Problema**: Em erro de API, componente cai para fórmula local (que diverge!)

### 1.3 Layout Desorganizado

Atualmente mostra tudo em uma coluna comprida. Usuário precisa rolar muito. Não há hierarquia visual clara de:

- Informações básicas do contrato
- Indicadores de saúde (margem, custos)
- Projeção mensal (breakdown)
- Postos de trabalho configurados
- Relatório mensal

---

## 2. Análise da Arquitetura Esperada

### 2.1 Fluxo Ideal

```
┌─────────────────────────────────────────────────────────┐
│ Carregamento (ngOnInit)                                 │
├─────────────────────────────────────────────────────────┤
│ 1. GET /api/contratos/:id → objeto básico               │
│ 2. Derivar diárias (usando helper compartilhado)        │
│ 3. POST /api/contratos/calculos/calcular-valor-total    │
│    com CalculoValorTotalInput                           │
│ 4. **CACHE o resultado** em signal `calculoCompleto`    │
│ 5. Renderizar tudo baseado em `calculoCompleto()`       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Em Erro de API                                          │
├─────────────────────────────────────────────────────────┤
│ • mostrar estado "Erro ao carregar cálculo"             │
│ • SEM fallback para fórmula local                       │
│ • Oferecer botão "Tentar novamente"                     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Separação de Responsabilidades

| Responsabilidade | Componente           | Implementação                                       |
| ---------------- | -------------------- | --------------------------------------------------- |
| Buscar contrato  | detail.component     | `contratoService.getById()`                         |
| Derivar métricas | **helper**           | `buildCalculoInput()` (novo)                        |
| Calcular         | **backend API**      | `POST /api/contratos/calculos/calcular-valor-total` |
| **Cachear**      | **detail.component** | signal `calculoCompleto`                            |
| Renderizar       | detail.component     | templates baseado em `calculoCompleto()`            |

**Nunca**: recomputar fórmula no detail

---

## 3. Solução: Remove Cálculos Locais, Cacheia API

### 3.1 Novo Sinal para Cache

```typescript
// Ao invés de 5 computed signals que recalculam:
calculoCompleto = signal<CalculoValorTotalOutput | null>(null);
carregandoCalculo = signal(false);
erroCalculo = signal<string | null>(null);

// Remover:
// ❌ custoBaseDiarias = computed(...)
// ❌ adicionalNoturnoTotal = computed(...)
// ❌ custoTotal = computed(...)
```

### 3.2 Novo Método para Carregar Cálculo

```typescript
private carregarCalculo(): void {
  this.carregandoCalculo.set(true);
  this.erroCalculo.set(null);

  const contrato = this.contrato();
  if (!contrato) return;

  // Usar helper compartilhado para montar input
  const input = buildCalculoInput(
    contrato.diariasTotaisMes,
    contrato.diariasNoturnasMes,
    contrato.diariasFdsFeriadosMes,
    contrato.valorDiariaCobrada,
    contrato.funcionariosEstimados,
    contrato.valorBeneficiosExtrasMensal,
    contrato.percentualEncargosProvisoes,
    contrato.percentualAdicionalNoturno,
    contrato.percentualAdicionalFimSemana,
    contrato.margemLucroPercentual,
    contrato.margemCoberturaFaltasPercentual
  );

  this.calculoService.calcularValorTotal(input).subscribe({
    next: (resultado) => {
      this.calculoCompleto.set(resultado);
      this.carregandoCalculo.set(false);
    },
    error: (err) => {
      this.erroCalculo.set('Erro ao calcular valores. Tente novamente.');
      this.carregandoCalculo.set(false);
    }
  });
}
```

### 3.3 Atualizar Template

```html
@if (erroCalculo()) {
<div class="alert alert-danger">
  {{ erroCalculo() }}
  <button (click)="carregarCalculo()">Tentar Novamente</button>
</div>
} @else if (carregandoCalculo()) {
<div class="spinner"></div>
} @else if (calculoCompleto()) {
<!-- Renderizar baseado em calculoCompleto() -->
<div class="custo-base">{{ calculoCompleto().custoBaseMensal | currency }}</div>
<div class="adicional-noturno">
  {{ calculoCompleto().valorAdicionalNoturno | currency }}
</div>
... }
```

---

## 4. Novo Layout: 3 Colunas (Desktop) | Stacked (Mobile)

### 4.1 Estrutura de Grade

```html
<div class="container-3col">
  <section class="col-1">
    <!-- Coluna 1: Informações Gerais + Indicadores -->
  </section>

  <section class="col-2">
    <!-- Coluna 2: Projeção Mensal + Postos -->
  </section>

  <section class="col-3">
    <!-- Coluna 3: Relatório Mensal Detalhado -->
  </section>
</div>
```

### 4.2 Coluna 1: Informações Gerais + Indicadores

**Conteúdo**:

```
📋 INFORMAÇÕES DO CONTRATO
├─ Cliente: Residencial XYZ
├─ Data Início: 01/01/2026
├─ Data Fim: 31/12/2026
├─ Status: [ATIVO]
└─ Descrição: Contrato de vigilância

🎯 INDICADORES DE SAÚDE
├─ Margem de Lucro: 20% ✓ (verde)
├─ Margem Faltas: 10% ✓ (verde)
├─ Encargos: 15% ⚠️ (amarelo se > 20%)
└─ Faturamento/Custo: 1.45x ✓ (bom)

⚙️ CONFIGURAÇÃO
├─ Tipo de Posto: 12×36 Diurno/Noturno
├─ % Noturno: 25%
├─ % Fim de Semana: 30%
└─ Benefícios/Mês: R$ 3.500,00
```

**SCSS**:

```scss
.col-1 {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;

  .section {
    margin-bottom: 20px;

    &:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 20px;
    }
  }

  .indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0;

    .value {
      font-weight: bold;
      font-size: 16px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
}
```

### 4.3 Coluna 2: Projeção Mensal + Postos de Trabalho

**Conteúdo**:

```
📊 PROJEÇÃO MENSAL (Baseada na API)
┌────────────────────────────────┐
│ Custo Base (Diárias)           │
│ ├─ Diárias Úteis    120 dias   │
│ ├─ Custo/Dia        R$ 120     │
│ └─ Subtotal         R$ 14.400  │
│                                 │
│ Adicionais                      │
│ ├─ Adicional Noturno 25%        │
│ │  80 diárias × R$ 120 × 25%  │
│ │  = R$ 2.400                  │
│ |                              │
│ ├─ Adicional FdS 30%           │
│ │  35 diárias × R$ 120 × 30%  │
│ │  = R$ 1.260                  │
│                                 │
│ Benefícios                      │
│ ├─ Benefícios/Mês  R$ 3.500    │
│ └─ Subtotal        R$ 3.500    │
│                                 │
│ CUSTO DIRETO       R$ 21.560   │
│                                 │
│ Markup (Encargos + Lucro)       │
│ ├─ Encargos 15%:   R$ 3.234    │
│ ├─ Lucro 20%:      R$ 4.312    │
│ └─ Subtotal        R$ 7.546    │
│                                 │
│ FATURAMENTO MENSAL R$ 29.106   │
└────────────────────────────────┘

👥 POSTOS DE TRABALHO
├─ Posto 1: 12×36 (Diurno/Noturno)
│  ├─ Alocações: 2 (diurno + noturno)
│  ├─ Pessoas/Aloc: 1
│  └─ Total: 2 pessoas
│
├─ Posto 2: 12×36 (Diurno/Noturno)
│  ├─ Alocações: 2
│  ├─ Pessoas/Aloc: 1
│  └─ Total: 2 pessoas
│
└─ Total Geral: 4 pessoas
```

### 4.4 Coluna 3: Relatório Mensal Detalhado

**Conteúdo**:

```
📈 RELATÓRIO MENSAL CONSOLIDADO

Data          | Diárias | Custo Base | % Noturno | % Fds | Adicionais | Total
──────────────┼─────────┼────────────┼──────────┼───────┼────────────┼─────────
Semana 1      | 5       | R$ 600    | R$ 150  | —     | R$ 750    | R$ 600
Semana 2      | 6       | R$ 720    | R$ 180  | —     | R$ 900    | R$ 720
Semana 3      | 5       | R$ 600    | R$ 150  | —     | R$ 750    | R$ 600
Fim de Semana | 2       | R$ 240    | —       | R$ 72 | R$ 72     | R$ 240
──────────────┴─────────┴────────────┴──────────┴───────┴────────────┴─────────
ABRIL         | 120     | R$ 14.400 | R$ 2.400 | R$ 1.260 | R$ 3.660 | R$ 18.060

Detalhamento de Custos:
• Custo Direto: R$ 21.560
  ├─ Base (diárias): R$ 14.400
  ├─ Noturno: R$ 2.400
  ├─ FdS: R$ 1.260
  └─ Benefícios: R$ 3.500

• Encargos (15%): R$ 3.234
• Lucro (20%): R$ 4.312
• TOTAL: R$ 29.106
```

---

## 5. Implementação Passo-a-Passo

### 5.1 Frontend Changes

#### 5.1.1 Remover Cálculos Locais

```typescript
// ❌ DELETE THESE:
custoBaseDiarias = computed(...)
adicionalNoturnoTotal = computed(...)
adicionalFimSemanaTotal = computed(...)
custoTotal = computed(...)
```

#### 5.1.2 Adicionar Cache Signal

```typescript
calculoCompleto = signal<CalculoValorTotalOutput | null>(null);
carregandoCalculo = signal(false);
erroCalculo = signal<string | null>(null);
```

#### 5.1.3 Implementar `carregarCalculo()`

- Chamar `buildCalculoInput()` helper
- Chamar `calculoService.calcularValorTotal(input)`
- Cachear resultado em `calculoCompleto`
- Tratar erro sem fallback local

#### 5.1.4 Atualizar `ngOnInit()`

```typescript
ngOnInit(): void {
  this.contratoService.getById(id).subscribe(contrato => {
    this.contrato.set(contrato);
    this.carregarCalculo();  // ← carrega após contrato
  });
}
```

#### 5.1.5 Atualizar Template

- Usar `calculoCompleto()` em lugar de computed signals
- Adicionar spinners e error states
- Implementar 3-col layout (css grid)

### 5.2 Backend Changes (Mínimo)

Sem mudanças! `POST /api/contratos/calculos/calcular-valor-total` já existe.

### 5.3 Helper Compartilhado

Usar helper `buildCalculoInput()` do Ponto 2:

```typescript
// shared/helpers/calculo.helper.ts
export function buildCalculoInput(
  diariasTotais: number,
  diariasNoturnas: number,
  diariasFds: number,
  valorDiaria: number,
  funcionarios: number,
  beneficios: number,
  percentualEncargos: number,
  percentualNoturno: number,
  percentualFds: number,
  percentualLucro: number,
  percentualFaltas: number,
): CalculoValorTotalInput {
  return {
    valorDiariaCobrada: valorDiaria,
    diariasTotaisMes: diariasTotais,
    diariasNoturnasMes: diariasNoturnas,
    diariasFdsFeriadosMes: diariasFds,
    funcionariosEstimados: funcionarios,
    valorBeneficiosExtrasMensal: beneficios,
    percentualEncargosProvisoes: percentualEncargos / 100,
    percentualAdicionalNoturno: percentualNoturno / 100,
    percentualAdicionalFimSemana: percentualFds / 100,
    margemLucroPercentual: percentualLucro / 100,
    margemCoberturaFaltasPercentual: percentualFaltas / 100,
  };
}
```

---

## 6. Testes de Validação

### 6.1 Unit: Helper Compartilhado

- Input válido → Output esperado
- Input com zeros → Output sem exceção
- Percentuais > 100% → tratado corretamente

### 6.2 Integration: Contrato Detail

- Carregar contrato → API calcula → mostra resultado ✓
- API falha → mostra erro, SEM fallback local ✓
- Botão "Tentar Novamente" → recalcula ✓

### 6.3 E2E: Layout Visual

- Desktop: 3 colunas lado-a-lado ✓
- Tablet: 2 colunas (col 1+2 acima, col 3 abaixo) ✓
- Mobile: 1 coluna (stacked) ✓

### 6.4 Regressão: Sem Divergência

- Mesmo contrato em form/detail/wizard → mesmo faturamento ✓
- Cálculo offline impossível → UI bloqueia claramente ✓

---

## 7. Critérios de Aceite (Ponto 3)

| Critério                      | Verificação                                            |
| ----------------------------- | ------------------------------------------------------ |
| **Sem cálculos locais**       | Grep zero `computed(() => { ... × ... })` em detail    |
| **Cacheia API**               | Sinal `calculoCompleto` recebe resultado do POST       |
| **Sem fallback local**        | Em erro, mostra "Erro ao carregar" + botão retry       |
| **Layout 3 colunas**          | Desktop mostra 3 colunas, mobile stacked               |
| **Same-contrato consistency** | Mesmo contrato em form/detail mostra mesmo faturamento |
| **Indicadores visuais**       | Margens com badges (verde/amarelo/vermelho)            |

---

## 8. Próximas Ações (Ponto 3)

- [ ] Criar/expandir helper `buildCalculoInput()` (compartilhado com wizard, form)
- [ ] Remover 5 computed signals do detail
- [ ] Adicionar sinal `calculoCompleto` + `carregarCalculo()`
- [ ] Atualizar template com novo layout 3 colunas
- [ ] Implementar CSS Grid responsivo
- [ ] Testes: 4 integration + 3 E2E
- [ ] Verificação: sem divergência entre telas
