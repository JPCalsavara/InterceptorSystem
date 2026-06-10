---
name: python-debug-workflow
description: Analisa tracebacks e logs de erro de serviços Python/FastAPI, identifica a causa e orquestra a correção acionando o bug-workflow.
---

# Python Debug Workflow

## Propósito
Lidar com bugs, exceções de tempo de execução e comportamentos não esperados na API Python. Substitui o debug via "print" por um fluxo profissional de investigação baseada em testes.

## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- Usa a **python-test-workflow** para criar testes de regressão.

## Passos de Execução
1. **Coleta de Traceback:** Receba o log do erro ou o traceback do Python (ex: do console do Uvicorn ou pytest).
2. **Localização do Erro:** Identifique o arquivo `.py` e a linha que causou a exceção.
3. **Leitura e Diagnóstico:** Abra o arquivo causador para leitura para entender o contexto do estado (ex: dicionário vazio, NoneType em Pydantic, timeout de rede).
4. **Resolução Isolada:** Invoque OBRIGATORIAMENTE o `bug-workflow` e instrua a criar um teste no pytest que simule a falha exata antes de consertar o código fonte.

## Regras Críticas (Guardrails)
- Proibido inserir múltiplos `print()` no código fonte em produção para debuggar. O debug deve ocorrer localmente acoplado à construção de novos testes.
