# Domain Frontend Mods

Data: 12/03/2026
Contexto: `refactory/domain-refactoring`

## Objetivo

Documentar as modificações de frontend necessárias para alinhar o sistema ao domínio atual (Tags, Contratos, Clientes, Funcionários), padronizando comportamentos visuais, validações e fluxos de cadastro.

## Escopo

Este documento cobre:

- padronização de botões e alertas
- melhoria de layout (sidebar colapsável no desktop)
- integração de Tags nos fluxos de Contrato, Cliente e Funcionário
- validação/máscara de campos sensíveis (CPF, CNPJ, telefone)

Este documento nao cobre:

- alteracoes de contrato de API backend
- migracoes de banco
- regras de dominio novas no servidor

## Skills Aplicadas no Planejamento

As implementacoes deste plano devem seguir obrigatoriamente as skills abaixo:

- `angular-component`
  - usar componentes standalone
  - manter separacao de responsabilidades (sem `HttpClient` direto em componente)
  - usar `FormBuilder` em formularios complexos
  - tratar carregamento/erro explicitamente
  - manter compatibilidade com tema e tokens globais

- `responsive-ui`
  - layout com flex/grid e unidades relativas
  - breakpoints para mobile, tablet e desktop
  - alvos de toque com area minima adequada
  - navegacao responsiva sem regressao do drawer mobile
  - validacao visual sem scroll horizontal indevido

Definicao de pronto adicional:

- nenhuma feature deste plano e considerada concluida sem validacao responsiva (mobile/tablet/desktop)
- novas telas/componentes devem respeitar os padroes arquiteturais da skill `angular-component`

## Modificacoes Prioritarias

### 1. Design Tokens e Acoes Semanticas

Padronizar cores semanticas para feedback visual:

- `danger` para exclusao e erros bloqueantes
- `warning` para alertas de atencao
- `success` para confirmacoes
- `info` para comunicacoes neutras

Aplicacoes:

- remover estilos locais de `btn-delete` espalhados nas telas
- usar classes globais (`btn-danger`, `btn-warning`, etc.)
- unificar banners/alerts de erro com tokens de tema (light/dark)

Resultado esperado:

- consistencia visual entre modulos
- menor duplicacao de CSS

### 2. Sidebar Colapsavel no Desktop

Adicionar suporte a modo colapsado (icone-only) no menu lateral em resolucao desktop.

Requisitos:

- manter comportamento atual de drawer no mobile
- persistir estado colapsado em `localStorage`
- aplicar classe global no shell para ajustar largura de conteudo

Resultado esperado:

- melhor aproveitamento horizontal em telas de dados
- experiencia consistente apos recarregar pagina

### 3. Padrao de Botao de Criacao nas Listagens

Padronizar CTA principal de criacao em todas as telas de lista.

Padrao:

- posicao: cabecalho da tela, area superior direita
- estilo: `btn-primary btn-md`
- texto: `+ Novo X` ou `+ Nova X` de forma consistente

Telas alvo:

- clientes, contratos, funcionarios, postos, alocacoes, diarias, tags

Resultado esperado:

- previsibilidade de navegacao
- reducao de divergencia visual

### 4. Componente Compartilhado de Selecao de Tags

Criar componente reutilizavel de selecao de tags para formularios.

Capacidades:

- busca local por nome
- selecao multipla
- exibicao por chips
- emissao de `tagIds` selecionadas

Consumo inicial:

- formulario de funcionario
- formulario de contrato

Resultado esperado:

- centralizacao de comportamento
- menor complexidade duplicada nos formularios

### 5. Integracao de Tags em Contrato

#### 5.1 Formulario de Contrato

Adicionar secao de tags com precificacao por tag (`valorDiaria`).

Dados:

- selecao de tags disponiveis
- input monetario por tag selecionada
- montagem de payload para `ContratoTagInput[]`

#### 5.2 Detalhe de Contrato

Exibir tags relacionadas ao contrato com seus respectivos valores de diaria.

Acoes:

- visualizar lista atual de tags
- adicionar/remover tag com confirmacao

Resultado esperado:

- visibilidade e controle de regras de precificacao por tag

### 6. Tags no Contexto de Cliente (Condominio)

Na tela de detalhe do cliente, consolidar tags relacionadas por contexto operacional.

Exibicao:

- tags dos contratos do cliente
- tags vinculadas a funcionarios ligados ao cliente (via postos/contratos)

Resultado esperado:

- visao consolidada do perfil operacional do cliente

### 7. Evolucao do Formulario de Funcionario

Substituir/ajustar selecao atual de tags para o componente compartilhado.

Regras:

- manter compatibilidade com `tagIds`
- preservar logica de tag default quando aplicavel
- melhorar UX de selecao (busca + chips)

Resultado esperado:

- fluxo de cadastro mais claro e consistente

### 8. Validacoes e Mascaras (CPF, CNPJ, Telefone)

Adotar validacao robusta orientada a schema e mascaramento de entrada.

Abordagem:

- mascaras de input para melhorar digitacao
- validacao semantica para CPF/CNPJ e formato de telefone
- mensagens de erro unificadas por campo

Campos alvo iniciais:

- `funcionario`: CPF
- `cliente`: telefone de emergencia
- demais formularios com CNPJ/telefone conforme disponibilidade de campo

Resultado esperado:

- menor taxa de erro de cadastro
- feedback imediato ao usuario

## Tarefas Adicionais Solicitadas (12/03/2026)

Estas tarefas complementam o escopo original e devem ser tratadas como bloco prioritario antes do fechamento da fase de frontend deste plano.

### A1. Revisao Geral de Implementacao (Form + Detail)

Objetivo:

- revisar todas as telas de formulario e detalhe impactadas por este plano para identificar regressao visual, inconsistencias de campo e divergencias de comportamento

Escopo minimo de revisao:

- `clientes`: form, detail, wizard
- `contratos`: form, detail
- `funcionarios`: form, detail
- `postos`: form, detail
- `alocacoes`: form, detail
- `diarias`: form, batch-form, detail

Entregavel:

- checklist de problemas encontrados por tela
- correcoes aplicadas ou backlog de ajuste com justificativa tecnica

### A2. Cliente Novo: CNPJ Obrigatorio + Validacao Zod

Problema reportado:

- fluxo de novo cliente sem campo de CNPJ, apesar da regra de dominio exigir CNPJ e da base ja possuir validacao orientada a schema

Ajustes necessarios:

- incluir campo `cnpj` no `cliente-form`
- aplicar mascara `00.000.000/0000-00`
- aplicar `cnpjValidator` (Zod) com mensagens padronizadas
- garantir envio de `cnpj` no payload de create/update
- garantir exibicao de CNPJ em telas de detalhe relevantes quando o modelo retornar o campo

Resultado esperado:

- formulario de cliente aderente ao dominio atual
- validacao consistente com o padrao de CPF/CNPJ ja adotado no projeto

### A3. Cliente Novo: Dropdown de Estado e Cidade Dependente

Objetivo:

- substituir entrada livre de cidade/estado por selecao guiada

Regras:

- `estado` deve ser `select`
- `cidade` deve ser `select` dependente do estado selecionado
- ao alterar estado, resetar cidade quando nao pertencer ao novo estado
- impedir submit sem combinacao valida estado/cidade

Resultado esperado:

- menor inconsistencias de cadastro de localidade
- maior padronizacao de dados para filtros e relatorios

### A4. Contrato Form: Datas e Contraste Visual

Problemas reportados:

- data de inicio/fim precisa ficar clara no padrao visual dia/mes/ano
- contraste insuficiente em areas de formulario

Ajustes necessarios:

- ajustar UX dos campos de data para exibicao legivel em pt-BR (`dd/MM/yyyy`) sem quebrar payload ISO
- reforcar contraste em labels, inputs e blocos de resumo/calc
- aplicar fundo mais escuro nas secoes de destaque mantendo legibilidade do texto
- validar consistencia em light/dark mode

Resultado esperado:

- leitura rapida das datas
- melhor acessibilidade visual e contraste no `contrato-form`

### A5. Alocacao Form: Correcao de Estilizacao

Problema reportado:

- layout e estilos do `alocacao-form` estao visualmente inconsistentes com os demais formularios

Ajustes necessarios:

- harmonizar spacing, hierarquia tipografica e estilos de input/botoes
- remover estilos inline
- garantir comportamento responsivo (mobile/tablet/desktop)

Resultado esperado:

- formulario visualmente consistente com o design system atual

### A6. Footer do Sistema (Shell Interno)

Objetivo:

- evoluir o footer interno para navegação clara entre areas principais e assinatura institucional

Estrutura solicitada:

- links de navegacao em uma unica linha: `Introducao`, `Internas (Sidebar)`, `Perfil`
- bloco inferior com logo
- texto de autoria (`quem fez`) e assinatura do sistema
- todo o conteudo centralizado

Resultado esperado:

- footer interno mais util para navegacao
- identidade visual e informacao institucional organizadas

### A7. Validacao Responsiva Formal (Pendencia Obrigatoria)

Objetivo:

- formalizar a validacao responsiva para todos os itens alterados neste documento e nas tarefas adicionais

Criticos:

- sem overflow horizontal
- componentes de formulario com alvos de toque adequados
- footer e header sem quebra indevida em 375px
- drawer/sidebar sem regressao

Evidencia:

- registrar validacao para mobile/tablet/desktop no checklist final

## Checklist de Execucao (Atual)

### Itens Concluidos

- [x] `1. Design Tokens e Acoes Semanticas`
- [x] `2. Sidebar Colapsavel no Desktop`
- [x] `3. Padrao de Botao de Criacao nas Listagens`
- [x] `4. Componente Compartilhado de Selecao de Tags`
- [x] `5. Integracao de Tags em Contrato (form + detail)`
- [x] `6. Tags no Contexto de Cliente (cliente-detail)`
- [x] `7. Evolucao do Formulario de Funcionario`
- [x] `8. Validacoes e Mascaras (CPF, CNPJ, Telefone)`
- [x] Dependencias de validacao adicionadas (`zod` + `ngx-mask`)

### Itens Nao Concluidos

- [ ] Validacao responsiva formal (mobile/tablet/desktop) de todos os fluxos alterados, conforme skill `responsive-ui`
- [ ] Checklist visual final de consistencia (sem regressao de espacos, alinhamentos e estados hover/focus)
- [ ] Revisao final de rollout das validacoes para cenarios de dados legados (edicao de registros antigos)

### Checklist de Tarefas Adicionais (12/03/2026)

- [x] `A1. Revisao geral de todos os forms e details impactados`
- [x] `A2. Reintroduzir CNPJ no cliente-form com mascara e validacao Zod`
- [x] `A3. Implementar dropdown de estado e cidade dependente no cliente-form`
- [x] `A4. Ajustar contrato-form (datas em padrao dia/mes/ano e contraste visual)`
- [x] `A5. Corrigir estilizacao do alocacao-form e remover estilos inline`
- [x] `A6. Evoluir footer interno (navegacao em linha + logo + autoria centralizada)`
- [x] `A7. Rodar validacao responsiva formal para todos os ajustes novos`

### Observacao de Escopo

- O checklist acima cobre apenas as modificacoes deste documento (`domain-frontend-mods.md`).
- Pendencias de backend ou outras frentes devem permanecer em seus respectivos planos/checklists.

## Impacto Tecnico

### Frontend

- Angular Standalone Components
- Reactive Forms
- Signals para estado local
- SCSS global com tokens semanticos

### Dependencias

- incluir biblioteca de schema validation (ex.: Zod)
- incluir biblioteca de mascara de input (ex.: ngx-mask)

## Riscos e Mitigacoes

- Risco: divergencia entre estilos globais e CSS local legado.
  Mitigacao: migracao incremental por tela com checklist visual.

- Risco: regressao em formularios por validacoes mais restritivas.
  Mitigacao: aplicar validacoes por etapas e validar com casos reais.

- Risco: acoplamento de selecao de tags em mais de um modulo.
  Mitigacao: componente compartilhado com API simples (`inputs/outputs`).

## Criterios de Aceite

- todas as listagens com CTA de criacao padronizado
- sidebar desktop colapsa/expande e persiste estado
- contrato-form salva tags com valores por tag
- contrato-detail exibe e permite gerenciar tags
- cliente-detail exibe consolidado de tags relacionadas
- funcionario-form usa seletor de tags compartilhado
- CPF/CNPJ/telefone validam com feedback amigavel
- estilos de exclusao/alerta usam tokens globais semanticos
- componentes novos/refatorados aderem a `angular-component`
- validacao de responsividade concluida conforme `responsive-ui`

## Ordem Recomendada de Implementacao

1. Tokens semanticos e botoes globais.
2. Sidebar colapsavel no desktop.
3. Padronizacao de botoes de criacao nas listagens.
4. Componente compartilhado de selecao de tags.
5. Integracao de tags em contrato (form + detail).
6. Integracao de tags no detalhe de cliente.
7. Ajuste final do formulario de funcionario.
8. Mascaras e validacoes por schema.

## Referencias de Implementacao

- `frontend/src/styles/_tokens.scss`
- `frontend/src/styles/_buttons.scss`
- `frontend/src/app/core/layout/sidebar.component.ts`
- `frontend/src/app/core/services/layout-state.service.ts`
- `frontend/src/app/features/contratos/contrato-form/*`
- `frontend/src/app/features/contratos/contrato-detail/*`
- `frontend/src/app/features/clientes/cliente-detail/*`
- `frontend/src/app/features/funcionarios/funcionario-form/*`
- `frontend/src/app/shared/components/`
