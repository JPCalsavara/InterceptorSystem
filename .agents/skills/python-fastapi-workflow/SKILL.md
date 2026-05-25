---
name: python-fastapi-workflow
description: Orquestra a criação e manutenção de microsserviços Python/FastAPI (IA/RAG), incluindo configuração de ambiente, testes (pytest), dockerização e integração via Docker Compose.
---

# Python FastAPI Workflow

## Propósito
Guiar a construção padronizada de microsserviços em Python (especialmente focados em IA, NLP, RAG ou Data Science). Esta skill assegura que o novo serviço não seja apenas um script solto, mas sim uma API RESTful corporativa, testável, conteinerizada e conectada ao ecossistema existente (C# / Angular) via Docker Compose.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- Delega atualizações de arquitetura para o **docs-workflow**.

## Passos de Execução
1. **Estruturação do Projeto e Dependências:**
   - Verifique a existência da pasta do serviço (ex: `ai-service/`). Se não houver, crie.
   - Configure o arquivo de dependências (`requirements.txt` ou `pyproject.toml`) incluindo `fastapi`, `uvicorn`, `pydantic` e as bibliotecas de IA requeridas.
   - Configure o ambiente de testes exigindo o `pytest`.
2. **Desenvolvimento da API:**
   - Desenvolva os endpoints REST (ex: `main.py` e pastas de `routers`).
   - Implemente injeção de dependência e separe a lógica de negócios da camada de HTTP.
3. **Testes Obrigatórios (Pytest):**
   - Escreva testes garantindo as respostas da API via `TestClient` do FastAPI.
   - Mocke chamadas externas de LLM/OpenAI para que a pipeline de CI/CD não falhe nem gere custos.
4. **Conteinerização (Docker):**
   - Crie um `Dockerfile` otimizado (ex: baseado em `python:3.11-slim`) na pasta do microsserviço.
   - Adicione o novo serviço ao `docker-compose.yml` raiz do projeto, expondo a porta e lincando à rede interna (para comunicação direta com o C#).
5. **Finalização:**
   - Se aplicável, documente a interface ou retorne instruções de como o backend C# consumirá essa API.
   - Chame a skill `git-flow` para commit e PR.

## Regras Críticas (Guardrails)
- **Tipagem Estrita (Type Hints):** É estritamente proibido criar funções Python sem Type Hints. Pydantic deve ser usado para todos os DTOs de Request/Response.
- **Isolamento de Ambiente:** Nenhuma dependência do Python deve ser instalada globalmente na máquina host. Assuma sempre que vai rodar dentro do Docker.
- O output deve seguir os padrões arquiteturais corporativos (Fail-Fast e Modularidade).
