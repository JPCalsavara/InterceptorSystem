---
name: frontend-refactoring
description: Orquestra a refatoração de componentes Angular aplicando melhores práticas, componentização, separação de arquivos (TS, HTML, SCSS) e padronização de SVGs e Interfaces.
---

# Frontend Refactoring Workflow

## Propósito
Esta skill orquestra a refatoração de código Frontend (Angular) já existente, garantindo a adoção de boas práticas da comunidade, alta coesão e baixo acoplamento. Ela foca em transformar componentes monolíticos em estruturas bem organizadas, separando responsabilidades e facilitando a manutenção e testes.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- Delega validações de interface e design para **frontend-ui-review**.
- Delega validações lógicas e de performance para **frontend-logic-review**.
- Delega criação e adequação de testes automatizados para **frontend-test-workflow**.

## Passos de Execução
1. **Análise do Componente Atual:** Leia o código do componente Angular que será refatorado. Identifique templates inline, estilos inline, SVGs misturados no HTML e interfaces soltas no mesmo arquivo.
2. **Separação Obrigatória de Arquivos (TS, HTML, SCSS):** Refatore o componente para que sua lógica, estrutura e estilo fiquem ESTRITAMENTE em arquivos separados:
   - `nome.component.ts`
   - `nome.component.html`
   - `nome.component.scss`
3. **Extração de Imagens e SVGs:** Busque por qualquer código SVG inline dentro do HTML. Extraia essas marcações SVG e converta-as em funções/componentes dedicados. Esses arquivos devem ser salvos dentro de uma subpasta chamada `/svg` localizada dentro do diretório do componente refatorado.
4. **Padronização de Interfaces (Arquivos t_x):**
   - Remova interfaces e tipagens exportadas de dentro dos arquivos `.ts` dos componentes.
   - Crie arquivos únicos para cada entidade/interface necessária.
   - O nome do arquivo deve obrigatoriamente seguir o padrão `t_<nome_da_entidade>.ts` (por exemplo: `t_cliente.ts`, `t_posto.ts`, `t_dashboard.ts`).
5. **Componentização:** Caso o componente original seja muito grande ou possua múltiplas responsabilidades, divida-o em componentes menores (Dumb/Presentational components), mantendo a mesma estrutura de diretórios e separação de TS/HTML/SCSS.
6. **Revisão e Versionamento:** Após a refatoração, acione as skills de review frontend (`frontend-ui-review`, `frontend-logic-review`) para certificar que os sinais, responsividade e injeções continuam funcionando, e conclua com a submissão via `git-flow`.

## Regras Críticas (Guardrails)
- **Zero Inline:** NUNCA utilize `template: \`...\`` ou `styles: [...]` no decorator `@Component`. A separação em 3 arquivos é lei.
- **SVGs Isolados:** Nenhum SVG gigante pode ficar poluindo o arquivo HTML principal. Eles devem residir na pasta `/svg`.
- **Arquivos de Tipo Unificados:** Nenhuma interface genérica de domínio pode ficar dentro do componente. Elas devem estar isoladas em seus arquivos `t_<entidade>.ts`.
- **Manutenção de Funcionalidade:** A refatoração é estritamente estrutural e arquitetural, não devendo alterar as lógicas de negócio preexistentes sem o consentimento do usuário.
