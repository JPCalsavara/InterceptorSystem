# Plano de Custos

**Projeto:** InterceptorSystem
**Data:** 21/04/2026
**Versao:** v2
**Responsavel:** Gestao tecnica

---

## 1. Objetivo

Monitorar custos de operacao e evolucao do sistema, preservando sustentabilidade tecnica e financeira.

## 2. Estrutura de custos monitorados

| Categoria | Natureza | Fonte |
| --- | --- | --- |
| Infra de execucao | Variavel | PostgreSQL, API, frontend e Nginx em ambiente alvo |
| CI/CD | Variavel por volume | GitHub Actions (`ci.yml`) |
| Integracao WhatsApp | Variavel por uso | Meta API |
| E-mail transacional | Variavel por uso | SMTP |
| Engenharia | Esforco interno | backend, frontend, QA, DevOps |

## 3. Situacao atual

- Stack principal usa componentes open-source
- Ambiente local com Docker Compose reduz custo de setup
- Custos mais sensiveis concentrados em provedores externos e volume de processamento

## 4. Controle orcamentario

- Revisao mensal de custo real vs estimado
- Registro de variacoes acima de 10%
- Analise de alternativa tecnica antes de aumento recorrente

## 5. Gatilhos de acao

- Aumento de custo unitario por transacao externa
- Crescimento de execucoes CI sem ganho de qualidade
- Necessidade de escala de infraestrutura alem do baseline atual
