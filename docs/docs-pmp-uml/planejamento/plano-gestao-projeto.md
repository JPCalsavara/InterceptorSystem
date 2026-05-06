# Plano de Gestao do Projeto

**Projeto:** InterceptorSystem
**Data:** 21/04/2026
**Versao:** v2
**Responsavel:** Gerencia tecnica e produto

---

## 1. Objetivo

Definir como o InterceptorSystem sera gerido nas areas PMI com base no estado atual da solucao: DDD + Clean Architecture, multi-tenant, integracoes externas e pipeline CI/CD.

## 2. Modelo de governanca

- Ciclo semanal de planejamento e acompanhamento
- Revisao quinzenal de riscos, qualidade e capacidade
- Controle integrado de mudancas para impacto em escopo, prazo, custo e qualidade
- Decisoes registradas em markdown versionado

## 3. Baseline tecnico considerado

- Backend: .NET 8 com camadas Api/Application/Domain/Infrastructure
- Frontend: Angular 21 (`frontend/package.json`)
- Persistencia: PostgreSQL + EF Core + filtro global por tenant (`ApplicationDbContext`)
- Integracoes: JWT, SMTP, Meta WhatsApp webhook
- Cache: repositorios decorados + invalidacao via Domain Events/MediatR

## 4. Planos subsidiarios

- Integracao: `plano-integracao.md`
- Escopo: `plano-escopo.md`
- Cronograma: `plano-cronograma.md`
- Custos: `plano-custos.md`
- Qualidade: `plano-qualidade.md`
- Recursos: `plano-recursos.md`
- Comunicacao: `plano-comunicacao.md`
- Riscos: `plano-riscos.md`
- Aquisicoes: `plano-aquisicoes.md`
- Stakeholders: `plano-stakeholders.md`

## 5. Ritos e cadencia

- Daily assincrona por canal rastreavel
- Checkpoint semanal de entregas
- Checkpoint quinzenal de risco e arquitetura
- Revisao mensal do roadmap tecnico-funcional

## 6. Controle de mudancas

Toda mudanca relevante deve registrar:
1. Motivacao
2. Impacto esperado
3. Plano de validacao (testes/monitoramento)
4. Responsavel e data de aprovacao
