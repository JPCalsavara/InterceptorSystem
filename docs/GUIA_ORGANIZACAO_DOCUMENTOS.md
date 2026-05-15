# Guia de Organização e Limpeza de Documentos (.MD)

Este documento serve como mapa e guia para manter a raiz do projeto limpa e os documentos organizados por categoria, facilitando a navegação e manutenção do sistema.

## 1. Categorias de Documentação

Para evitar que a raiz do projeto fique sobrecarregada, utilizaremos a seguinte estrutura:

### A. Documentos de Raiz (Core)
Apenas arquivos essenciais para quem acaba de clonar o projeto ou para o controle de versão global.
- `README.md`: Visão geral e instruções de setup.
- `CHANGELOG.md`: Histórico de versões e mudanças significativas.

### B. Planejamento Ativo (Temporário)
Arquivos gerados por agentes de IA ou ferramentas de planejamento durante a execução de uma tarefa.
- `task_plan.md`, `findings.md`, `progress.md`.
- **Regra:** Devem permanecer na raiz apenas enquanto a tarefa estiver `in_progress`. Ao finalizar, devem ser movidos para o histórico ou deletados.

### C. Documentação do Projeto (`/docs`)
Documentos perenes sobre o funcionamento do sistema.
- `docs/architecture/`: Diagramas e decisões de arquitetura.
- `docs/guias/`: Manuais de deploy, regras de negócio e tutoriais.
- `docs/design-system/`: Padrões visuais e de UI.
- `docs/refactory/`: Planos de melhoria técnica de longo prazo.

### D. Histórico de Tarefas e Análises (`/docs/history/tasks`)
Relatórios de execução de tarefas específicas, análises de bugs pontuais e logs de agentes.
- **Exemplo:** `PONTO_4_ANALYSIS.md`, `CODE_REVIEW_BACKEND_API.md`.

---

## 2. Estrutura Atualizada (Pós-Limpeza)

O projeto foi organizado da seguinte forma:

| Categoria | Pasta | Descrição |
| :--- | :--- | :--- |
| **Arquitetura** | `docs/architecture/` | Diagramas e especificações de infra (Ex: EC2/RDS). |
| **Guias** | `docs/guias/` | Tutoriais e Manuais (Ex: Reset de Database). |
| **Features** | `docs/features/` | Documentação de funcionalidades (Ex: Tags, Feriados). |
| **Histórico (Tarefas)** | `docs/history/tasks/` | Logs de execução de tarefas e reviews de agentes. |
| **Histórico (Refactor)** | `docs/history/refactoring-v2/` | Documentos das fases de refatoração 2.0 a 5.0 (Legado). |

---

## 3. Guia de Manutenção (Como manter limpo)

### Quando finalizar uma tarefa:
1. **Consolide**: Se o arquivo (ex: `PONTO_X_ANALYSIS.md`) contém informações úteis para o futuro, extraia para um Guia em `docs/guias/` ou Documento em `docs/features/`.
2. **Arquive**: Mova o log da tarefa para `docs/history/tasks/`.
3. **Limpe**: Delete arquivos de planejamento (`task_plan.md`, `progress.md`) se não houver intenção de retomar a sessão em breve.

### Documentos Obsoletos:
Documentos que referenciam lógicas de cálculo antigas (ex: dedução de margem a partir do faturamento) ou entidades removidas (ex: `BaseParaSalarios`) foram **deletados** para evitar confusão técnica.

---

## 4. Padronização de Nomenclatura

- **Tarefas:** `YYYY-MM-DD-NOME-DA-TAREFA.md` (Para facilitar a ordenação no histórico).
- **Guias:** `GUIA-NOME-DO-TOPICO.md` (Em caixa alta para destacar).
- **Análises:** `ANALISE-OBJETO-DA-ANALISE.md`.
