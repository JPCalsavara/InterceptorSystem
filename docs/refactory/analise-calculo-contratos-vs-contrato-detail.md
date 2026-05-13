# Analise do calculo de contratos vs contrato-detail

## 1. Objetivo

Documentar como o valor financeiro dos contratos esta sendo calculado no frontend, rastrear pendencias e registrar planos de implementacao.

## 2. Arquitetura do calculo financeiro

### 2.1 Fluxo do contrato-detail

1. Carrega o contrato
2. Carrega funcionarios do cliente e resumo financeiro em paralelo
3. Aguarda ambos completarem (`tentarCarregarCalculo`)
4. Monta input com `buildCalculoValorTotalInput(...)` e sobrescreve com dados operacionais reais
5. Envia para `POST /api/contratos/calculos/calcular-valor-total` (calculo real)
6. Envia para `POST /api/contratos/calculos/simular-sem-alocacoes` (calculo simulado)
7. Exibe breakdown de ambos + comparativo

### 2.2 Fluxo do contrato-list e dashboard

Usam `ContratoFinanceiroUiService` que:

1. Monta input a partir do contrato + resumo financeiro (se disponivel)
2. Chama ambos os endpoints (real + simulado) via `forkJoin`
3. Usa `faturamentoSimulado` como fonte de verdade para faturamento

### 2.3 Fonte de verdade

- **Faturamento:** `faturamentoSimulado` = `custoBaseMensal / (1 - somaMargens)`
- **Custo:** `custoBaseMensal` (retornado pelo endpoint de calculo real)
- **Lucro:** `faturamentoSimulado - custoBaseMensal`

### 2.4 Formula de margem (margem real sobre faturamento)

```
Faturamento = CustoBase / (1 - margemLucro - margemRisco)
MargemLucro = Faturamento × percentualLucro
MargemRisco = Faturamento × percentualRisco
```

Backend (`ContratoCalculoService.cs` L38-41 e L101-104):

```csharp
var somaMargens = input.MargemLucroPercentual + input.MargemCoberturaFaltasPercentual;
var valorTotalMensal = somaMargens >= 1m
    ? custoBaseMensal
    : Math.Round(custoBaseMensal / (1m - somaMargens), 2);
var valorMargemLucro = valorTotalMensal * input.MargemLucroPercentual;
var valorMargemFaltas = valorTotalMensal * input.MargemCoberturaFaltasPercentual;
```

Frontend: labels usam formula `(custo × %) ÷ divisor` com `divisorMargemPercent` computed signal.

### 2.5 Fluxo comparativo visual

```
DETAIL / LIST / DASHBOARD:
  Contrato → Resumo Financeiro → calcular-valor-total (REAL)
                                 → simular-sem-alocacoes (SIMULADO)
  Faturamento = simulacaoBreakdown.faturamentoSimulado
  Custo = breakdown.custoBaseMensal
  Lucro = faturamentoSimulado - custoBaseMensal

Comparativo: variacao = (real - simulado) / |simulado| × 100
```

## 3. Dados de referencia (contrato de teste)

### Relatorio Simulado

| Calculo                 | Formula                | Resultado    |
| ----------------------- | ---------------------- | ------------ |
| Diarias/dia             | 1 × 2 × 1              | 2            |
| Diarias uteis/mes       | 2 × 22                 | 44           |
| Diarias FDS/mes         | 2 × 8                  | 16           |
| Total diarias/mes       | 44 + 16                | 60           |
| Funcionarios projetados | ceil(60/15)            | 4            |
| Custo diarias normais   | 22 × R$ 100            | R$ 2.200     |
| Custo FDS               | 16 × R$ 100 × 2.0      | R$ 3.200     |
| Adicional noturno       | 22 × R$ 100 × 1.2      | R$ 2.640     |
| Beneficios              | 4 × R$ 350             | R$ 1.400     |
| Custo direto            | soma                   | R$ 9.440     |
| Encargos                | R$ 9.440 × 50%         | R$ 4.720     |
| Custo base mensal       | R$ 9.440 + R$ 4.720    | R$ 14.160    |
| Faturamento simulado    | R$ 14.160 / (1 - 0.30) | R$ 20.228,57 |
| Margem lucro            | R$ 20.228,57 × 20%     | R$ 4.045,71  |
| Margem risco            | R$ 20.228,57 × 10%     | R$ 2.022,86  |

### Relatorio Real

| Campo                    | Valor                                  | Rastreamento                            |
| ------------------------ | -------------------------------------- | --------------------------------------- |
| Faturamento              | R$ 20.228,57                           | `faturamentoSimulado()` = custoSim/0.70 |
| Custo Total com Impostos | R$ 15.330,00                           | `custoBaseMensal = custoDireto + enc.`  |
| Custo Total sem Imposto  | R$ 10.220,00                           | `custoDireto`                           |
| Diarias Normais          | 11 × R$ 100 = R$ 1.100                 | diariasDiurnasUteis                     |
| Adicional Noturno        | 31 × R$ 100 × 1.2 = R$ 3.720           | diariasNoturnasUteis                    |
| Custo FDS                | 20 × R$ 100 × 2.0 = R$ 4.000           | diariasFds (DayOfWeek)                  |
| Beneficios               | 4 × R$ 350 = R$ 1.400                  | funcEstimados × beneficios              |
| Encargos                 | R$ 10.220 × 50% = R$ 5.110             | custoDireto × encargos                  |
| Margem Lucro             | (R$ 15.330 × 20%) ÷ 70% = R$ 4.380     | margem real sobre faturamento           |
| Risco                    | (R$ 15.330 × 10%) ÷ 70% = R$ 2.190     | margem real sobre faturamento           |
| Lucro Real               | R$ 20.228,57 - R$ 15.330 = R$ 4.898,57 | faturamentoSim - custoReal              |

## 4. Historico de correcoes (resumo)

| #    | Bug                                                                  | Correcao                                                        |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| 15.x | Dupla contagem impostos, func=1, lucro errado, comparativo invertido | Corrigido (6 bugs)                                              |
| 18.x | Race condition, comparativo com base errada                          | Corrigido (3 bugs)                                              |
| 22.1 | FDS sempre = 0 (usava TipoDiaria em vez de DayOfWeek)                | Backend: `TotalDiariasFimDeSemana` via `DayOfWeek`              |
| 5.5  | Labels inconsistentes (6 labels)                                     | Fórmula `(custo × %) ÷ divisor` + `divisorMargemPercent` signal |
| 5.6  | Markup sobre custo → margem real sobre faturamento                   | `custoBase / (1 - somaMargens)` no backend                      |

## 5. Pendencias ativas

| #   | Item                                        | Gravidade | Status        | Secao |
| --- | ------------------------------------------- | --------- | ------------- | ----- |
| 3   | Salario simulado vs real no contrato-detail | MEDIO     | **PLANEJADO** | 6     |
| 4   | Calculos financeiros no cliente-detail      | ALTO      | PENDENTE      | 7     |
| 5   | Funcionarios do contrato vs API real        | MEDIO     | PENDENTE      | —     |
| 6   | Alocacoes noturnas = 0 sem resumo           | MEDIO     | PENDENTE      | —     |
| 7   | Fallback para campos legados                | BAIXO     | PENDENTE      | —     |
| 10  | Tabela comparativa custo/lucro/salario      | MEDIO     | **PLANEJADO** | 6.7   |

### Causas-raiz pendentes

| #   | Causa                                | Status   |
| --- | ------------------------------------ | -------- |
| 2   | Funcionarios do contrato vs API real | Pendente |
| 3   | Alocacoes noturnas = 0 sem resumo    | Pendente |
| 4   | Fallback para campos legados         | Pendente |

## 6. Plano: Salario simulado vs real no contrato-detail

### 6.1 Objetivo

Adicionar uma tabela "Comparativo Simulado x Real" com colunas para custo, lucro e **salario por funcionario** no `contrato-detail`, diferenciando funcionarios que trabalham a noite dos que nao trabalham.

### 6.2 Dados disponiveis

| Dado                    | Signal                        | Fonte                             |
| ----------------------- | ----------------------------- | --------------------------------- |
| Custo simulado          | `custoTotalFinalSimulado()`   | `simulacaoBreakdown()`            |
| Custo real              | `custoTotalRealComparativo()` | `breakdown()`                     |
| Lucro simulado          | `valorMargemLucroSimulado()`  | `simulacaoBreakdown()`            |
| Lucro real              | `lucroTotalRealComparativo()` | `faturamentoSimulado - custoReal` |
| Funcionarios projetados | `funcionariosProjetados()`    | `simulacaoBreakdown()`            |
| Funcionarios reais      | `funcionariosCliente()`       | API funcionarios                  |

### 6.3 Formulas de salario

#### Simulado (por funcionario)

```
diarias/func/mes = diariasTotaisMes / funcionariosProjetados = 60 / 4 = 15

salarioSimDiurno  = 15 × R$100 + R$350 = R$1.850
salarioSimNoturno = 15 × R$100 × 1.2 + R$350 = R$2.150
```

#### Real (media por funcionario)

```
salarioRealMedio = custoTotalSemImpostoReal / funcionariosCliente
                 = R$10.220 / 4 = R$2.555
```

### 6.4 Diferenciacao noturno vs diurno (Modelo por Dias Médios da Escala)

Para o simulado, dividimos as diárias do mês pelos funcionários projetados e aplicamos a diária com ou sem adicional noturno:

```typescript
// Diurno simulado:
const salarioSimDiurno =
  diariasPorFunc * contrato.valorDiariaCobrada +
  contrato.valorBeneficiosExtrasMensal;

// Noturno simulado:
const salarioSimNoturno =
  diariasPorFunc *
    contrato.valorDiariaCobrada *
    (1 + contrato.percentualAdicionalNoturno) +
  contrato.valorBeneficiosExtrasMensal;
```

Para o cálculo real, usamos o mesmo modelo adotado no `funcionario-detail.component.ts`. Lá, o salário real é calculado iterando sobre as diárias e, em casos de estimativa, utilizando um número de `diasMedio` baseado na `tipoEscala` (ex: 15 para 12x36, 26 para 6x2).

Aplicando isso ao nível do contrato:
No `resumoFinanceiro().projecaoCustoPorAlocacao`, temos o `custoTotal` (soma exata das diárias) e o `totalDiarias` por tipo de alocação (com a flag `temHorarioNoturno`).
Podemos estimar a "quantidade de funcionários" daquela alocação dividindo `totalDiarias` pelos `diasMedio` esperados daquela escala.
Dessa forma, o Salário Real Médio (Diurno ou Noturno) torna-se:

```typescript
// Exemplo para Diurno:
const alocsDiurnas = projecao.filter((a) => !a.temHorarioNoturno);
let totalFuncionarios = 0;
let custoTotal = 0;

for (const a of alocsDiurnas) {
  const diasMedio = getDiasMedio(a.tipoEscala);
  totalFuncionarios += a.totalDiarias / diasMedio; // Quantos "funcionários equivalentes"
  custoTotal += a.custoTotal;
}

const salarioRealMedioDiurno =
  custoTotal / totalFuncionarios + contrato.valorBeneficiosExtrasMensal;
```

Esse cálculo reflete com precisão o peso do valor pago a um funcionário em uma escala sem diluir injustamente em escalas menores.

### 6.5 UI proposta: Layout em Cards/Pills

A interface mantém o padrão original visual (stack layout de cards) mas apresenta o desmembramento:

```
┌─────────────────────────────────────────────────────┐
│ Comparativo Simulado x Real            21,08% a mais│
├─────────────────────────────────────────────────────┤
│ Salário Diurno/Func                                 │
│ [Simulado R$ 1.850] [Real (média) R$ 1.950]         │
│ 5,4% a mais                                         │
├─────────────────────────────────────────────────────┤
│ Salário Noturno/Func                                │
│ [Simulado R$ 2.150] [Real (média) R$ 2.555]         │
│ 18,8% a mais                                        │
└─────────────────────────────────────────────────────┘
```

### 6.6 Computed signals necessarios (Atualizados)

```typescript
private getDiasMedio(tipoEscala: TipoEscala | string): number {
  let diasMedio = 22;
  if (tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) diasMedio = 15;
  else if (tipoEscala === TipoEscala.FOLGUISTA) diasMedio = 8;
  else if (tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS) diasMedio = 26;
  return diasMedio;
}

salarioRealMedioDiurno = computed(() => {
  const resumo = this.resumoFinanceiro();
  if (!resumo || !resumo.projecaoCustoPorAlocacao) return this.salarioRealMedio();

  const alocsDiurnas = resumo.projecaoCustoPorAlocacao.filter(a => !a.temHorarioNoturno);
  let totalFuncionarios = 0;
  let custoTotal = 0;

  for (const a of alocsDiurnas) {
    const diasMedio = this.getDiasMedio(a.tipoEscala);
    if (diasMedio > 0) {
      totalFuncionarios += a.totalDiarias / diasMedio;
      custoTotal += a.custoTotal;
    }
  }

  if (totalFuncionarios === 0) return this.salarioRealMedio();
  const beneficios = this.contrato()?.valorBeneficiosExtrasMensal || 0;
  return (custoTotal / totalFuncionarios) + beneficios;
});

// A mesma lógica se aplica para salarioRealMedioNoturno filtrando a.temHorarioNoturno === true
```

### 6.7 Template HTML

```html
<div class="comparativo-stack">
  <div class="comparativo-card">
    <span class="comparativo-card-label">Salário Diurno/Func</span>
    <div class="comparativo-row">
      <div class="comparativo-pill comparativo-pill-simulado">
        <span>Simulado</span>
        <strong>{{ salarioSimuladoDiurno() | currency: 'BRL' }}</strong>
      </div>
      <div class="comparativo-pill comparativo-pill-real">
        <span>Real (média)</span>
        <strong>{{ salarioRealMedioDiurno() | currency: 'BRL' }}</strong>
      </div>
    </div>
    <div class="comparativo-variation">{{ variacaoSalarioDiurnoTexto() }}</div>
  </div>

  <div class="comparativo-card">
    <span class="comparativo-card-label">Salário Noturno/Func</span>
    <div class="comparativo-row">
      <div class="comparativo-pill comparativo-pill-simulado">
        <span>Simulado</span>
        <strong>{{ salarioSimuladoNoturno() | currency: 'BRL' }}</strong>
      </div>
      <div class="comparativo-pill comparativo-pill-real">
        <span>Real (média)</span>
        <strong>{{ salarioRealMedioNoturno() | currency: 'BRL' }}</strong>
      </div>
    </div>
    <div class="comparativo-variation">{{ variacaoSalarioNoturnoTexto() }}</div>
  </div>
</div>
```

### 6.8 Validacao numerica

```
Simulado (funcProjetados = 4, diariasTotais = 60):
  diarias/func = 60 / 4 = 15
  salarioDiurno  = 15 × R$100 + R$350 = R$1.850
  salarioNoturno = 15 × R$100 × 1.2 + R$350 = R$2.150

Real (funcCliente = 4, custoDireto = R$10.220):
  salarioRealMedio = R$10.220 / 4 = R$2.555

Variacao (diurno como base):
  (2555 - 1850) / 1850 × 100 = 38,11% a mais
```

### 6.9 Plano de implementacao

| Passo | Arquivo                                    | Mudanca                                            | Esforco     |
| ----- | ------------------------------------------ | -------------------------------------------------- | ----------- |
| 1     | `contrato-detail.component.ts`             | Adicionar 5 computed signals (6.6)                 | Baixo       |
| 2     | `contrato-detail.component.html` L86-122   | Substituir pills por tabela (6.7)                  | Medio       |
| 3     | `contrato-detail.component.css`            | Estilos para `.comparativo-table`                  | Baixo       |
| 4     | Validacao visual                           | Verificar valores com contrato de teste            | Verificacao |
| 5     | `funcionario-list.component.ts` (opcional) | Reutilizar formula para `getSalarioSimuladoMensal` | Baixo       |

## 7. Plano: Calculos financeiros no cliente-detail

### Estado atual

```
Receita Total: R$ 14.839,50  ← contrato.valorTotalMensal (campo legado)
Custos Operacionais: R$ 0,00  ← contrato.custoRealMensal (null/undefined)
Lucro: R$ 14.839,50           ← receita - 0 = receita
Margem: 100.00%               ← cascata do custo = 0
```

### Causa-raiz

1. `custoRealMensal` e `undefined` — o backend NAO persiste esse campo, calcula sob demanda
2. O fallback `valorTotalMensal * (1 - margem/100)` calcula errado porque `margemLucroPercentual` pode estar como decimal (0.20)
3. `receitaPeriodo` usa `contrato.valorTotalMensal` em vez de `faturamentoSimulado`

### Solucao proposta

Usar `ContratoFinanceiroUiService` (ja funcional) para calcular custos reais:

```typescript
// cliente-detail.component.ts
import { ContratoFinanceiroUiService } from '../../../services/contrato-financeiro-ui.service';

private financeiroService = inject(ContratoFinanceiroUiService);
calculosDetalhados = signal<Map<string, CalculoFinanceiroDetalhadoOutput>>(new Map());

// Apos carregar contratos:
this.financeiroService.carregarCalculosDetalhados$(contratos).subscribe({
  next: (mapa) => this.calculosDetalhados.set(mapa),
});

// Substituir receitaPeriodo e custoPeriodo:
receitaPeriodo = computed(() => {
  const calculos = this.calculosDetalhados();
  return this.contratosPeriodo().reduce((sum, c) =>
    sum + this.financeiroService.getFaturamentoDetalhado(c, calculos), 0);
});

custoPeriodo = computed(() => {
  const calculos = this.calculosDetalhados();
  return this.contratosPeriodo().reduce((sum, c) =>
    sum + this.financeiroService.getCustoDetalhado(c, calculos), 0);
});
```

### Arquivos impactados

- `frontend/src/app/features/clientes/cliente-detail/cliente-detail.component.ts`

### Esforco: Medio | Prioridade: ALTA (dados completamente errados — custo=0 e margem=100%)

## 8. Arquivos relacionados

- `frontend/src/app/features/contratos/contrato-detail/contrato-detail.component.ts`
- `frontend/src/app/features/contratos/contrato-detail/contrato-detail.component.html`
- `frontend/src/app/services/contrato-financeiro-ui.service.ts`
- `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`
- `frontend/src/app/pages/dashboard/dashboard.component.ts`
- `frontend/src/app/models/index.ts`
- `frontend/src/app/shared/helpers/contrato-calculo.helper.ts`
- `frontend/src/app/features/funcionarios/funcionario-list/funcionario-list.component.ts`
- `frontend/src/app/features/funcionarios/funcionario-detail/funcionario-detail.component.ts`
- `frontend/src/app/features/clientes/cliente-detail/cliente-detail.component.ts`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/ContratoCalculoService.cs`
- `backend/src/InterceptorSystem.Application/BoundedContexts/Operacoes/Services/DiariaAppService.cs`
