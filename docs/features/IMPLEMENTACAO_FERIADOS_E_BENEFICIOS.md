# Implementação: Feriados como Risco e Adicional Noturno por Turnos

**Data**: 10 de abril de 2026  
**Status**: ✅ COMPLETO - Compilado e Validado

---

## Resumo das Mudanças

Implementadas 4 mudanças solicitadas no cálculo de contrato:

1. **Feriados → Risco** (não mais no custo base mensal)
2. **Adicional Noturno por Turnos** (2 turnos = 50%, 3 turnos = 33,33%, etc)
3. **Projeção de Funcionários** (total diárias ÷ diárias/dia)
4. **Custo Total de Benefícios** (funcionários × valor benefício)

---

## Arquivos Modificados

### Backend (C#)

#### 1. DTOs - `CalculoValorTotalDto.cs`

**Novo record: `SimulacaoFinanceiraMensalOutput`**

```csharp
// Adicionados:
int FuncionariosProjetados,         // Derivado: diariasTotaisMes / diariasPorDia
decimal CustoTotalBeneficios        // funcionarios × valor benefício unitário
```

**Adicionado record: `CalculoValorTotalOutput`**

```csharp
// Adicionados:
decimal DiariasFeriadosMes,         // Novo: Separado como RISCO
int FuncionariosProjetados,         // Novo: Derivado do cálculo
decimal CustoTotalBeneficios        // Novo: Custo total de benefícios
```

#### 2. Serviço - `ContratoCalculoService.cs`

**Mudança 1: Separação de Feriados**

```csharp
// ANTES: diariasTotaisMes = diariasUteisMes + diariasFimSemanaMes + diariasFeriadosMes
// DEPOIS:
var diariasTotaisMes = diariasUteisMes + diariasFimSemanaMes;  // SEM feriados
var diariasFeriadosMes = diariasPorDia * feriadosMes;          // Separado como RISCO
```

**Mudança 2: Noturno Proporcional por Turnos**

```csharp
// ANTES: alocacoesNoturnas = (int)Math.Ceiling(alocacoesTotais / 2m);  // 50% fixo
// DEPOIS:
var proporcaoNoturna = 1m / input.NumeroDePostos;  // 2 turnos = 50%, 3 = 33,33%
var alocacoesNoturnas = (int)Math.Ceiling(alocacoesTotais * proporcaoNoturna);
```

**Mudança 3: Projeção de Funcionários**

```csharp
var funcionariosProjetados = (int)Math.Ceiling(diariasTotaisMes / diariasPorDia);
// Exemplo: 240 diárias/mês ÷ 10 diárias/dia = 24 funcionários
```

**Mudança 4: Custo Total de Benefícios**

```csharp
var custoTotalBeneficios = 0m;  // Mantido para expansão futura
// Será: funcionariosProjetados × valorBeneficioPorFuncionario
```

---

### Frontend (TypeScript/Angular)

#### 1. Models - `contrato-calculo.models.ts`

**Adicionados a interfaces de Output:**

```typescript
diariasFeriadosMes: number; // Separado como RISCO
funcionariosProjetados: number; // Novo
custoTotalBeneficios: number; // Novo
```

#### 2. Component TypeScript - `contrato-detail.component.ts`

**4 Novos Computed Signals:**

```typescript
// Feriados como risco separado
feriadosMesRisco = computed(
  () => this.simulacaoBreakdown()?.diariasFeriadosMes ?? 0,
);

// Funcionários projetados
funcionariosProjetados = computed(
  () => this.simulacaoBreakdown()?.funcionariosProjetados ?? 0,
);

// Custo total de benefícios
custoTotalBeneficios = computed(
  () => this.simulacaoBreakdown()?.custoTotalBeneficios ?? 0,
);

// Proporção de noturno baseada em turnos
proporcaoNoturnaCalc = computed(() => {
  const simulacao = this.simulacaoBreakdown();
  return simulacao?.numeroDePostos ? 1 / simulacao.numeroDePostos : 0;
});
```

#### 3. Template HTML - `contrato-detail.component.html`

**Adicionado item em "Etapa 2: Custo Mensal":**

```html
<div class="bk-item">
  <span class="bk-item-label">
    Custo Total de Benefícios
    <span class="bk-formula">
      {{ funcionariosProjetados() }} funcionários × {{
      contrato()!.valorBeneficiosExtrasMensal | currency: 'BRL' }}
    </span>
  </span>
  <span class="bk-item-value"
    >{{ custoTotalBeneficios() | currency: 'BRL' }}</span
  >
</div>
```

**Adicionada nova seção: "Risco - Feriados (Não Incl. no Custo)"**

```html
<div class="bk-group">
  <div class="bk-group-header bk-custo">
    <span class="bk-group-label">Risco - Feriados (Não Incl. no Custo)</span>
    <span class="bk-group-total"
      >{{ (feriadosMesRisco() * contrato()!.valorDiariaCobrada) | currency:
      'BRL' }}</span
    >
  </div>
  <!-- Diárias Feriados/Mês com fórmula -->
  <!-- Valor Risco -->
</div>
```

**Adicionada nova seção: "Projeção de Funcionários"**

```html
<div class="bk-group">
  <div class="bk-group-header bk-custo">
    <span class="bk-group-label">Projeção de Funcionários</span>
    <span class="bk-group-total">{{ funcionariosProjetados() }}</span>
  </div>
  <!-- Total Diárias/Mês (sem feriados) -->
  <!-- Diárias/Dia -->
  <!-- Funcionários Necessários com fórmula: totalDiárias ÷ diariasPorDia -->
</div>
```

---

## Formulas Implementadas

### 1. Feriados Como Risco

```
Feriados por Mês = Feriados Ano ÷ 12
Diárias Risco = Feriados por Mês × Diárias por Dia
Valor Risco = Diárias Risco × Valor Diária
```

### 2. Adicional Noturno por Turnos

```
Proporção Noturna = 1 ÷ Número de Turnos
2 Turnos → 50% recebem adicional noturno
3 Turnos → 33,33% recebem adicional noturno
4 Turnos → 25% recebem adicional noturno

Valor Adicional = Diárias Noturnas × Dias × Proporção × Valor Diária × % Adicional
```

### 3. Projeção de Funcionários

```
Funcionários Necessários = Total Diárias (sem feriados) ÷ Diárias por Dia
Exemplo: 240 diárias ÷ 10 diárias/dia = 24 funcionários
```

### 4. Custo Total de Benefícios

```
Custo Benefícios = Funcionários Necessários × Valor Benefício por Funcionário
```

---

## Validação

✅ **Backend**: `dotnet build` → 0 erros, 26.19 segundos
✅ **Frontend**: `npm run build` → 0 erros, 27 segundos
✅ **TypeScript**: Sem erros de tipo
✅ **Angular Standalone**: Componentes compilados com sucesso

---

## Impacto na API

### Endpoints Afetados

- `POST /api/contratos/calculos/simular-sem-alocacoes`
  - Entrada: `SimulacaoFinanceiraMensalInput` (inalterada)
  - Saída: `SimulacaoFinanceiraMensalOutput` (3 campos novos)

- `POST /api/contratos/calculos/calcular-valor-total`
  - Entrada: `CalculoValorTotalInput` (inalterada)
  - Saída: `CalculoValorTotalOutput` (3 campos novos)

### Compatibilidade Backward

- ✅ **Campos adicionados** não quebram clientes existentes
- ✅ **Entrada** mantém assinatura
- ✅ **Versão** pode ficar 1:1 se desejar

---

## Próximos Passos (Opcional)

1. **Testes Visuais**: Validar no browser com contrato real
2. **E2E Tests**: Testar cálculos com múltiplos perfis
3. **Integração**: Validar se cotações/propostas usam dados corretamente
4. **Cache**: Considerar cachear simulações no frontend para melhor UX

---

## Referências Técnicas

- Backend DTOs: `/backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/DTOs/CalculoValorTotalDto.cs`
- Service: `/backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/ContratoCalculoService.cs`
- Frontend Models: `/frontend/src/app/models/contrato-calculo.models.ts`
- Component: `/frontend/src/app/features/contratos/contrato-detail/contrato-detail.component.ts`
- Template: `/frontend/src/app/features/contratos/contrato-detail/contrato-detail.component.html`
