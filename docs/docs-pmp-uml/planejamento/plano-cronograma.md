# Plano de Cronograma do Projeto

**Projeto:** InterceptorSystem
**Data:** 21/04/2026
**Versao:** v2
**Responsavel:** Gerencia do projeto

---

## 1. Objetivo

Planejar e controlar marcos de evolucao documental e tecnica com foco em previsibilidade de entrega.

## 2. Abordagem

- Planejamento em ondas curtas (semanal/quinzenal)
- Priorizacao por risco e impacto em negocio
- Replanejamento orientado por bloqueios reais

## 3. Marcos de referencia

| Marco | Descricao                                         | Janela alvo  |
| ----- | ------------------------------------------------- | ------------ |
| M1    | Revisao dos 12 planos com base em codigo e README | Semana atual |
| M2    | Validacao cruzada com testes e CI                 | +1 semana    |
| M3    | Consolidacao de backlog UML                       | +2 semanas   |
| M4    | Primeira rodada de diagramas UML em `.png`        | +3 semanas   |

## 4. Trilhas de trabalho

| Trilha              | Atividades-chave                                  | Dependencias           |
| ------------------- | ------------------------------------------------- | ---------------------- |
| Backend/Arquitetura | Revisar impacto de mudancas em dominios e APIs    | code review + testes   |
| Frontend/Contrato   | Validar consumo de endpoints e efeitos de mudanca | versionamento de API   |
| Qualidade           | Executar regressao focada em fluxos criticos      | suite de testes        |
| Documentacao        | Atualizar planos, riscos e decisoes               | evidencias das trilhas |

## 5. Janela de roadmap tecnico (README)

| Janela | Prioridade      | Entrega esperada                                                |
| ------ | --------------- | --------------------------------------------------------------- |
| Onda A | Qualidade       | Definir estrategia para testes E2E (Playwright)                 |
| Onda B | Observabilidade | Plano de logs estruturados e metricas operacionais              |
| Onda C | Infra           | Estudo e plano de adocao de Redis como cache L2                 |
| Onda D | Seguranca       | Planejamento de rate limiting e reforco de controles            |
| Onda E | Produto         | Discovery do modulo financeiro (folha, relatorios e exportacao) |

## 6. Regras de replanejamento

- Desvio superior a 20% da estimativa exige revisao de prioridade
- Bloqueio externo (Meta/SMTP/infra) gera contingencia e nova data alvo
- Escopo adicional entra via controle de mudanca

## 7. Criterios de acompanhamento de prazo

- Toda entrega deve ter dono e data alvo explicitos
- Itens de alta dependencia externa precisam de margem de contingencia
- Replanejamento deve manter historico de mudanca documentado
