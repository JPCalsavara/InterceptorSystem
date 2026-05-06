# Plano de Riscos

**Projeto:** Ferramenta para upload de ações dos núcleos da RBAC
**Data:** 29/03/2026
**Versão:** v1
**Responsável:** João Pedro Leite Calsavara

---

## 1. Objetivo deste plano

Este plano tem como finalidade estabelecer as diretrizes para a identificação, avaliação e tratamento dos riscos que podem impactar o sucesso do projeto, garantindo que a equipe esteja preparada para mitigar ameaças e responder a eventos inesperados.

A identificação será feita baseada na tarefa de cada pessoa com base na sua responsabilidade, e discutida nas reuniões de revisão; a avaliação será primariamente da pessoa responsável, sendo passado para o gerente, e caso ache necessário, compartilhado com o resto do grupo. Eles serão tratados em grupo e compartilhados com stakeholder para discutir a nova possibilidade.

## 2. Identificação de riscos

A equipe identificará os riscos por meio de brainstorming, revisão de experiências anteriores e análise técnica das integrações. Essa atividade será realizada no início do projeto e revisitada em momentos de revisão de fase, como nas reuniões quinzenais de acompanhamento.

## 3. Análise qualitativa dos riscos

Os riscos serão avaliados de forma simples, classificando o Impacto (Baixo, Médio ou Alto) e a Probabilidade (Baixa, Média ou Alta). A priorização dos esforços será focada nos riscos de alta severidade, calculada pela combinação desses dois fatores.

## 4. Registro dos riscos

| ID | Descrição do risco                        | Gatilho do risco                                                           | Probabilidade | Impacto | Severidade   | Resposta / Ação planejada                                                          |
| -- | ----------------------------------------- | -------------------------------------------------------------------------- | ------------- | ------- | ------------ | ---------------------------------------------------------------------------------- |
| 1  | Aumento de custo de mensageria            | Volume de mensagens acima do esperado ou mudança na política da Meta.      | Baixa         | Médio   | Baixo-Médio  | Monitorar volume e priorizar fluxos iniciados pelo usuário. Resp: Marcelo.         |
| 2  | Instabilidade na integração WhatsApp      | Falhas técnicas na API ou mudanças na solução de integração adotada.       | Média         | Alto    | Médio-Alto   | Realizar testes antecipados e prever tratamento de falhas. Resp: João Pedro.       |
| 3  | Indisponibilidade de ferramentas gratuitas | Limite de uso da Azure (Lambdas) excedido ou fim da gratuidade.           | Baixa         | Alto    | Média        | Pesquisar alternativas enxutas antes da contratação. Resp: Marcelo.                |
| 4  | Atraso no cronograma (Marcos)             | Complexidade técnica na integração de mídias ou demora em validações.      | Média         | Alto    | Médio-Alta   | Reuniões de emergência para redistribuição de tarefas. Resp: Gabriel.              |
| 5  | Falhas no armazenamento de mídias         | Erros de upload ou corrupção de arquivos de imagem/vídeo.                  | Média         | Alto    | Médio-Alta   | Testes específicos de upload e estratégia simples de recuperação. Resp: João Pedro. |
| 6  | Saída de membro da equipe                 | Desligamento voluntário de integrante técnico crítico.                     | Baixa         | Alto    | Média        | Validar mudança com o gerente e reorganizar tarefas em reunião. Resp: Gabriel.     |

## 5. Monitoramento de riscos

O acompanhamento dos riscos será realizado pelo Gerente de Projeto (Gabriel Rodrigues) de forma contínua. A lista de riscos será revisada quinzenalmente durante as reuniões com o cliente e a equipe. Novos riscos identificados durante a execução serão adicionados ao registro após validação técnica.

## 6. Ações quando um risco acontecer

Quando um risco se tornar um problema real, ele será registrado no Registro de Questões (Issues Log). O gerente de projeto, em conjunto com os responsáveis técnicos (João Pedro, João Victor ou Marcelo), decidirá a execução das ações de correção ou planos de contingência conforme acordado inicialmente, comunicando imediatamente as partes interessadas caso haja desvios de custo ou prazo.
