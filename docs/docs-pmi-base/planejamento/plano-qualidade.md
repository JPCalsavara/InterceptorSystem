# Plano de Qualidade

**Projeto:** Ferramenta para upload de ações dos núcleos da RBAC
**Grupo:** Fênix
**Data:** 30/03/2026
**Versão:** v1
**Responsável:** Carlos Alberto Sardenha Filho

---

## 1. Objetivo deste plano

O objetivo deste plano de qualidade é estabelecer os critérios de aceitação, as atividades de verificação e validação, e os papéis responsáveis para garantir que o chatbot WhatsApp atenda aos requisitos funcionais definidos no escopo do projeto, assegurando a conformidade com as expectativas do cliente e a confiabilidade da solução entregue.

## 2. Critérios de aceitação

Os critérios de aceitação definem as condições mínimas que cada requisito deve atender para que a entrega seja considerada válida. A validação será feita por meio de testes objetivos, documentados no plano de testes.

| ID    | Requisito Funcional                                     | Critério de Aceitação                                                                                                                                                                             |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF01  | Carregar usuários via interface HTTP                    | É possível cadastrar, atualizar e listar coordenadores dos núcleos via endpoint HTTP. A operação retorna status de sucesso ou erro claro.                                                         |
| RF02  | Definir perguntas do fluxo conversacional               | As perguntas são configuráveis via interface e exibidas na ordem correta durante a interação com o chatbot.                                                                                       |
| RF03  | Controle de sessão por usuário                          | O chatbot mantém o contexto da conversa para cada coordenador, permitindo pausas e retomadas sem perda de informação.                                                                             |
| RF04  | Coletar relato, modalidade, data, link opcional e participantes | Todos os campos são registrados corretamente no Google Sheets, com os respectivos tipos de dados (texto, data, número).                                                                   |
| RF05  | Receber 1 imagem de até 10 MB                           | O chatbot recebe e processa corretamente um arquivo de imagem (foto ou vídeo) de até 10 MB, armazenando-o no Google Drive com link associado ao registro.                                        |
| RF06  | Exibir confirmação antes de gravar                      | Antes do envio definitivo, o chatbot exibe um resumo das informações coletadas e aguarda confirmação do usuário.                                                                                  |
| RNF02 | Segurança de chaves                                     | As credenciais (API Keys) são armazenadas em variáveis de ambiente protegidas, não aparecendo no código fonte nem em logs.                                                                        |
| RNF03 | Segurança de webhook                                    | A aplicação valida a assinatura HMAC-SHA256 de todas as requisições recebidas da WhatsApp Cloud API (header X-Hub-Signature-256), rejeitando qualquer payload não assinado pela Meta com status HTTP 401/403. |

## 3. Atividades de verificação e validação

As atividades de verificação e validação serão realizadas ao longo do projeto, conforme detalhado abaixo.

### 3.1. Verificação (revisões e testes estáticos)

| Atividade              | Descrição                                                                                                  | Momento                      | Responsável                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------- |
| Revisão de requisitos  | Verificar se os requisitos funcionais estão claros, completos e alinhados com o escopo.                     | Antes do desenvolvimento (M3) | Carlos, Gabriel                          |
| Revisão de arquitetura | Avaliar se a solução técnica proposta atende aos requisitos e é viável.                                    | Antes do desenvolvimento (M3) | Carlos, Gabriel, equipe de desenvolvimento |
| Revisão de código      | Análise de pull requests no GitHub para garantir boas práticas, legibilidade e aderência aos requisitos.    | Contínuo (a cada PR)          | Equipe de desenvolvimento (pares)        |

### 3.2. Validação (testes dinâmicos)

| Atividade                | Descrição                                                                                                                                                       | Momento                                              | Responsável         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------- |
| Testes unitários         | Validação isolada de funções e componentes do backend.                                                                                                          | Durante desenvolvimento                               | Cada desenvolvedor  |
| Testes de segurança      | Validação do armazenamento de credenciais em variáveis de ambiente e verificação da rejeição de requisições sem assinatura HMAC válida.                          | Durante desenvolvimento                               | Carlos              |
| Testes de integração     | Validação do fluxo completo: WhatsApp → backend → Google Sheets/Drive.                                                                                         | Após M5                                               | Carlos              |
| Testes de aceitação      | Simulação de uso real pelos coordenadores dos núcleos, seguindo os critérios de aceitação.                                                                      | Após testes de integração                             | Carlos              |
| Validação com o cliente  | Demonstração para Fabiana (RBAC) para aprovação final da solução.                                                                                               | Antes do encerramento (próximo a M7/M8)               | Gabriel             |

## 4. Garantia dos requisitos funcionais

Para garantir que todos os requisitos funcionais definidos no escopo do projeto sejam atendidos, serão adotadas as seguintes práticas:

### 4.1. Rastreabilidade

Cada requisito funcional (RF01 a RF06, RNF02, RNF03) será vinculado a:

- Um ou mais cenários de teste no plano de testes.
- Uma seção na evidência de testes comprovando o atendimento.

### 4.2. Documentação obrigatória

| Documento             | Finalidade                                                                                                                                     | Responsável | Entrega              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------- |
| Plano de Testes       | Descreve os cenários de teste, dados de entrada e resultados esperados para cada requisito funcional.                                           | Carlos      | Até M5 (05/05/2026)  |
| Evidência de Testes   | Relatório formal com prints, logs ou vídeos comprovando que cada requisito funcional foi atendido conforme os critérios de aceitação.           | Carlos      | Até M6 (26/05/2026)  |

### 4.3. Critério de encerramento da qualidade

A garantia dos requisitos funcionais será considerada concluída quando:

- Todos os requisitos RF01 a RF06 forem testados e aprovados conforme os critérios de aceitação.
- O documento de evidência de testes estiver concluído e aprovado pelo gerente do projeto.
- O cliente validar o funcionamento da solução.
