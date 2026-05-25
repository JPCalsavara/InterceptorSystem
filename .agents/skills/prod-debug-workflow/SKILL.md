---
name: prod-debug-workflow
description: Analisa logs exportados do ambiente de produção (EC2/CloudWatch) em formato de arquivo local para identificar Exceptions, rastrear a causa raiz no repositório de código e invocar o bug-workflow automaticamente.
---

# Prod Debug Workflow

## Propósito
Em vez de acessar a máquina EC2 viva correndo riscos de segurança, esta skill processa arquivos de log de erros exportados localmente pelo desenvolvedor. Ela escaneia o log, identifica a Exception do .NET ou do Angular, mapeia o arquivo culpado e inicia o ciclo de correção.

## Integrações Obrigatórias
- **`bug-workflow`**: Ao identificar a causa do bug no arquivo local, a skill chama OBRIGATORIAMENTE o `bug-workflow` passando as descobertas.
- **`git-flow`**: Delegação do envio do PR final.

## Passos de Execução
1. Receba o caminho do arquivo de log local (ex: `erro_producao.txt`).
2. Utilize busca de texto no arquivo apontado para encontrar a palavra "Exception" ou "Error".
3. Extraia o Stack Trace e encontre qual arquivo do nosso domínio (em `InterceptorSystem.*`) causou a quebra.
4. Abra o arquivo causador para leitura (`view_file`).
5. Identificada a quebra de regra de negócio, invoque o `bug-workflow` para escrever o teste que expõe o bug e corrigi-lo de forma limpa.

## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
