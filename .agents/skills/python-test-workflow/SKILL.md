---
name: python-test-workflow
description: Orquestra a criação de testes automatizados para microsserviços Python usando Pytest, garantindo cobertura de rotas FastAPI e mock de chamadas de IA.
---

# Python Test Workflow

## Propósito
Garantir que as APIs em Python/FastAPI sejam devidamente testadas sem acionar APIs externas caras (como LLMs ou bancos de dados em produção). O fluxo foca na criação de suítes no Pytest.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.

## Passos de Execução
1. **Configuração Inicial:** Garanta que a pasta `tests/` exista no microsserviço Python e que o `pytest` esteja instalado.
2. **Criação dos Arquivos de Teste:** Crie arquivos prefixados com `test_` (ex: `test_main.py`).
3. **Uso de TestClient:** Para rotas web, importe `fastapi.testclient.TestClient` e faça chamadas simuladas.
4. **Mock de IA/Externos:** Use `unittest.mock` (como `patch`) para interceptar funções que chamam OpenAI, LangChain ou bancos vetoriais. O teste deve validar a lógica interna e os retornos, não a IA em si.
5. **Execução:** Rode `pytest`. Se falhar, analise e acione o `bug-workflow`.

## Regras Críticas (Guardrails)
- **Zero Custos em Teste:** É terminantemente proibido deixar que um teste automatizado faça uma chamada real que gere cobrança de API (ex: OpenAI).
- O output deve seguir os padrões arquiteturais de Clean Architecture e testes determinísticos.
