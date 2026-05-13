# PLANO DE CRONOGRAMA DO PROJETO

**Projeto:** Ferramenta para upload de ações dos núcleos da RBAC
**Grupo:** Fênix
**Data:** 29/03/2026
**Versão:** v1
**Responsável:** Gabriel Rodrigues dos Reis de Sousa

---

## 1. Objetivo deste plano

Explicar como o cronograma do projeto será criado, acompanhado e atualizado ao longo do desenvolvimento do chatbot WhatsApp para a RBAC.

## 2. Como o cronograma será criado

- **Como serão identificadas as atividades a partir da EAP:** Cada pacote de trabalho do nível 3 da EAP (definida no plano de escopo) origina uma atividade no cronograma. As atividades foram derivadas de baixo para cima: primeiro listadas individualmente, depois agrupadas por proximidade.

- **Como será estimada a duração das atividades:** Por consenso da equipe, com base na complexidade técnica de cada entrega e nas horas disponíveis por semana. As estimativas consideram que o projeto é executado em paralelo com outras obrigações acadêmicas. O cronograma registra apenas a data de início e a duração estimada, não a data de fim, para facilitar o replanejamento caso algum marco precise ser deslocado.

- **Como será definida a ordem das atividades:** Pela dependência lógica entre entregas. Atividades sem dependência entre si são executadas em paralelo pelos membros da equipe.

- **Ferramenta utilizada:** GitHub Issues com milestones, integrado ao repositório de código, permite vincular tarefas a commits e pull requests e mapeia diretamente os marcos do projeto (M1–M8).

## 3. Cronograma

Os marcos são os pontos de ancoragem do cronograma. As datas de início das atividades são derivadas deles; a data de fim resulta da soma início + duração. Todos os marcos usam o prefixo M e estão em uma única tabela cronológica; a coluna Tipo distingue entre entregas da disciplina (prazos fixos do professor) e marcos de desenvolvimento (entregas técnicas do projeto).

| Marco | Descrição                                                       | Data                                         |
| ----- | --------------------------------------------------------------- | -------------------------------------------- |
| M1    | Charter                                                         | 17/03/2026 ✓                                 |
| M2    | Atividade 2 – Documentos de planejamento                        | 31/03/2026, 18h                              |
| M3    | Arquitetura e estratégia de integração com o WhatsApp definidas | 03/04/2026                                   |
| M4    | Atividade 3 – Monitoramento e acompanhamento                    | 28/04/2026, 18h                              |
| M5    | Fluxo principal do chatbot concluído                            | 05/05/2026                                   |
| M6    | Versão funcional final com testes e documentação validados      | 26/05/2026                                   |
| M7    | Atividade 4 – Encerramento do projeto                           | 02/06/2026, 18h                              |
| M8    | Entrega 5 – Mostra da disciplina                                | 19/06/2026, 23h59 (apresentação: 23/06/2026) |

As atividades 1 e 2 estão concluídas e registradas com as datas reais.

| ID  | ID EAP | Descrição                                                                                               | Dependência (ID) | Início      | Duração estimada   | Responsável                         |
| --- | ------ | ------------------------------------------------------------------------------------------------------- | ---------------- | ----------- | ------------------ | ----------------------------------- |
| 1   | 1.2.1  | Coleta com o cliente (reunião de levantamento com a Fabiana)                                            | —                | 20/03/2026  | 1 dia ✓            | Gabriel Rodrigues dos Reis de Sousa |
| 2   | 1.2.2  | Documentação dos requisitos (RF01–RF06 e RNF01–RNF04)                                                   | 1                | 20/03/2026  | 5 dias ✓           | Equipe Fênix                        |
| 3   | 1.1.1  | Produção dos planos de gerenciamento                                                                    | 2                | 24/03/2026  | 7 dias             | Gabriel Rodrigues dos Reis de Sousa |
| 4   | 1.1.2  | Acompanhamento, controle e comunicação com cliente (contínuo)                                           | —                | 24/03/2026  | Duração do projeto | Gabriel Rodrigues dos Reis de Sousa |
| 5   | 1.3.1  | Definição da arquitetura técnica                                                                        | 2                | 25/03/2026  | 7 dias             | Equipe Fênix                        |
| 6   | 1.3.2  | Documentação da arquitetura (diagrama e descrição do fluxo)                                             | 5                | M3          | 1 dia              | João Victor Mansano                 |
| 7   | 1.4.1  | Infraestrutura de mensageria (número VoIP, contas Meta, WhatsApp Cloud API)                             | 5                | M3          | 7 dias             | Gabriel Rodrigues dos Reis de Sousa |
| 8   | 1.4.2  | Infraestrutura de hospedagem e dados (Azure, GitHub, credenciais Google)                                | 5                | M3          | 7 dias             | Gabriel Rodrigues dos Reis de Sousa |
| 9   | 1.5.1  | Núcleo do backend (servidor, HMAC, endpoints HTTP, sessão)                                              | 5, 7, 8          | M3 + 4 dias | 4 semanas          | Marcelo Santos                      |
| 10  | 1.5.2  | Fluxo conversacional (coleta, imagem, confirmação, restrição de horário)                                | 5, 7, 8          | M3 + 4 dias | 4 semanas          | João Victor Mansano                 |
| 11  | 1.5.3  | Integrações externas (Google Sheets API e Google Drive API)                                             | 5, 7, 8          | M3 + 4 dias | 4 semanas          | João Pedro Calsavara                |
| 12  | 1.6.1  | Execução de testes (fluxo, mídias, integrações, sessão, segurança)                                      | 9, 10, 11        | M5          | 2 semanas          | Carlos Sardenha                     |
| 13  | 1.6.2  | Documento de evidência de testes                                                                        | 12               | após 12     | 1 semana           | Carlos Sardenha                     |
| 14  | 1.7.1  | Documentação para desenvolvedores (README, endpoints, diagrama)                                         | 9, 10, 11        | M5          | 2 semanas          | Equipe de Desenvolvimento           |
| 15  | 1.7.2  | Documentação para o cliente (guia de uso e manutenção para a RBAC)                                      | 14               | após 14     | 1 semana           | Equipe de Desenvolvimento           |

**Observações:**
- As atividades 9, 10 e 11 são executadas em paralelo — não possuem dependência entre si. Podem iniciar assim que arquitetura (5) e configuração de ambiente (7, 8) estiverem prontas.
- As atividades 12 e 14 também iniciam em paralelo após M5 (desenvolvimento concluído).
- O símbolo ✓ indica atividades já concluídas com datas reais registradas.

## 4. Como o cronograma será acompanhado

- **Quem vai atualizar o cronograma:** Gabriel Rodrigues (Gerente do Projeto), com input de todos os integrantes nas reuniões semanais.
- **Com que frequência será atualizado:** Semanalmente, nas reuniões de status (sábados às 10h ou terças às 19h40). O status de cada atividade é atualizado no GitHub Issues após cada reunião.
- **Informações atualizadas a cada ciclo:** data de início real (quando a atividade começou de fato), status de conclusão e eventuais impedimentos identificados.

## 5. Replanejamento de datas

1. **Como registrar atrasos:** O responsável pela atividade informa o gerente na reunião semanal ou via WhatsApp se o atraso for identificado entre reuniões. O status da issue no GitHub é atualizado com a nova previsão.

2. **Quem decide mudanças de datas importantes:** O gerente do projeto (Gabriel) avalia o impacto nos marcos. Se um marco for ameaçado, a decisão é tomada em conjunto com a equipe e, se houver impacto para o cliente, alinhada com a Fabiana por e-mail.

3. **Como comunicar essas mudanças à equipe e ao cliente:** À equipe, via WhatsApp ou na reunião semanal seguinte. Ao cliente, por e-mail com resumo do impacto. Este documento é atualizado para uma nova versão (ex.: v1 → v2) sempre que uma data de marco for alterada.
