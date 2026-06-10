---
name: python-code-review
description: Revisa os pull requests e o código Python focado em Type Hints, Pydantic, isolamento de rotas FastAPI e boas práticas de RAG.
---

# Python Code Review

## Propósito
Analisar alterações de código Python no projeto garantindo que não se torne um script desorganizado, aplicando princípios de tipagem estrita, isolamento e qualidade estrutural no FastAPI.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.

## Foco do Review
1. **Type Hints e Pydantic:** Reprove qualquer código que crie funções ou rotas sem Type Hints explícitos. Os payloads de API devem usar classes BaseModel do Pydantic.
2. **Separação de Preocupações:** O `main.py` não deve conter lógica complexa de LLM. A lógica de negócio ou prompts de IA devem viver em módulos de `services/` ou `core/`.
3. **Gerenciamento de Segredos:** Chaves de API (`OPENAI_API_KEY`, etc.) jamais podem estar no código fonte, devendo usar o gerenciamento de configurações (como `pydantic-settings` ou `os.environ`).

## Regras Críticas (Guardrails)
- Scripts de Data Science soltos (Jupyter notebooks) não são aceitos para código de produção. Tudo deve estar envelopado na estrutura da API.
