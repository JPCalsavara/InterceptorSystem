---
name: create-skill
description: Orquestra a criação de novas skills no repositório garantindo governança, padronização e integração com outras skills de qualidade (testes, git-flow, bug-workflow, docs).
---

# Create Skill Workflow

## Propósito
Garantir que toda nova skill adicionada ao agente de IA siga um padrão estrutural rigoroso (Governança de Skills). Esta skill impede a criação de prompts soltos e força a documentação da responsabilidade, limites e integrações da nova skill com o ecossistema existente.

## Governança e Integrações Obrigatórias
Sempre que o usuário pedir para criar uma nova skill, a estrutura gerada OBRIGATORIAMENTE deve considerar:
- **Testes & Qualidade:** Como a nova skill interage com o `backend-test-workflow` e `frontend-test-workflow`?
- **Versionamento:** A nova skill deve delegar versionamento e PRs para o `git-flow`.
- **Correção de Erros:** Qualquer erro ou review de código negativo gerado pela skill deve invocar o `bug-workflow`.
- **Documentação:** O escopo da skill deve respeitar a arquitetura global e invocar o `docs-workflow` se alterar contratos estruturais.

---

## Passos para Criar uma Nova Skill

### PASSO 1: Coleta e Escopo
1. Peça ao usuário o **nome da skill** (formato `kebab-case`) e o **objetivo principal**.
2. Verifique se o objetivo não sobrepõe uma skill existente.
3. Defina se a skill será independente ou se será uma "sub-skill" chamada por workflows maiores.

### PASSO 2: Geração do Arquivo
1. Crie o diretório em `.agents/skills/<nome-da-skill>/`.
2. Crie o arquivo `SKILL.md` com a seguinte estrutura obrigatória:

```markdown
---
name: <nome-da-skill>
description: <Resumo em até 2 linhas focado na utilidade para o agente>
---

# <Nome Visível da Skill>

## Propósito
[Explique exatamente o que a skill faz e quando o Agente deve acioná-la automaticamente ou sob demanda]

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.

## Passos de Execução
[Lista de passos enumerados. Seja imperativo. Ex: "1. Leia o arquivo X", "2. Gere o código Y", "3. Chame a skill Z"]

## Regras Críticas (Guardrails)
- [Regra de segurança ou padrão arquitetural que não pode ser quebrado por esta skill]
```

### PASSO 3: Validação
1. Leia o arquivo recém-criado para garantir que a formatação YAML frontmatter está correta.
2. Comite a criação da skill na branch atual utilizando a skill `git-flow` (com o prefixo `feat(skills): adiciona skill X`).
