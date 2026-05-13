# Plano de Qualidade

**Projeto:** InterceptorSystem
**Data:** 21/04/2026
**Versao:** v2
**Responsavel:** QA e Engenharia

---

## 1. Objetivo

Definir criterios de qualidade para produto e documentacao, sustentados por testes automatizados e verificacoes de consistencia arquitetural.

## 2. Criterios de qualidade tecnica

| Dimensao         | Criterio                                                  |
| ---------------- | --------------------------------------------------------- |
| Funcionalidade   | Endpoints e fluxos criticos funcionando conforme contrato |
| Confiabilidade   | Regressao controlada por testes unitarios e de integracao |
| Seguranca        | Fluxos de autenticacao e tenant isolation preservados     |
| Manutenibilidade | Camadas e limites DDD respeitados                         |
| Observabilidade  | Falhas detectaveis por logs e pipeline                    |

## 3. Evidencias usadas

- Suite `InterceptorSystem.Tests` com testes unitarios e de integracao
- Testes de endpoints administrativos e auth (incluindo cenarios 200/400/401/404/409)
- CI com jobs de backend, frontend e docker build

### 3.1 Baselines de qualidade observaveis

- Baseline de testes automatizados informado no README: 204 testes
- Gate de CI: build backend + build frontend + docker build
- Contratos de API validados por testes de integracao dos controllers

## 4. Gates de aceite

- Build backend e frontend concluido
- Testes automatizados sem regressao critica
- Documentacao atualizada para mudancas relevantes
- Sem divergencia grave entre `README.md` e implementacao corrente

### 4.1 Gate minimo por release interna

1. `dotnet test` sem falhas criticas
2. Build de frontend em modo producao sem erro bloqueante
3. Nenhuma quebra de endpoint critico de auth/operacoes/whatsapp
4. Registro de risco residual quando houver debt assumido

## 5. Nao conformidades

Quando houver falha relevante:

1. Registrar causa raiz
2. Definir acao corretiva e preventiva
3. Acompanhar ate fechamento

## 6. Qualidade documental (planejamento)

| Criterio        | Regra                                                              |
| --------------- | ------------------------------------------------------------------ |
| Integridade     | 12 planos canonicos presentes e versionados                        |
| Consistencia    | Termos e escopo sem contradicoes entre planos                      |
| Aderencia       | Conteudo alinhado com README, codigo e pipeline                    |
| Rastreabilidade | Alteracoes relevantes registradas em `progress.md` e `findings.md` |

## 7. Metricas acompanhadas

- Taxa de sucesso da pipeline de CI
- Quantidade de regressao por sprint
- Lead time para correcoes de nao conformidade
- Numero de divergencias doc x implementacao detectadas por revisao
