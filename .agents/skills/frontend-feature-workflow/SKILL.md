---
name: frontend-feature-workflow
description: Orquestra o ciclo de vida da criação de uma nova feature no Frontend (Angular 21), guiando desde a criação do Smart Component, injeção de Services e integração com API até a delegação de estilos e testes E2E.
---

# Frontend Feature Workflow

## Propósito
Guiar a construção padronizada de novas features no Angular 21 Standalone. Esta skill conecta a camada de exibição (Smart e Dumb Components) à camada de comunicação de rede (Services e Interceptors), garantindo alinhamento com a arquitetura definida.

## Integrações Obrigatórias
- **`angular-component`**: Sempre acionada para criar a estrutura visual e arquivos TypeScript (SFC - Single-File Component) da página ou partes.
- **`responsive-ui`**: Invocada para garantir a adoção de Design Tokens e responsividade impecável.
- **`cypress-workflow`**: Invocada ao término para validar a feature end-to-end simulando as ações do usuário.

---

## Passos de Execução

### PASSO 1: Estruturação dos Serviços (Services)
1. Antes de desenhar UI, analise o contrato da API (`Application/DTOs` ou a rota no Swagger).
2. Crie ou atualize o Service referente na pasta `frontend/src/app/services/<feature>.service.ts`.
3. Garanta que o Service utilize o `HttpClient` injetado (via `inject(HttpClient)` do Angular Standalone) e retorne os Tipos Fortes (interfaces locais TypeScript espelhando os DTOs do backend).

### PASSO 2: Criação de Smart Components (Pages)
1. Crie o componente principal que cuidará do estado e roteamento dentro de `frontend/src/app/pages/<nome-da-feature>/`.
2. Invoque a skill `angular-component` para garantir a estrutura do Standalone Component sem HTML ou SCSS externos (tudo no `.ts`).
3. Faça a injeção do Service criado no Passo 1.
4. Lide com as respostas da API usando Signals (`signal()`, `computed()`, `effect()`) ou RxJS. O recomendado em Angular 21 são Signals para o controle de estado da View.

### PASSO 3: Tratamento de Erros e Feedback Visual
1. Implemente o catch dos erros da API (geralmente Erros de Domínio 400).
2. Não use o console.log para o usuário final. Integre com o Toast/Notificador padrão do projeto para exibir a mensagem do Backend de forma "bonitinha".

### PASSO 4: Componentes Menores (Dumb Components)
1. Se a interface for complexa, fragmente em Dumb Components dentro da pasta `components/` da página.
2. Eles devem receber dados via `@Input()` e comunicar ações via `@Output()` sem injetar serviços HTTP diretamente.

### PASSO 5: Validação Final
1. Teste a build rodando `ng build`. Se houver erros, corrija-os acionando a skill `bug-workflow`.
2. Acione o `cypress-workflow` para construir os testes.
3. Chame o `git-flow` para finalizar a entrega.

## Regras Críticas (Guardrails)
- **Zero HttpClient nos Componentes:** É terminantemente proibido o componente injetar `HttpClient` e fazer a requisição solta.
- **Padrão SFC:** Componentes em arquivo único (`.ts`). HTML via template string, usando Tailwind ou Design Tokens no componente, mas priorizando classes de UI definidas.
