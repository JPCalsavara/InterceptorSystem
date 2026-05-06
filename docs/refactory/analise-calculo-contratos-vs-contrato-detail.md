# Analise do calculo de contratos vs contrato-detail

## 1. Objetivo

Documentar como o valor financeiro dos contratos esta sendo calculado hoje no frontend e por que os valores exibidos em `contrato-list` e `dashboard` podem divergir do que o `contrato-detail` mostra como ideal.

Este documento usa o contrato de exemplo informado pelo usuario:

- Faturamento ideal no detail: `R$ 13.981,50`
- Custo real ideal no detail: `R$ 10.755,00`
- Lucro ideal no detail: `R$ 3.226,50`

Tambem considera os dados de apoio do relatorio simulado e do relatorio real exibidos no detail.

## 2. Resumo executivo

Hoje existem tres caminhos de calculo relevantes no frontend:

1. `contrato-detail` monta um payload mais rico, busca o resumo financeiro operacional do contrato e usa esse resumo para sobrescrever as diarias derivadas antes de chamar a API de calculo.
2. `contrato-list` e `dashboard` usam um servico compartilhado de calculo, mas dependem da disponibilidade do resumo financeiro para alinhar os numeros com o detail.
3. Quando o resumo financeiro nao esta sendo usado, os componentes caem para valores de contrato mais genericos ou derivados, o que gera discrepancia.

A diferenca principal nao esta no formato da tela. A diferenca esta na origem dos dados que alimentam o calculo:

- `contract-detail` usa resumo operacional por contrato e periodo.
- `list/dashboard` historicamente dependeram de dados mais genericos do contrato e de suposicoes padrao.

## 3. Como o contrato-detail calcula

### 3.1 Caminho de calculo do detail

O `contrato-detail` segue este fluxo:

1. Carrega o contrato.
2. Carrega o resumo financeiro do contrato via `GET /api/diarias/contrato/{id}/resumo-financeiro`.
3. Monta o input de calculo com `buildCalculoValorTotalInput(...)`.
4. Sobrescreve o input com os valores operacionais reais quando o resumo financeiro existe.
5. Envia o payload para `POST /api/contratos/calculos/calcular-valor-total`.
6. Exibe o breakdown retornado pela API.

### 3.2 O que o detail sobrescreve no payload

O detail nao usa apenas os campos do contrato. Ele ajusta o payload com dados reais do periodo:

- `diariasTotaisMes = totalDiariasNormais + totalDiariasExtras`
- `diariasNoturnasMes` calculado a partir das alocacoes com horario noturno
- `diariasFdsMes = totalDiariasExtras`
- `diariasFeriadosMes = 0`
- `funcionariosEstimados = quantidadeFuncionarios do contrato`

Esse detalhe e importante: o detail usa o resumo operacional do contrato para aproximar a realidade do periodo em vez de depender apenas da configuracao base do contrato.

### 3.3 Exemplo do detail informado pelo usuario

Para o contrato de teste, o detail mostra:

- Faturamento: `R$ 13.981,50`
- Custo real: `R$ 10.755,00`
- Lucro: `R$ 3.226,50`

Isso indica que o detail esta usando uma combinacao de:

- resumo operacional do periodo
- custo direto de diarias
- encargos e provisoes
- margem aplicada sobre a base correta

## 4. Como o contrato-list e o dashboard calculam

### 4.1 Fluxo atual dos cards

Hoje a lista e o dashboard usam o servico compartilhado `ContratoFinanceiroUiService`.

Esse servico monta um `CalculoValorTotalInput` a partir de:

- `numeroDePostos`
- `quantidadeFuncionarios`
- `valorDiariaCobrada`
- `valorBeneficiosExtrasMensal`
- percentuais do contrato

Quando existe um `ContratoResumoFinanceiro`, o servico tambem pode sobrescrever as diarias derivadas com os totais operacionais do contrato.

### 4.2 Onde os numeros ainda podem divergir

A divergencia costuma acontecer por tres motivos:

1. O card ainda depende de fallback do contrato quando o resumo financeiro nao chega a tempo ou nao existe.
2. O payload derivado do contrato usa premissas genericas e nao a mesma granularidade operacional do detail.
3. O resumo financeiro e carregado por periodo e precisa estar sincronizado com o contrato exibido.

### 4.3 Sintoma classico da divergencia

No caso relatado, lista e dashboard mostravam algo como:

- Faturamento: `R$ 8.775,00`
- Custo real: `R$ 11.925,00`
- Lucro: `R$ 2.025,00`

Enquanto o detail exibiu:

- Faturamento: `R$ 13.981,50`
- Custo real: `R$ 10.755,00`
- Lucro: `R$ 3.226,50`

Esse tipo de diferenca normalmente sinaliza que os cards nao estao consumindo exatamente o mesmo resumo operacional que o detail consumiu, ou que algum fallback ainda esta vencendo o dado real.

## 5. Como o relatorio simulado ajuda a explicar a diferenca

O relatorio simulado do detail mostra a base teorica do calculo.

### 5.1 Operacao estimada

O relatorio informado mostra:

- `1` posto
- `2` alocacoes
- `1 func/aloc`
- `2 diarias/dia`
- `22` dias uteis
- `8` dias de fim de semana
- `1` diaria noturna/dia
- `4` funcionarios projetados
- `60` diarias/mensais

### 5.2 Custo mensal simulado

O detail mostra:

- Custo diarias normais: `R$ 2.200,00`
- Custo diarias fim de semana: `R$ 3.200,00`
- Adicional noturno: `R$ 2.640,00`
- Beneficios: `R$ 1.400,00`
- Encargos e provisoes: `R$ 4.720,00`
- Custo base mensal: `R$ 14.160,00`
- Faturamento simulado: `R$ 18.408,00`

Esse bloco e uma simulacao. Ele nao e necessariamente o numero real do periodo, mas mostra a formula base usada para projetar o contrato.

## 6. Como o relatorio real explica o numero final

O relatorio real informado mostra:

- Faturamento real: `R$ 15.541,50`
- Custo direto: `R$ 7.970,00`
- Custo diarias normais: `23` diarias uteis = `R$ 2.300,00`
- Adicional noturno: `31` diarias noturnas = `R$ 3.720,00`
- Custo diarias fim de semana: `8` diarias = `R$ 1.600,00`
- Beneficios/extras: `R$ 1.400,00`
- Funcionarios do cliente: `4`
- Encargos e provisoes: `R$ 3.985,00`
- Margens e provisoes: `R$ 3.586,50`

### 6.1 Leitura correta do relatorio real

O relatorio real nao usa apenas uma estimativa simplificada. Ele incorpora a operacao efetivamente executada no periodo, incluindo:

- dias uteis reais do mes
- diarios noturnos reais
- dias de fim de semana reais
- quantidade real de funcionarios atendendo o contrato

Por isso o detail tende a ser o mais confiavel para o valor exibido ao usuario final.

## 7. Porque a lista e o dashboard ficam diferentes do ideal do detail

### 7.1 Uso de fallback do contrato

Quando o resumo operacional nao esta presente, o servico compartilhado cai para os campos do contrato:

- `valorTotalMensal`
- `custoRealMensal`
- `lucroRealMensal`

Esses campos podem refletir um estado anterior, uma estimativa ou um calculo mais sintetico do contrato.

### 7.2 Ausencia de contexto operacional completo

O detail trabalha com:

- resumo financeiro por contrato e periodo
- projecao de custo por alocacao
- contagem de diarias noturnas
- ajuste de funcionarios estimados

Os cards de lista/dashboard, se calculados apenas com os dados base do contrato, perdem essa granularidade.

### 7.3 Periodo e sincronizacao

O detail e mais explicito sobre o periodo corrente. Se a lista/dashboard carregarem o resumo fora de sincronia ou sem o mesmo periodo, o resultado pode divergir mesmo com o mesmo contrato.

### 7.4 Mistura de estimativa com dado real

Outro fator comum e a mistura de duas fontes:

- dado real do contrato carregado do resumo operacional
- dado derivado do cadastro do contrato

Quando os dois sao combinados sem uma regra clara de prioridade, o valor final pode pender para a estimativa em vez do real.

## 8. Principais pontos do contrato de teste

Para o contrato com o funcionario de salario estimado de `R$ 1.850,00`, o problema nao parece ser o salario em si. O problema e o nivel de agregacao usado no calculo.

O detail parte de uma visao operacional mais completa. A lista e o dashboard historicamente ficaram mais proximos de uma visao contratual/estimada.

Em termos simples:

- detail responde: `quanto este contrato realmente custou neste periodo?`
- list/dashboard tendem a responder: `quanto este contrato parece custar com base no cadastro e nos calculos derivados?`

Essa diferenca explica por que o detail pode chegar a `R$ 13.981,50` de faturamento e os cards ficarem em um numero menor ou diferente.

## 9. Conclusao

A divergencia entre `contrato-detail` e os cards de `contrato-list` / `dashboard` nao e um problema de exibicao. E um problema de fonte de dados e de nivel de detalhe do calculo.

O `contrato-detail` esta mais proximo do valor ideal porque:

- usa resumo financeiro operacional do contrato
- ajusta o payload antes de chamar a API de calculo
- exibe o breakdown real/simulado com dados mais completos

Ja lista e dashboard podem divergir quando:

- usam fallback dos campos do contrato
- nao recebem o resumo financeiro do mesmo periodo
- dependem de suposicoes genericas para diarias e funcionarios

## 10. Recomendacao pratica

Para manter consistencia entre as telas:

1. Tratar o `faturamento simulado` como a base principal para os calculos de exibicao e consolidacao financeira.
2. No `contrato-detail`, separar visualmente o fluxo em tres blocos:
   - custo bruto
   - impostos / provisoes
   - custo total consolidado
3. Reduzir o uso de fallback em `valorTotalMensal`, `custoRealMensal` e `lucroRealMensal` quando o resumo estiver disponivel.
4. Garantir que detail, list e dashboard usem o mesmo periodo de referencia e a mesma fonte de faturamento base.
5. Documentar explicitamente a prioridade de dados:
   - faturamento simulado como base de calculo
   - resumo operacional do contrato como refinamento do periodo
   - calculo da API
   - fallback de contrato apenas como ultimo recurso

## 11. Plano de implementacao sugerido

Se a intencao e alinhar as tres telas com o numero considerado "ideal", vale adotar a seguinte sequencia:

1. Tornar o `faturamento simulado` a base principal dos calculos de exibicao e consolidacao financeira.
2. No `contrato-detail`, separar o fluxo visual em tres blocos: custo bruto, impostos/provisoes e custo total consolidado.
3. Fazer `contrato-list` e `dashboard` consumirem a mesma base de faturamento simulado, sem depender do faturamento real consolidado como primeira opcao.
4. Garantir que detail, list e dashboard usem o mesmo periodo de referencia.
5. Validar o impacto numerico nos tres pontos com o mesmo contrato de teste.

### Ajustes tecnicos esperados

- `ContratoFinanceiroUiService` passa a tratar o resumo simulado como fonte prioritária para faturamento.
- `contrato-detail` deixa de misturar os numeros real e simulado no mesmo bloco de faturamento.
- `contrato-list` e `dashboard` precisam seguir a mesma rega de prioridade para evitar fallback indevido.
- O custo deve continuar podendo ser exibido em detalhe, mas separado entre bruto, imposto e total.

## 12. Arquivos relacionados

- `frontend/src/app/features/contratos/contrato-detail/contrato-detail.component.ts`
- `frontend/src/app/services/contrato-financeiro-ui.service.ts`
- `frontend/src/app/features/contratos/contrato-list/contrato-list.component.ts`
- `frontend/src/app/pages/dashboard/dashboard.component.ts`
- `frontend/src/app/services/diaria.service.ts`
- `frontend/src/app/models/contrato-calculo.models.ts`
- `frontend/src/app/models/index.ts`
