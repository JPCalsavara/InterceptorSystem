# Form and Detail UI Standardization Plan

Data: 2026-03-13
Contexto: `refactory/domain-refactoring`

## Objetivo

Padronizar formularios e telas de detalhe com foco em:

- consistencia visual em light/dark mode
- responsividade real (mobile/tablet/desktop)
- eficiencia de renderizacao e fluxo de validacao
- padrao unico para espacamentos, especialmente no topo das listas

Este plano segue explicitamente as skills:

- `responsive-ui`
- `angular-component`

## Foco desta rodada

Este documento sera tratado como fonte unica de planejamento nesta rodada.

- foco exclusivo no que esta descrito aqui
- sem abrir escopo para outros documentos
- status do checklist deve refletir o estado real do codigo

## Escopo

### Formularios

- `clientes`: form, wizard
- `contratos`: form
- `funcionarios`: form
- `postos`: form
- `alocacoes`: form
- `diarias`: form, batch-form

### Details

- `clientes`: detail
- `contratos`: detail
- `funcionarios`: detail
- `postos`: detail
- `alocacoes`: detail
- `diarias`: detail

### Listas (auditoria de espacamento topo)

- `cliente-list`
- `funcionario-list`
- `contrato-list`
- `posto-list`
- `alocacao-list`
- `diaria-list`
- `tag-list`

## Principios obrigatorios (skills)

## `responsive-ui`

- usar layout com flex/grid, sem largura fixa rigida
- breakpoints padrao: mobile `<768`, tablet `768-1024`, desktop `>1024`
- garantir targets clicaveis >= 44x44
- sem scroll horizontal acidental
- reduzir paddings/margins no mobile de forma previsivel

## `angular-component`

- componentes standalone
- sem `HttpClient` direto em componente
- formularios complexos com `FormBuilder`
- loading/error explicitos na UI
- sem cores hardcoded no componente; usar tokens globais
- dark mode e light mode obrigatorios

## Diagnostico atual: padding-top de listas nao padronizado

### Causa raiz identificada

1. Regras residuais locais em arquivos de lista ainda alteram espacamento no topo, mesmo apos migracao para classes compartilhadas.
2. Nem todas as listas estao 100% sem overrides locais de container/header.
3. Existe inconsistencia por breakpoint, principalmente no mobile.

### Evidencias encontradas

- `frontend/src/app/features/contratos/contrato-list/contrato-list.component.scss`: override local de `.page-container` no mobile foi removido.
- `frontend/src/app/features/alocacoes/alocacao-list/alocacao-list.component.scss`: possui `header-actions { padding-top: 1rem; }`, diferente das outras listas.
- `frontend/src/app/core/layout/app-shell.component.ts`: `main-content-inner` ja define padding global (`padding: var(--space-8) var(--space-6) var(--space-6)`), entao qualquer padding de topo local em lista cria variacao visual.

### Conclusao tecnica

O topo nao esta padronizado porque parte do espacamento vem do shell global e parte vem de regras locais de cada lista. O padrao deve existir em um unico lugar (shell + shared pages), e listas nao devem redefinir padding de container/header sem justificativa.

## Meta de padrao (target state)

### Espacamento global

- `main-content-inner` continua como fonte unica de padding estrutural da pagina.
- `page-container` compartilhado nao deve ter `padding-top` local em listas.
- `page-header` compartilhado define distancia visual inicial da tela.

### Regras para listas

- proibido `padding-top` em `.page-container` local de lista
- proibido `margin-top` de compensacao no root da lista
- excecoes devem ser documentadas no proprio scss com comentario de motivo

## Plano de acao detalhado

## Fase 1 - Baseline de tokens e contraste (dark/light)

### Acao 1.1

Mapear cores locais e substituir por tokens semanticos:

- `--color-danger`, `--color-warning`, `--color-success`, `--color-info`
- `--text-primary`, `--text-secondary`, `--border-subtle`, `--surface-card`

Entregavel:

- tabela de mapeamento por componente
- zero uso de cor hardcoded em SCSS de form/detail

### Acao 1.2

Padronizar alertas:

- sucesso/erro/info com mesmo contraste minimo
- dark mode sem reduzir legibilidade

Entregavel:

- bloco base de alertas reutilizado

## Fase 2 - Responsividade e tamanho de interacao

### Acao 2.1

Auditar breakpoints em forms/details:

- mobile `<768`
- tablet `768-1024`
- desktop `>1024`

Entregavel:

- cada tela com comportamento documentado por breakpoint

### Acao 2.2

Padronizar dimensao minima de botoes e controles:

- altura/largura minima de click >= 44px

Entregavel:

- checklist de controles criticos (submit, cancelar, editar, excluir)

### Acao 2.3

Garantir ausencia de overflow horizontal:

- validar em 375px, 390px, 768px, 1024px, 1366px

Entregavel:

- relatorio de viewport com status por tela

## Fase 3 - Eficiencia de formularios

### Acao 3.1

Padronizar validacao visual e mensagens:

- classe de erro unica
- estado touched/dirty consistente
- mensagens curtas e acionaveis

Entregavel:

- padrao unico de erro para todos os forms

### Acao 3.2

Garantir mascaras e validadores centralizados:

- CPF/CNPJ/telefone via validadores compartilhados
- sem duplicacao de regex por componente

Entregavel:

- todos os forms sensiveis usando utilitarios compartilhados

### Acao 3.3

Revisar eficiencia de render:

- evitar recalculo desnecessario em template
- reduzir bindings repetidos em loops grandes

Entregavel:

- lista de otimizacoes por componente com impacto esperado

## Fase 4 - Eficiencia e padrao de details

### Acao 4.1

Padronizar estrutura de secao em details:

- header > blocos de metrica > tabelas/listas > acoes

Entregavel:

- hierarquia visual equivalente entre details

### Acao 4.2

Padronizar estados de loading/erro/vazio:

- mesma semantica e espacamento
- sem variacao de altura inesperada entre modulos

Entregavel:

- guia de estados de tela

## Fase 5 - Correcao definitiva do padding-top das listas

### Acao 5.1

Remover overrides locais conflitantes:

- remover `padding-top` local em containers de lista
- remover ajustes de compensacao no `header-actions` quando nao estritamente necessario

Entregavel:

- diff com lista de arquivos limpos

### Acao 5.2

Criar regra de governanca de espacamento:

- `app-shell` controla macro espacamento
- `_shared-pages.scss` controla page header/container
- lista nao redefine topo

Entregavel:

- secao de convencao no guia de frontend

### Acao 5.3

Validar visualmente antes/depois:

- screenshots por lista em desktop e mobile
- comparativo de alinhamento do topo

Entregavel:

- checklist de aceite aprovado

## Checklist executivo

## A. Design and Theme

- [ ] substituir cores locais por tokens semanticos em todos os forms/details
- [ ] validar contraste em light mode
- [ ] validar contraste em dark mode
- [ ] unificar alertas e badges de status

## B. Responsive UI

- [ ] validar layout em 375px
- [ ] validar layout em 768px
- [ ] validar layout em 1024px
- [ ] validar layout em 1366px+
- [ ] garantir touch target >= 44x44
- [ ] garantir ausencia de overflow-x

## C. Forms Quality and Efficiency

- [ ] padronizar classe e exibicao de erro
- [ ] padronizar uso de `FormBuilder` e validadores compartilhados
- [ ] padronizar mascaras CPF/CNPJ/telefone
- [ ] revisar loops/bindings para reduzir custo de render
- [ ] revisar consistencia de botoes primarios/secundarios

## D. Details Quality and Efficiency

- [ ] padronizar ordem de secoes
- [ ] padronizar loading/erro/empty state
- [ ] padronizar tipografia e espacamento de cards/tabelas

## E. Top Padding Lists

- [x] remover override de `.page-container` no `contrato-list` (mobile)
- [x] revisar/remover `padding-top` em `header-actions` do `alocacao-list`
- [x] confirmar que `main-content-inner` + `_shared-pages.scss` sao as unicas fontes de espacamento topo
- [ ] validar alinhamento visual entre todas as listas

Status rapido da secao E:

- concluido: `contrato-list` sem override local de `.page-container`
- concluido: `alocacao-list` sem `header-actions { padding-top: 1rem; }`
- pendente: validacao visual final entre todas as listas

Execucao desta rodada (2026-03-13):

- aplicado: remocao do override mobile de `.page-container` em `contrato-list`
- aplicado: remocao de `padding-top` em `header-actions` de `alocacao-list`
- revisado: `cliente-list`, `funcionario-list` e `diarias-list` sem override de topo em `.page-container`/`header-actions`
- verificado: `main-content-inner` e a origem global do espacamento de topo no `app-shell`
- aplicado: remocao da excecao condicional de margem do `app-email-verification-banner` para padronizar o topo entre listas
- validado: build frontend (`npx ng build`) concluido com sucesso

Execucao complementar (2026-03-14):

- fase 1 (parcial): migracao de alertas para tokens semanticos em listas de `clientes`, `funcionarios`, `diarias`, `contratos` e `postos`
- fase 1 (parcial): migracao de erros/focus/required para tokens semanticos em `cliente-form` e `alocacao-form`
- validado: build frontend (`npx ng build`) concluido com sucesso apos a migracao parcial

Execucao complementar (2026-03-15):

- fase 1: criacao de `frontend/src/styles/_alerts.scss` como fonte unica de estilo para alerts
- fase 1: remocao dos blocos `.alert`, `.alert-close` e `@keyframes slideDown` duplicados das features
- validado: build frontend (`npx ng build`) concluido com sucesso apos a centralizacao dos alerts

Execucao complementar (2026-03-15 - lote forms diarias):

- fase 1 (parcial): migracao de estados de `info/error/warning/required` para tokens semanticos em `diaria-form`
- fase 1 (parcial): migracao de estados de `alert-error/error/required` para tokens semanticos em `diaria-batch-form`
- validado: build frontend (`npx ng build`) concluido com sucesso apos o lote de migracao

Execucao complementar (2026-03-15 - lote posto-form):

- fase 1 (parcial): migracao de gradiente e sombras do botao primario para tokens semanticos em `posto-form`
- validado: build frontend (`npx ng build`) concluido com sucesso apos o ajuste

Execucao complementar (2026-03-15 - lote contratos form/detail):

- fase 1 (parcial): migracao de estados financeiros (`receita/custo/lucro/prejuizo`) para tokens semanticos em `contrato-form` e `contrato-detail`
- fase 1 (parcial): remocao de usos locais de `app-ref-*` e `rgba(...)` nesses blocos de status
- fase 1 (parcial): migracao de estados de `focus/error/placeholder/tooltip` em `contrato-form` e ajustes de badges/valores no `contrato-detail`
- validado: build frontend (`npx ng build`) concluido com sucesso apos o lote

Execucao complementar (2026-03-15 - estrutura compartilhada de forms):

- fase 3/4 (base visual): criacao de escopo `.form-page` em `frontend/src/styles/_shared-pages.scss` para consolidar `page-header`, `header-content`, `btn-back`, `form-card`, `section-title`, `form-row`, `form-label`, `form-input`, `form-footer`, `required-note` e `button-group`
- fase 3/4 (base visual): aplicacao de `form-page` nos forms de `clientes`, `funcionarios`, `postos`, `contratos`, `alocacoes` e `diarias/batch-form`
- fase 3/4 (base visual): remocao dos blocos estruturais duplicados desses SCSS locais, mantendo apenas variacoes especificas por modulo
- validado: build frontend (`npx ng build`) concluido com sucesso apos a extracao da estrutura compartilhada

Execucao complementar (2026-03-15 - diaria-form e botoes compartilhados):

- fase 3/4 (base visual): `diaria-form` standalone migrado para o mesmo shell visual de `.form-page`, preservando o modo embutido
- fase 3/4 (base visual): extracao da base repetida de `btn-primary`, `btn-secondary` e `spinner-small` para `frontend/src/styles/_buttons.scss`, com escopo para forms padronizados
- fase 3/4 (base visual): remocao dos blocos duplicados de botao dos forms de `clientes`, `funcionarios`, `postos`, `contratos`, `alocacoes`, `diarias/batch-form` e `diarias/form`
- validado: build frontend (`npx ng build`) concluido com sucesso apos a extracao dos botoes compartilhados

Execucao complementar (2026-03-15 - padronizacao de filtros em listas):

- fase 5 (consistencia visual): padronizacao dos filtros de `posto-list` e `alocacao-list` para o mesmo markup/classes de `funcionario-list` e `diaria-list`
- fase 5 (consistencia visual): remocao de estilos inline em filtros de `postos` e `alocacoes`, com uso de `filters-section`, `filters-title`, `filters-title-icon`, `filters-grid`, `filter-group`, `filter-label` e `filter-select`
- validado: build frontend (`npx ng build`) concluido com sucesso apos a padronizacao dos filtros

## Roteiro de execucao sugerido

1. Corrigir padrao de espacamento topo das listas (fase 5).
2. Fechar tokens e contraste (fase 1).
3. Fechar responsividade e touch targets (fase 2).
4. Fechar eficiencia e padrao de forms (fase 3).
5. Fechar eficiencia e padrao de details (fase 4).
6. Rodar checklist executivo completo e publicar evidencias.

## Criterio de pronto

Uma tela so e considerada pronta quando:

- passa em light e dark mode com contraste adequado
- passa em 375/768/1024/1366 sem overflow horizontal
- usa padroes de validacao e mensagens acordados
- nao redefine padding-top de lista fora do padrao global
- possui loading/erro/empty state coerentes

## Referencias de arquivo

- `frontend/src/styles/_shared-pages.scss`
- `frontend/src/styles/_tokens.scss`
- `frontend/src/styles/_buttons.scss`
- `frontend/src/app/core/layout/app-shell.component.ts`
- `frontend/src/app/features/**/**-list.component.scss`
- `frontend/src/app/features/**/**-form.component.scss`
- `frontend/src/app/features/**/**-detail.component.scss`
