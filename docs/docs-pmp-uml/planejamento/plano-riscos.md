# Plano de Riscos

**Projeto:** InterceptorSystem
**Data:** 21/04/2026
**Versao:** v2
**Responsavel:** Engenharia e Gerencia

---

## 1. Objetivo

Identificar, priorizar e tratar riscos tecnicos e de execucao que possam comprometer produto, prazo e qualidade.

## 2. Metodo de avaliacao

- Probabilidade: baixa, media, alta
- Impacto: baixo, medio, alto
- Prioridade: combinacao de probabilidade x impacto

## 3. Registro inicial de riscos

| ID  | Risco                                       | Gatilho                                                 | Probabilidade | Impacto | Resposta                                                  |
| --- | ------------------------------------------- | ------------------------------------------------------- | ------------- | ------- | --------------------------------------------------------- |
| R1  | Divergencia entre docs e implementacao      | Mudanca em codigo sem revisao de planos                 | Media         | Alto    | Revisao quinzenal com base em codigo e testes             |
| R2  | Regressao em contratos de API               | Alteracao de endpoint sem cobertura adequada            | Media         | Alto    | Testes de integracao e revisao de contrato                |
| R3  | Falha de integracao Meta/SMTP               | Mudanca externa ou credencial invalida                  | Media         | Alto    | Monitoramento, fallback e playbook                        |
| R4  | Violacao de isolamento multi-tenant         | Uso incorreto de contexto de tenant                     | Baixa         | Alto    | Testes e revisao de seguranca por tenant                  |
| R5  | Custo operacional acima do previsto         | Crescimento de volume CI/external APIs                  | Media         | Medio   | Controle mensal e otimizacao de consumo                   |
| R6  | Dependencia de pessoas-chave                | Ausencia em etapa critica                               | Baixa         | Alto    | Handover e revisao cruzada                                |
| R7  | Atraso na trilha de testes E2E              | Dependencia de ambiente/test runner                     | Media         | Medio   | Definir escopo minimo e faseamento por fluxo critico      |
| R8  | Regressao em cadeia por mudanca de cache    | Ajustes em invalidacao/eventos sem cobertura suficiente | Media         | Alto    | Revisao tecnica + testes de integracao orientados a cache |
| R9  | Deriva entre endpoints documentados e reais | Mudanca de rotas sem sincronizar docs                   | Media         | Medio   | Checklist de release com revisao de contratos de API      |

## 4. Monitoramento

- Revisao quinzenal dos riscos ativos
- Atualizacao imediata quando risco virar incidente
- Dono e prazo definidos para cada resposta

### 4.1 Frequencia por criticidade

- Riscos de impacto alto: revisao semanal
- Riscos de impacto medio: revisao quinzenal
- Riscos de impacto baixo: revisao mensal

## 5. Escalonamento

Incidentes de alto impacto devem:

1. Ser comunicados imediatamente
2. Ter plano de contingencia executado
3. Gerar licao aprendida registrada
