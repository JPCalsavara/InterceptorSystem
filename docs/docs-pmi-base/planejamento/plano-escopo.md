# PLANO DE ESCOPO DO PROJETO

**Projeto:** Ferramenta para upload de ações dos núcleos da RBAC
**Grupo:** Fênix
**Data:** 27/03/2026
**Versão:** v1
**Responsável:** Gabriel Rodrigues dos Reis de Sousa

---

## 1. Objetivo deste plano

Explicar como o escopo do projeto (o que será feito e entregue) será definido, organizado e acompanhado ao longo do desenvolvimento do chatbot WhatsApp para a RBAC.

## 2. Como o escopo será definido

- **Como o time vai descobrir o que o cliente precisa:** Por meio de reuniões com a Fabiana (ponto de contato da RBAC), análise do formulário e processo atual de coleta de informações dos núcleos, e comunicação assíncrona por e-mail.

- **Como será registrada a lista do que está dentro do escopo:**
  - Desenvolvimento de chatbot MVP via WhatsApp para coleta de textos, fotos e mídias dos coordenadores dos núcleos.
  - Gerenciamento de usuários (coordenadores) via interface HTTP.
  - Registro estruturado das respostas no Google Sheets e armazenamento de mídias no Google Drive.
  - Prototipação, testes e validação do fluxo principal com a equipe.

- **Como será registrada a lista do que está fora do escopo:**
  - Portal de gestão completo para os núcleos.
  - Dashboards analíticos ou ferramentas de BI.
  - Integrações com múltiplos sistemas externos além dos definidos (Google Sheets, Drive e WhatsApp Cloud API).
  - Evolução para solução em escala nacional com alta volumetria e operação contínua.
  - Processamento posterior dos dados para Mailchimp ou geração de documentos finais (boletim, relatório).

## 3. Estrutura Analítica do Projeto (EAP/WBS)

| ID EAP | Nível | Entrega / Pacote de Trabalho           | Descrição Resumida                                                                                                                                                                                       | Responsável Principal               |
| ------ | ----- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1      | 1     | Chatbot RBAC                           | Projeto completo                                                                                                                                                                                         | Equipe Fênix                        |
| 1.1    | 2     | Gestão do Projeto                      | Planejamento, acompanhamento e encerramento do projeto                                                                                                                                                   | Gabriel Rodrigues dos Reis de Sousa |
| 1.1.1  | 3     | Planos de gerenciamento                | Produção dos planos (integração, escopo, stakeholders, riscos, qualidade, cronograma, comunicação, recursos, custos, aquisições)                                                                         | Gabriel Rodrigues dos Reis de Sousa |
| 1.1.2  | 3     | Acompanhamento, controle e comunicação | Reuniões semanais, atas, GitHub Issues, e-mails quinzenais ao cliente, alinhamentos pontuais e apresentação final                                                                                               | Gabriel Rodrigues dos Reis de Sousa |
| 1.2    | 2     | Levantamento de Requisitos             | Coleta e documentação das necessidades do cliente                                                                                                                                                        | Gabriel Rodrigues dos Reis de Sousa |
| 1.2.1  | 3     | Coleta com o cliente                   | Reunião inicial de levantamento e validação do documento de requisitos com a Fabiana                                                                                                                     | Gabriel Rodrigues dos Reis de Sousa |
| 1.2.2  | 3     | Documentação dos requisitos            | Registro dos requisitos funcionais (RF01–RF06) e não funcionais (RNF01–RNF04)                                                                                                                            | Equipe Fênix                        |
| 1.3    | 2     | Definição de Arquitetura               | Decisão técnica sobre como o sistema será construído                                                                                                                                                     | Equipe de Desenvolvimento           |
| 1.3.1  | 3     | Definição da arquitetura técnica       | Escolha de tecnologias, fluxo de dados e decisões de design do chatbot                                                                                                                                   | João Victor Mansano                 |
| 1.3.2  | 3     | Documentação da arquitetura            | Diagrama de componentes e descrição do fluxo do sistema                                                                                                                                                  | João Victor Mansano                 |
| 1.4    | 2     | Configuração de Ambiente               | Setup de toda a infraestrutura necessária para o funcionamento do sistema                                                                                                                                | Equipe de Desenvolvimento           |
| 1.4.1  | 3     | Infraestrutura de mensageria           | Aquisição do número VoIP, criação das contas Meta e configuração da WhatsApp Cloud API (webhook e token)                                                                                                 | Gabriel Rodrigues dos Reis de Sousa |
| 1.4.2  | 3     | Infraestrutura de hospedagem e dados   | Configuração do Azure, repositório GitHub, variáveis de ambiente, credenciais Google e acesso ao Sheets/Drive da RBAC                                                                                    | Gabriel Rodrigues dos Reis de Sousa |
| 1.5    | 2     | Desenvolvimento do Chatbot             | Implementação de todos os módulos do sistema                                                                                                                                                             | Equipe de Desenvolvimento           |
| 1.5.1  | 3     | Núcleo do backend                      | Servidor base, validação HMAC-SHA256 (RNF03), endpoints HTTP de carga de usuários (RF01) e perguntas (RF02), e controle de sessão (RF03)                                                                 | Marcelo Santos                      |
| 1.5.2  | 3     | Fluxo conversacional                   | Coleta de relato, modalidade, data, link opcional e contagem de participantes (RF04); recebimento de 1 imagem/10 MB (RF05); confirmação antes de gravar (RF06); restrição de horário de operação (RNF01) | João Victor Mansano                 |
| 1.5.3  | 3     | Integrações externas                   | Integração com Google Sheets API (gravação dos registros) e Google Drive API (upload das mídias)                                                                                                         | João Pedro Calsavara                |
| 1.6    | 2     | Testes e Qualidade                     | Verificação do funcionamento do sistema e geração de evidência formal                                                                                                                                    | Carlos Sardenha                     |
| 1.6.1  | 3     | Execução de testes                     | Testes do fluxo conversacional, upload de mídias, integrações, sessão, restrição de horário e validação HMAC                                                                                             | Carlos Sardenha                     |
| 1.6.2  | 3     | Documento de evidência de testes       | Relatório formal comprovando os testes realizados, exigido como entregável do projeto                                                                                                                    | Carlos Sardenha                     |
| 1.7    | 2     | Documentação Técnica                   | Documentação voltada a desenvolvedores e ao cliente                                                                                                                                                      | Equipe de Desenvolvimento           |
| 1.7.1  | 3     | Documentação para desenvolvedores      | README com arquitetura e instruções de setup, documentação de endpoints HTTP e diagrama do fluxo conversacional                                                                                          | Equipe de Desenvolvimento           |
| 1.7.2  | 3     | Documentação para o cliente            | Guia de uso e manutenção da ferramenta para a RBAC                                                                                                                                                       | Equipe de Desenvolvimento           |

## 4. Como o escopo será acompanhado

- **Quem vai verificar se o que está sendo feito segue o escopo:** Gabriel Rodrigues (Gerente do Projeto), com reporte de todos os integrantes nas reuniões semanais de status.
- **Com que frequência isso será feito:** Semanalmente, nas reuniões de sábados às 10h ou terças às 19h40. A cada reunião, o gerente verifica se as atividades em andamento estão dentro do escopo definido e se as entregas estão progredindo conforme o esperado.
- **Como serão registradas mudanças de escopo:** Qualquer desvio ou solicitação de alteração é registrado em ata no Google Drive. Se a mudança impactar entregáveis ou requisitos, o documento afetado é atualizado com nova versão (ex.: `v1 → v2`).

## 5. Mudanças de escopo

1. **Como alguém pode pedir mudança de escopo:** Qualquer membro da equipe pode levantar a necessidade em reunião semanal ou diretamente ao gerente via WhatsApp. Solicitações originadas pelo cliente são recebidas pelo gerente por e-mail ou Google Meet com a Fabiana.

2. **Quem avalia se a mudança será aceita:** O gerente do projeto (Gabriel) avalia o impacto no prazo, custo e entregas. Mudanças que alterem requisitos acordados com o cliente são alinhadas com a Fabiana antes de qualquer aprovação.

3. **Como a mudança aprovada será registrada e comunicada:** A decisão é registrada em ata no Google Drive. Os documentos impactados são atualizados para uma nova versão. A equipe é informada na reunião semanal seguinte ou por WhatsApp em casos urgentes.
