# Task Plan: Refatoração ContratoCalculosController — Modelo Baseado em Diárias

## Goal

Refatorar o cálculo financeiro de contratos para usar diárias reais por tipo de escala (não `× 30` fixo), com divisor de funcionários por escala, adicional de fds/feriado, e extração da lógica para um serviço na camada Application.

## Current Phase

Implementação de Endpoint de Cálculo de Custo Real do Contrato

---

## Novo Ciclo (Implementação: Endpoint Cálculo Custo Real do Contrato)

### Ponto 1: Criar endpoint e serviço de cálculo

- [x] Criar `IContratoCustoRealAppService` na camada Application
- [x] Implementar `ContratoCustoRealAppService` com lógica de cálculo baseada em diárias reais
- [x] Criar controller endpoint (POST) para expor o serviço
- [x] Criar DTO `CustoRealOutput` com breakdown: `CustoTotalDiarias`, `CustoTotalBeneficios`, `CustoReal`, `LucroReal`
- [x] Registrar serviço no DI (`DependencyInjection.cs`)
- **Status:** completed

### Ponto 2: Atualizar repositórios e queries

- [x] Adicionar `GetAlocacoesByClienteIdAsync` ao `IAlocacaoRepository` e `AlocacaoRepository`
- [x] Adicionar `GetDiariasByAlocacoesIdsAsync` ao `IDiariaRepository` e `DiariaRepository`
- [x] Adicionar `GetByClienteId` ao `IContratoRepository` e `ContratoRepository`
- [x] Validar o endpoint em runtime após corrigir o schema de `Postos`
- **Status:** completed

---

## Novo Ciclo (Correção do Bug de Seleção do Tipo de Posto)

### Ponto 1: Investigar travamento do Tipo de Posto (12x36)

- [x] Diagnosticar porque a alteração no dropdown de "Tipo de Posto" não está refletindo na atualização do `PostoConfig` (formulário ou state manager).
- [x] Verificar se o helper de cálculo está ignorando a seleção ou se o componente está forçando o valor padrão de volta.
- [x] Identificar a raiz do problema no fluxo (frontend form, wizard ou DTO).
- **Status:** completed

### Ponto 2: Implementar a correção

- [x] Corrigir o binding (v-model/formControl) do dropdown de Tipo de Posto.
- [x] Assegurar que ao alterar o Tipo de Posto, a quantidade de alocações, os funcionários por alocação e o adicional noturno sejam atualizados adequadamente de acordo com as métricas do tipo selecionado.
- [x] Validar a correção criando um novo posto não-12x36 e verificando os cálculos no frontend.
- **Status:** completed

---

## Novo Ciclo (Correcao do Wizard - Criacao Completa em Cascata)

### Ponto 1: Diagnosticar fluxo atual (AS-IS)

- [x] Mapear sequencia frontend/backend do wizard de clientes completos
- [x] Confirmar que endpoint orquestrado cria cliente, contrato, posto e alocacao
- [x] Confirmar que funcionarios sao criados em chamadas separadas no frontend
- [x] Confirmar risco de sucesso parcial por ausencia de atomicidade fim-a-fim
- **Status:** completed

### Ponto 2: Desenhar solucao alvo (TO-BE)

- [x] Definir diagrama de sequencia para fluxo alvo unificado
- [x] Definir estrategia de transacao unica para incluir funcionarios no orquestrador
- [x] Definir fases de implementacao (atomicidade, consistencia, vinculo alocacao)
- **Status:** completed

### Ponto 3: Planejar implementacao incremental

- [x] Registrar backlog tecnico de fase 1 (payload + orquestracao + retorno)
- [x] Registrar backlog tecnico de fase 2 (validacoes e distribuicao por escala)
- [x] Registrar fase 3 opcional (vinculo explicito funcionario x alocacao)
- [ ] Executar implementacao da fase 1 no codigo
- [ ] Cobrir testes de integracao para sucesso e rollback
- **Status:** in_progress

---

## Novo Ciclo (Expansao de Escopo Condominio + Talentos)

### Ponto 1: Atualizar baseline de escopo

- [x] Incluir container Python adicional na estrategia de infraestrutura
- [x] Incluir caso de uso de captacao de curriculos (vigias/manutencao)
- [x] Incluir caso de uso de leitura facial em totem (entrada/saida)
- [x] Incluir modulo de gestao de manutencao condominial
- [x] Incluir modulo para moradores (encomendas e area gourmet)
- **Status:** completed

### Ponto 2: Organizar prioridades por ondas

- [x] Definir foco inicial: Core + saida financeira + captacao de curriculos + leitura de totem
- [x] Posicionar manutencao como prioridade de segunda onda
- [x] Posicionar modulo moradores como prioridade de terceira onda
- **Status:** completed

### Ponto 3: Organizar complexidade e risco de execucao

- [x] Classificar complexidade por iniciativa (Media/Alta)
- [x] Identificar fatores de complexidade por frente (tecnica, integracao, compliance)
- [x] Registrar roadmap em ondas para reduzir risco de entrega
- **Status:** completed

---

## Ciclo Atual (Documentacao PMI)

### Ponto 1: Definir baseline documental (PMI)

- [x] Mapear templates em `docs/docs-base-pmp/planejamento`
- [x] Confirmar restricao de formato (`.md` e `.png`)
- [x] Definir padrao de nomenclatura UNIX (kebab-case, minusculas)
- [x] Criar plano mestre de execucao em `plano-documentacao-pmi-interceptorsystem.md`
- [x] Atualizar os 12 documentos PMI com base no `README.md` e nos documentos de planejamento
- [x] Harmonizar estrutura e linguagem entre os planos (integracao, escopo, cronograma, custos, qualidade, recursos, comunicacao, riscos, stakeholders e aquisicoes)
- **Status:** completed

### Ponto 2: Organizar trilha de UML (etapa futura)

- [x] Definir backlog inicial de diagramas UML prioritarios
- [x] Definir convencoes de nomenclatura para artefatos UML
- [x] Preparar pasta `docs/docs-base-pmp/diagramas-uml`
- [x] Criar guia inicial em `docs/docs-base-pmp/diagramas-uml/README.md`
- [x] Produzir diagramas UML em `.md` (Mermaid): caso de uso, cenarios, robustez, sequencia e classes
- **Status:** completed

### Ponto 3: Reescrita baseada em README + codigo + testes

- [x] Levantar inventario real de endpoints nos controllers da API
- [x] Confirmar arquitetura de Bounded Contexts, multi-tenant e cache/eventos
- [x] Confirmar base de infraestrutura (compose) e pipeline de CI/CD
- [x] Confirmar cobertura de testes unitarios e de integracao para fluxos criticos
- [x] Reescrever os 12 planos canonicos em `docs/docs-pmp-uml/planejamento` com base nas evidencias
- **Status:** completed

### Ponto 4: Refinamento de segunda rodada (README)

- [x] Expandir `plano-escopo.md` com matriz de rastreabilidade e modulos funcionais
- [x] Expandir `plano-integracao.md` com endpoints criticos, gates e dependencias externas
- [x] Expandir `plano-qualidade.md` com baselines, gates de release e metricas
- [x] Expandir `plano-cronograma.md` com janela de roadmap tecnico do README
- [x] Expandir `plano-riscos.md` com riscos de E2E, cache e deriva de contratos de API
- [x] Expandir `plano-stakeholders.md` com necessidades de informacao e estrategia por fase
- **Status:** completed

---

## Ciclo Atual (Planejamento de Consolidação)

### Ponto 1: Unificar regra de cálculo (Front vs Backend)

- [x] Analisar divergências entre `cliente-wizard`, `contrato-form`, `contrato-detail` e `contrato-list`
- [x] Decidir fonte única de verdade para cálculo financeiro
- [x] Definir escopo do frontend (métricas operacionais + montagem de payload)
- [x] Definir escopo do backend (fórmula monetária oficial)
- [ ] Validar impactos de performance e estratégia de cache no frontend
- **Status:** completed (decisão arquitetural tomada)

### Ponto 2: Padronizar payload e helper compartilhado no frontend

- [x] Criar helper único para derivar diárias e funcionários estimados por tipo de posto
- [x] Padronizar montagem de `CalculoValorTotalInput` no wizard e no form
- [x] Remover cálculos monetários locais duplicados
- [x] Definir fallback visual em caso de falha da API de cálculo
- **Status:** completed

### Ponto 3: Contrato Detail — consistência + novo layout

**Documentação Completa**: Ver [PONTO_3_ANALYSIS.md](PONTO_3_ANALYSIS.md)

**Problema**: 5 computed signals recalculam custos localmente, divergindo da API

**Solução**: Remover cálculos locais, cachear resultado da API, novo layout 3 colunas

**Subtarefas**:

- [x] Criar/expandir helper `buildCalculoInput()` (compartilhado com wizard, form)
- [x] Remover 5+ computed signals (custoBaseDiarias, adicionalNoturnoTotal, etc)
- [x] Adicionar signal `breakdown` para cachear resultado da API
- [x] Implementar método `carregarCalculo()` que chama POST /api/contratos/calculos
- [x] Remover fallback para fórmula local (mostrar erro ao invés)
- [x] Atualizar template: adicionar loading/error states, usar breakdown para valores
- [x] Simplificar layout: mostra faturamento, custo (base+adicionais+impostos), lucro estimado
- [x] Resumo operacional: funcionários estimados, diárias totais, diárias noturnas, FDS/feriados
- [x] Postos de Trabalho: lista postos associados ao contrato
- [x] Testes: validação compilação, sem errors ✅
- **Status:** completed (refactoring concluído, sem erros de compilação)

### Ponto 4: Ajustes finos do relatório simulado e real

**Objetivo**: alinhar os textos e totais exibidos no detail com os números efetivos retornados pela API e pelo relatório de funcionários do cliente.

**Ordem de execução**:

1. Corrigir as fórmulas textuais do `Relatório Simulado` para refletir os cálculos exibidos na tela.
2. Ajustar os rótulos e totais do `Relatório Real` para separar diárias, funcionários e benefícios sem ambiguidade.
3. Revisar os dois blocos em conjunto para validar que a apresentação não contradiz os números calculados.

**Subtarefas**:

- [x] Corrigir o texto da fórmula de adicional noturno no simulado para bater com o valor calculado.
- [x] Revisar os rótulos de `Funcionários Totais Reais` e `Benefícios / Extras` no relatório real.
- [x] Validar coerência geral dos blocos simulado e real após as mudanças.
- [x] Reordenar os blocos do simulado para mostrar a projeção antes do custo mensal.
- [x] Reforçar visualmente os grupos e totais mais importantes com destaque adicional.
- **Status:** completed

### Ponto 4: Wizard — regras de tipos e `quantidadeIdealPorTurno`

**Documentação Completa**: Ver [PONTO_4_ANALYSIS.md](PONTO_4_ANALYSIS.md)

**Problema**: Wizard tem 3 dimensões de pessoal que não se conversam:

- `Cliente.quantidadeIdealPorTurno` (pessoas/turno, política do cliente)
- `Contrato.numeroPostos` (número de escalas/grupos)
- `PostoConfig.quantidadeFuncionariosPorAlocacao` (pessoas/turno deste posto)

**Solução**: Dois modos:

1. **Automático** (padrão): `quantidadeIdealPorTurno` define réplicas de escalas
2. **Personalizado** (avançado): Modo manual com validações/avisos

**Subtarefas**:

- [x] Implementar helper `computePostosByQuantidadeIdeal()` (shared service)
- [x] Adicionar campo `modoPersonalizado` e watchers no wizard
- [x] Update `postosConfig` automaticamente quando `quantidadeIdealPorTurno` muda
- [x] Adicionar validador que avisa (não bloqueia) divergências
- [x] Expandir `ClienteCompletoDto` backend para aceitar `PostoConfigs`
- [x] Atualizar `montarPayloadCompleto()` para enviar configs
- [x] Validar integração backend do endpoint `clientes-completos` com suíte focada
- [x] Validar cenário de `PostoConfigs` no controller de integração
- [x] Validar rejeição de `PostoConfigs` inválido no endpoint de validação
- [ ] 6 testes de cenários (automatico simples, multiplos tipos, personalizado, etc) (expansão futura)
- [ ] E2E completo: wizard → contrato com postos corretos (expansão futura)
- **Status:** completed (escopo de implementação e correção concluído; expansões de cobertura ficam como backlog)

### Ponto 5: API — criação automática de postos e alocações

**Documentação Completa**: Ver [PONTO_5_ANALYSIS.md](PONTO_5_ANALYSIS.md)

**Problema**: Backend cria postos genéricos sem alocações nem horários; usuário deve editar cada um manualmente

**Solução**: Backend recebe `PostoConfigs` array do frontend, cria postos + alocações com horários padrão por tipo

**Subtarefas**:

- [x] Criar DTO `CreatePostoConfigInput` (tipoPosto, alocacoes, funcPorAloc, horários opcionais)
- [x] Criar DTO `CreateAlocacaoInput` (nome, horarioInicio, horarioFim, isNoturna)
- [x] Expandir `CreateClienteCompletoDtoInput` com campo `PostoConfigs`
- [x] Implementar `_gerarHorarioPadrao(tipoPosto, index)` para 6 tipos de escala
- [x] Atualizar `CriarClienteCompletoAsync()` para usar `PostoConfigs`
- [x] Usar `cliente.QuantidadeIdealPorTurno` para preencher `Alocacao.QuantidadeFuncionarios`
- [x] Validar input (QuantidadeAlocacoes vs PostoConfigs coerentes, horários válidos)
- [ ] Testes: 4 unit (horários por tipo) + 2 integration + 1 E2E (wizard → postos criados) (expansão futura)
- [x] Fallback: se `PostoConfigs = null`, criar genéricos (comportamento atual)
- **Status:** completed (escopo de implementação e correção concluído; cobertura adicional fica como backlog)

---

### Ponto 5: Aplicar custo real nos painéis globais

**Achado da verificação**:

- `contrato-list` já consome `custoRealMensal` e `lucroRealMensal`.
- `cliente-detail` ainda usa `valorTotalMensal` e margens derivadas como estimativa.
- `dashboard` também consolida faturamento, custo e lucro a partir de `valorTotalMensal`.

**Nota adicional**:

- Além da correção do contrato, revisar e executar os testes do backend relacionados aos fluxos de contrato, cálculo e validação do frontend/endpoint para garantir que a mudança não quebrou os cenários existentes.

**Subtarefas**:

- [ ] Revisar `cliente-detail` para expor custo real e lucro real junto da projeção.
- [ ] Revisar `dashboard` para diferenciar faturamento projetado e custo real.
- [ ] Validar consistência visual do `contrato-list`, mantendo o consumo atual dos campos reais.
- [ ] Revisar e ajustar a suíte de testes do backend associada ao cálculo de contratos e fluxos correlatos.
- **Status:** not-started

## Phases

### Phase 1: Backend — Extrair lógica para `ContratoCalculoService`

- [x] Criar `IContratoCalculoService` na camada Application/Services
- [x] Criar `ContratoCalculoService` com método `CalcularValorTotal` e `SimularSemAlocacoes`
- [x] Refatorar `CalculoValorTotalInput` para modelo baseado em diárias
- [x] Adicionar `PercentualAdicionalFimSemana` e `DiariasFdsFeriadosMes` ao input
- [x] Substituir `QuantidadeFuncionarios`/`NumeroDePostos` por `DiariasTotaisMes`/`DiariasNoturnasMes`/`FuncionariosEstimados`
- [x] Atualizar `CalculoValorTotalOutput` com breakdown transparente
- [x] Simplificar `ContratoCalculosController` para delegar ao serviço
- [x] Registrar serviço no DI
- **Status:** completed

### Phase 2: Backend — Testes

- [x] Criar testes unitários para `ContratoCalculoService` (fórmula pura)
- [x] Atualizar 8 testes de integração existentes para novos DTOs
- [x] Adicionar cenário 5×2 Diurno (22 diárias, 0 noturnas, 0 fds)
- [x] Adicionar cenário misto (2 postos de tipos diferentes)
- [x] Rodar `dotnet test` completo
- **Status:** completed

### Phase 3: Frontend — TipoPostoConfig + formulário

- [x] Expandir `TipoPostoConfig` com `diasTrabalhadosPorFuncMes` e `operaFimDeSemana`
- [x] Adicionar campo `percentualAdicionalFimSemana` ao formulário (default 100%)
- [x] Atualizar getters de diárias para incluir fds/feriados condicionalmente
- [x] Atualizar `funcionariosEstimados` para usar divisor por tipo de escala
- [x] Atualizar `setupAutoCalculo()` para enviar novos campos ao backend
- [x] Atualizar `contrato-calculo.models.ts` (interfaces Input/Output)
- **Status:** completed

### Phase 4: Frontend — cliente-wizard + contrato-detail

- [x] Atualizar `setupAutoCalculo()` no `cliente-wizard.component.ts`
- [x] Atualizar computed signals no `contrato-detail.component.ts`
- [x] Adicionar linha de adicional fds/feriado no relatório mensal
- **Status:** completed

### Phase 5: Verificação e entrega

- [x] Build frontend (`npm run build`)
- [x] Build + testes backend (`dotnet test`)
- [x] Verificação visual no browser
- [x] Commitar
- **Status:** completed

---

## Decisions Made

| Decision                                                        | Rationale                                                 |
| --------------------------------------------------------------- | --------------------------------------------------------- |
| Extrair lógica do controller para `ContratoCalculoService`      | Segue Clean Architecture já usada no projeto              |
| Frontend envia diárias calculadas, backend não assume ×30       | Cada escala tem diárias/mês diferentes                    |
| Divisor de func por tipo de escala                              | 12×36=15, 5×2=22, 8h×3=24                                 |
| Adicional fds/feriado default 100%                              | CLT Art. 7° XVI                                           |
| Feriados: 12/ano ≈ 1/mês                                        | Simplificação configurável                                |
| Backend como fonte única de cálculo monetário                   | Evita divergência entre telas e facilita auditoria/testes |
| Frontend responsável apenas por métricas operacionais e payload | Mantém UX transparente sem duplicar regra de negócio      |

## Errors Encountered

| Error                                                                                                                          | Resolution                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Backend ignorava %Fds e DTO estava incompatível (`percentualImpostos` no frontend vs `PercentualEncargosProvisoes` no backend) | Corrigido nome de variável no TypeScript e adicionado propriedade à Entity e Migration do backend. |
| O Relatório sumia ao recarregar a página ou dar erro                                                                           | Adicionada condicional no `@if (erroCalculo())` e adicionado Trigger inicial com setTimeout        |
