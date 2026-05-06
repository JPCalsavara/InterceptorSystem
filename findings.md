# Findings & Decisions

## Bug de Seleção do Tipo de Posto (27/04/2026)

### Problema identificado

- O usuário relatou que, ao configurar um posto, independente do "Tipo de Posto" selecionado no dropdown, o sistema sempre fixa e processa como "12x36 (Dia / Noite) — 1 func./turno".

### Impacto observado

- O cálculo financeiro e a criação de alocações ficam travados na regra 12x36, impedindo a precificação e escala correta para postos 5x2, 24h Único, 8h (3 turnos), etc.
- Inviabiliza a utilização do sistema para contratos que não seguem exclusivamente a escala 12x36.

### Decisão aplicada

- O problema foi documentado na seção de bugs do `uml-fluxograma-calculo-financeiro-contrato.md`.
- Um novo ciclo de investigação e correção foi planejado no `task_plan.md` para diagnosticar a causa (no componente de formulário do posto ou no helper de cálculos) e implementar a correção.

## Analise de divergencia no calculo de contrato (27/04/2026)

### Problema identificado

- No `contrato-detail`, alguns percentuais do contrato estavam sendo divididos por 100 novamente antes do envio ao backend.
- Como os valores ja chegam em formato decimal (`0.15`, `0.40`, `1.0`), ocorria subdimensionamento (ex.: `1.0` virava `0.01`).

### Impacto observado

- Adicional de fim de semana muito abaixo do esperado.
- Margem de lucro/cobertura exibidas quase zeradas.
- Divergencia visual entre indicadores percentuais e valores monetarios do relatorio.

### Decisao aplicada

1. Adicionar normalizacao defensiva de percentual no frontend detail (aceita decimal e legado inteiro).
2. Remover dependencia de divisao fixa por 100 no carregamento do calculo real/simulado.
3. Documentar fluxo oficial com fluxograma e cenario numerico para validacao funcional.

### Artefato criado

- `docs/docs-pmp-uml/diagramas-uml/uml-fluxograma-calculo-financeiro-contrato.md`

## Analise do problema no wizard de clientes completos (27/04/2026)

### Problema identificado

- O endpoint `POST /api/clientes-completos` ja orquestra cliente, contrato, postos e alocacoes no backend.
- No frontend (`cliente-wizard`), os funcionarios sao criados depois, em loop de chamadas separadas para `POST /api/funcionarios`.
- Esse desenho gera risco de sucesso parcial e quebra de atomicidade do caso de uso "criacao completa".

### Evidencias tecnicas

1. `ClienteOrquestradorService` inicia transacao e cria cliente/contrato/postos/alocacoes no mesmo fluxo.
2. `cliente-wizard.component.ts` envia primeiro `createCompleto(payload)` e, no retorno, cria funcionarios um a um.
3. Falhas na criacao de funcionario sao tratadas por log individual e o fluxo segue para navegacao final.

### Decisao de arquitetura

1. O caso de uso de "criacao completa" deve ser atomico fim-a-fim.
2. O payload do endpoint orquestrado deve aceitar funcionarios para criacao na mesma transacao.
3. A criacao de funcionarios fora do endpoint orquestrado deve ser removida do wizard para esse fluxo.

### Artefato criado

- Novo diagrama de sequencia com AS-IS, TO-BE e plano incremental:
  - `docs/docs-pmp-uml/diagramas-uml/uml-sequencia-cliente-completo-cascata.md`

## Expansao de escopo orientada a prioridades (27/04/2026)

### Solicitacao consolidada

- Adicionar container Python para novas capacidades auxiliares
- Adicionar caso de uso de captacao de curriculos (vigias/manutencao)
- Adicionar caso de uso de leitura de rostos em totem para entrada e saida
- Avaliar/modularizar gestao de manutencao condominial
- Avaliar/modularizar servicos para moradores (encomendas e reservas de area gourmet)

### Decisao aplicada de priorizacao

1. Foco inicial (P1): concluir Core + saida financeira + captacao de curriculos + leitura de totem.
2. Fase seguinte (P2): gestao de manutencao.
3. Fase posterior (P3): modulo moradores (encomendas e area gourmet).

### Decisao aplicada de complexidade

- Alta complexidade: fechamento Core, saida financeira, leitura facial em totem.
- Media complexidade: captacao de curriculos, modulo moradores.
- Media/Alta complexidade: gestao de manutencao (processos e SLA).

### Observacao de governanca

- A expansao foi refletida no `plano-escopo.md` com matriz de prioridades (P1/P2/P3), matriz de complexidade e roadmap por ondas.

## Reescrita orientada ao README atual (22/04/2026)

### Problema identificado

- Os documentos `uml-caso-de-uso.md` e `uml-cenarios.md` ainda refletiam um dominio anterior (articulador/perguntas), divergente do InterceptorSystem atual.

### Decisao aplicada

1. Reescrever os dois artefatos com base exclusiva no README atual da raiz.
2. Priorizar casos/fluxos de maior valor operacional: Auth/Conta, Operacoes, Diarias e WhatsApp.
3. Manter os cenarios em formato textual estruturado (pre-condicoes, gatilho, fluxo principal, alternativos e pos-condicoes) com Mermaid consolidado de apoio.

### Resultado

- `uml-caso-de-uso.md` agora cobre atores e relacoes reais (Administrador da Conta, Operador, Gestor, Colaborador via WhatsApp, Meta API e SMTP).
- `uml-cenarios.md` agora descreve 4 cenarios aderentes aos endpoints e regras do README (`auth`, `clientes-completos`, `diarias/batch`, `whatsapp/webhook`).

## Planejamento PMI baseado em evidencias (21/04/2026)

### Fontes tecnicas usadas

- `README.md` (escopo funcional e arquitetura geral)
- Controllers da API em `backend/src/InterceptorSystem.Api/Controllers` (inventario de endpoints)
- `backend/src/InterceptorSystem.Infrastructure/DependencyInjection.cs` (composicao de servicos, cache e integracoes)
- `backend/src/InterceptorSystem.Infrastructure/Persistence/Contexts/ApplicationDbContext.cs` (multi-tenant, eventos de dominio, UoW)
- `backend/src/compose.yml` (topologia operacional local)
- `.github/workflows/ci.yml` (pipeline de build/test backend+frontend+docker)
- `backend/src/InterceptorSystem.Tests` (cobertura unit e integration)

### Decisoes aplicadas nos 12 planos

1. Registrar explicitamente os 3 Bounded Contexts (Operacoes, Auth, Whatsapp) como eixo de integracao.
2. Tratar isolamento multi-tenant por `EmpresaId` como risco/criterio de qualidade obrigatorio.
3. Mapear integracoes externas (Meta/SMTP) como risco de alto impacto com contingencia.
4. Incluir CI/CD e compose como base de custos operacionais e governanca de entrega.
5. Manter a trilha UML como proxima fase, sem alterar o conjunto final de 12 arquivos canonicos.

## Continuacao do planejamento com base README (22/04/2026)

### Melhorias aplicadas

1. `plano-escopo.md` passou a incluir matriz de rastreabilidade entre itens do README e planos subsidiarios.
2. `plano-integracao.md` passou a incluir inventario de endpoints criticos e gate minimo de mudanca.
3. `plano-qualidade.md` passou a incluir baseline de qualidade, gate de release e metricas continuas.
4. `plano-cronograma.md` passou a incorporar janela de roadmap tecnico alinhada aos proximos passos do README.
5. `plano-riscos.md` passou a contemplar riscos adicionais de E2E, cache e divergencia de contrato de API.
6. `plano-stakeholders.md` passou a detalhar necessidades de informacao por publico e estrategia de engajamento futuro.

### Decisao de continuidade

- Proxima etapa permanece sendo UML em `.png`, iniciando por diagramas com maior impacto de comunicacao tecnica (context map, auth, clientes-completos e webhook whatsapp).

## Diagramas UML em `.md` (22/04/2026)

### Decisao aplicada

- A trilha UML foi implementada em Markdown com Mermaid, conforme solicitacao do usuario.

### Artefatos criados

- `docs/docs-pmp-uml/diagramas-uml/uml-caso-de-uso.md`
- `docs/docs-pmp-uml/diagramas-uml/uml-cenarios.md`
- `docs/docs-pmp-uml/diagramas-uml/uml-robustez.md`
- `docs/docs-pmp-uml/diagramas-uml/uml-sequencia.md`
- `docs/docs-pmp-uml/diagramas-uml/uml-classes.md`

### Observacao operacional

- Para visualizacao direta na IDE, usar preview Mermaid em Markdown (VS Code nativo recente ou extensao dedicada).

## Refino solicitado: foco em caso de uso e cenarios (22/04/2026)

### Ajustes aplicados

1. Caso de uso reestruturado para o padrao visual solicitado (inclui `include` e `extends` com dois fluxos de mensagem e bloco admin via Swagger).
2. Cenarios detalhados em texto com pre-condicoes, gatilho, fluxo principal, fluxos alternativos e pos-condicoes.
3. Sequencia alterada para formato textual-primeiro, mantendo Mermaid apenas como apoio visual.
4. Diagramas de robustez e classes preservados como templates para resolver demandas pontuais.

## Problemas Identificados no `ContratoCalculosController.cs`

| #   | Problema                            | Impacto                                                 |
| --- | ----------------------------------- | ------------------------------------------------------- |
| 1   | Backend usa `× 30 dias` fixo        | 5×2 calcula R$3.000 quando deveria ser R$2.200          |
| 2   | `QuantidadeFuncionarios` ambíguo    | Mistura "slots" com "pessoas reais"                     |
| 3   | Proporção noturna por "postos"      | Falha com múltiplos postos de tipos diferentes          |
| 4   | Breakdown diverge front/back        | Frontend calcula localmente, backend calcula diferente  |
| 5   | Sem adicional fds/feriado           | `simular-sem-alocacoes` tem, `calcular-valor-total` não |
| 6   | ~100 linhas de lógica no controller | Viola Clean Architecture, dificulta teste unitário      |

## Modelo Proposto

## Decisão Arquitetural (Ponto 1)

### Fonte de Verdade do Cálculo

- **Backend** deve ser a fonte única de verdade para o cálculo monetário do contrato.
- **Frontend** deve apenas:
  - derivar métricas operacionais (diárias totais/noturnas/fds e funcionários estimados);
  - montar o payload do endpoint de cálculo;
  - renderizar o breakdown retornado pela API.

### Motivos da Decisão

1. Elimina divergência entre `cliente-wizard`, `contrato-form`, `contrato-detail` e `contrato-list`.
2. Mantém consistência fiscal em `Encargos e Provisões`.
3. Centraliza mudanças de regra em um único serviço (`ContratoCalculoService`).
4. Facilita testes unitários e de integração da fórmula.

### Limites por Camada

- **Backend (obrigatório):** cálculo de `ValorTotalMensal`, `CustoDireto`, `ValorImpostos`, `ValorMargemLucro`, `ValorMargemFaltas`.
- **Frontend (permitido):** somente projeções operacionais para compor `CalculoValorTotalInput`.
- **Frontend (proibido):** recomputar fórmula monetária oficial com lógica paralela.

### Critérios de Aceite para Unificação

1. Mesmo contrato/parâmetros gera mesmo resultado em form, wizard, detail e list.
2. Campos de Encargos e Provisões exibem exatamente o valor retornado/calculado pela regra oficial.
3. Em erro de API, interface mostra estado de falha sem trocar para fórmula alternativa local.

### TipoPostoConfig (frontend expandido)

```typescript
export interface TipoPostoConfig {
  label: string;
  alocacoes: number;
  funcionariosPorAlocacao: number;
  alocacoesNoturnas: number;
  diasTrabalhadosPorFuncMes: number; // divisor para func estimados
  operaFimDeSemana: boolean;
}
```

| TipoPosto     | Alocações | Func/Aloc | Noturnas | Divisor | Opera fds |
| ------------- | --------- | --------- | -------- | ------- | --------- |
| 12×36         | 2         | 1         | 1        | 15      | ✅        |
| 12×36 Dupla   | 2         | 2         | 1        | 15      | ✅        |
| 8h × 3 turnos | 3         | 1         | 1        | 24      | ✅        |
| 5×2 Diurno    | 1         | 1         | 0        | 22      | ❌        |
| 24h Único     | 1         | 1         | 1        | 15      | ✅        |
| Personalizado | 2         | 1         | 1        | 15      | ✅        |

### Fórmula de Cálculo

```
custoBaseDiárias   = diariasTotaisMes × valorDiária
adicNoturno        = diariasNoturnasMes × valorDiária × %noturno
adicFds            = diariasFdsFeriadosMes × valorDiária × %fds
benefícios         = funcEstimados × valorBenefício
CUSTO DIRETO       = custoBase + noturno + fds + benefícios

M = 1 + %lucro + %risco
Faturamento = (CustoDireto × M) / (1 - %impostos × M)
```

### Contagem de Funcionários

```
funcEstimados = ceil(diariasTotaisMes ÷ diasTrabalhadosPorFuncMes)
```

## Arquivos Envolvidos

| Arquivo                                         | Mudança                                 |
| ----------------------------------------------- | --------------------------------------- |
| `CalculoValorTotalDto.cs`                       | Refatorar Input/Output DTOs             |
| `ContratoCalculosController.cs`                 | Simplificar, delegar ao serviço         |
| `ContratoCalculoService.cs`                     | NOVO — lógica de cálculo                |
| `IContratoCalculoService.cs`                    | NOVO — interface                        |
| `contrato-form.component.ts`                    | Expandir TipoPostoConfig, novos getters |
| `contrato-calculo.models.ts`                    | Atualizar interfaces TS                 |
| `shared/helpers/contrato-calculo.helper.ts`     | Helper único de cálculo/payload         |
| `cliente-wizard.component.ts`                   | Atualizar setupAutoCalculo              |
| `contrato-detail.component.ts`                  | Atualizar computed signals              |
| `ContratoCalculosControllerIntegrationTests.cs` | Atualizar 8 tests + 2 novos             |

## Próximos Pontos para Análise Individual

1. Helper frontend único para montagem de input por posto (Ponto 2).
2. Regras de trava por tipo de posto vs `quantidadeIdealPorTurno` no wizard (ver [PONTO_4_ANALYSIS.md](PONTO_4_ANALYSIS.md)).
3. Layout e consistência do `contrato-detail` com indicadores e projeção mensal (ver [PONTO_3_ANALYSIS.md](PONTO_3_ANALYSIS.md)).
4. Criação automática de postos e alocações no fluxo `clientes-completos` (ver [PONTO_5_ANALYSIS.md](PONTO_5_ANALYSIS.md)).

---

## Ponto 3: Resumo Executivo — Contrato Detail

### Problema de Design

O detail tem 5 **computed signals** que recalculam custos. Divergem da API:

```
Computed.custoTotal = 17.999
API.valorTotalMensal = 18.000
```

Qual é correto? Sem fonte única, usuário fica confuso. Auditoria falha.

### Solução: Remove Cálculos Locais, Cacheia API

1. **Remover** 5 signals: `custoBaseDiarias()`, `adicionalNoturnoTotal()`, `custoTotal()`, etc
2. **Adicionar** sinal `calculoCompleto` que cacheia resposta da API
3. **Renderizar** tudo baseado em `calculoCompleto()` apenas
4. **Em erro**: Mostrar "Erro ao calcular" SEM fallback local

### Novo Layout: 3 Colunas (Desktop) | Stacked (Mobile)

```
Col 1: Informações + Indicadores (margens, saúde)
Col 2: Projeção Mensal + Postos de Trabalho
Col 3: Relatório Mensal Consolidado (tabela)
```

**Ver detalhes completos em [PONTO_3_ANALYSIS.md](PONTO_3_ANALYSIS.md)**

---

## Ponto 4: Resumo Executivo — `quantidadeIdealPorTurno`

### Problema de Design

O wizard atualmente tem 3 dimensões **independentes** de configuração de pessoal:

```
Cliente.quantidadeIdealPorTurno = 3   (política do cliente)
Contrato.numeroPostos = 2              (número de escalas)
PostoConfig[0].quantidadeFuncionariosPorAlocacao = 1  (pessoas nesta escala)
```

Nada força coerência entre essas 3 dimensões. O backend ignora `postosConfig` e calcula:

```
QuantidadeFuncionarios = quantidadeIdealPorTurno × numeroDePostos = 3 × 2 = 6
```

Mas o `postosConfig` pode ter sugerido `1 × 2 = 2` pessoas!

### Solução: Dois Modos

**Modo Automático** (padrão):

- Usuário define `quantidadeIdealPorTurno` na Etapa 1
- Na Etapa 2, escolhe tipos de escala
- Sistema **replica automaticamente** cada escala até atingir a quantidade ideal
- Exemplo: `quantidadeIdealPorTurno=3` + escolhe `5X2_DIURNO` (1 pessoa/turno) → cria 3 postos 5×2

**Modo Personalizado** (avançado):

- Usuário marca "Personalizar"
- Pode definir manualmente quantos postos de cada tipo
- Sistema mostra **avisos** se não respeita a política, mas **permite mesmo assim**

### Implementação Frontend

1. Helper: `computePostosByQuantidadeIdeal(quantidadeIdeal, tiposEscolhidos)` → array de postos
2. Adicionar toggle `modoPersonalizado` no form
3. Watcher que recomputa `postosConfig` quando tipos mudam (e não está em modo personalizado)
4. Validador que avisa sem bloquear em caso de divergência

### Impacto Backend

Expandir `CreateClienteCompletoDtoInput` para aceitar array de `PostoConfigs`:

```csharp
public record CreateClienteCompletoDtoInput(
    // ...
    IReadOnlyList<CreatePostoConfigInput>? PostoConfigs = null  // ← NOVO
);
```

Backend respeita as configs ao invés de criar postos "genéricos".

**Ver detalhes completos em [PONTO_4_ANALYSIS.md](PONTO_4_ANALYSIS.md)**

---

## Ponto 5: Resumo Executivo — Backend Orquestração

### Problema de Design

Backend cria postos **genéricos** quando recebe `numeroDePostos`:

```csharp
// ❌ 2 postos sem alocações, sem horários
for (int i = 0; i < numberOfPosts; i++) {
    var posto = new Posto { TipoPosto = "PERSONALIZADO" };
    await _postoService.CreateAsync(posto);
}
```

Usuário precisa editar cada um manualmente (6+ cliques).

### Solução: Backend Receptivo a Configs + Auto-Alocações

1. **Backend aceita** `PostoConfigs` array
2. **Para cada config**: Cria 1 posto + suas alocações com horários padrão
3. **Usa** `cliente.QuantidadeIdealPorTurno` para popular pessoas em alocações
4. **Exemplo**: 12×36 (2 alocações) + 3 pessoas/turno → cria 2 turnos × 3 pessoas = 6

### DTOs Novos

- `CreatePostoConfigInput`: tipoPosto, alocacoes, funcPorAloc, horários
- `CreateAlocacaoInput`: nome, horarioInicio, horarioFim, isNoturna

### Horários Padrão (Backend Gera)

```
12×36:  06:00-18:00 (Diurno), 18:00-06:00 (Noturno)
8h×3:   06:00-14:00, 14:00-22:00, 22:00-06:00
5×2:    06:00-14:00
24h:    00:00-24:00
```

**Ver detalhes completos em [PONTO_5_ANALYSIS.md](PONTO_5_ANALYSIS.md)**

---

## Planejamento de Documentacao PMI (21/04/2026)

### Decisoes tomadas

1. A documentacao de governanca do projeto sera estruturada usando os 12 documentos base em `docs/docs-base-pmp/planejamento`.
2. O formato final de artefatos sera restrito a `.md` (texto) e `.png` (diagramas/imagens).
3. Foi definido padrao UNIX para nomes de arquivos: minusculas e `kebab-case`.
4. A fase de UML sera executada em iteracao posterior, com backlog de diagramas prioritarios ja definido.

### Insumos visuais validados

- `docs/docs-base-pmp/planejamento/autenticacao.png`
- `docs/docs-base-pmp/planejamento/envio-media.png`
- `docs/docs-base-pmp/planejamento/fluxo-principal.png`
- `docs/docs-base-pmp/planejamento/casos-de-uso.png`

### Artefatos de planejamento criados

- `docs/docs-base-pmp/planejamento/plano-documentacao-pmi-interceptorsystem.md`
- `docs/docs-base-pmp/diagramas-uml/README.md`

### Fase B/C executada (21/04/2026)

- Os 12 documentos PMI em `docs/docs-base-pmp/planejamento` foram atualizados para o contexto real do InterceptorSystem.
- O conteudo foi alinhado ao `README.md` (arquitetura, modulos, integracoes e governanca).
- Foi mantida a restricao de formato final em `.md` e `.png`, com padrao UNIX de nomenclatura.

### Ajuste de estrategia (docs-pmp-uml)

- O novo planejamento foi consolidado em `docs/docs-pmp-uml/planejamento`.
- Os arquivos base foram preservados com os nomes originais (`*.md`) usando `docs/docs-pmi-base/planejamento` como fonte.
- As versoes novas do InterceptorSystem foram mantidas separadas em `*-interceptorsystem.md`.

## Bug Fix: 12x36 Posto Lock

The bug where the dropdown selection was locked to '12x36' regardless of user input has been traced and resolved.
The core issue lied in Angular's internal option index prefixing when binding a dropdown using `formControlName` without `ngValue` on strings matching object keys, and then utilizing `valueChanges` via `patchValue` which would cause the `resolverTipoPostoConfig` function to fail the lookup map (e.g. searching for '3: ESCALA_8H_3TURNOS' instead of 'ESCALA_8H_3TURNOS'). This forced a fallback to 'PERSONALIZADO', whose configuration in the system is identically matched to the '12x36' post configuration.
The fix involved sanitizing the `tipoPosto` string payload by splitting the string if it contains a ': ' prefix before resolving the config mapping, thus accurately resolving all configurations without forcing them to the default configuration. This was addressed in `contrato-calculo.helper.ts`, `cliente-wizard.component.ts`, and `contrato-form.component.ts`.
