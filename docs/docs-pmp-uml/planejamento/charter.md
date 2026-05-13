# Project Charter (Termo de Abertura)

**Projeto:** InterceptorSystem
**Organizacao:** InterceptorSystem Team
**Versao/Data:** v2 - 21/04/2026

---

## 1) Contexto e patrocinio

O InterceptorSystem e uma plataforma SaaS para operacao de seguranca patrimonial, com backend em .NET 8 e frontend em Angular 21. O sistema opera com tres Bounded Contexts (Operacoes, Auth e Whatsapp), controle multi-tenant por `EmpresaId`, integracao por webhook WhatsApp e servicos de e-mail SMTP.

## 2) Objetivo do projeto

Estabelecer governanca de execucao e evolucao do produto com base PMI, mantendo os artefatos alinhados ao comportamento real do codigo, testes e infraestrutura.

## 3) Escopo de alto nivel

**Dentro do escopo:**
- Consolidacao dos 12 planos PMI em `.md`
- Rastreabilidade entre arquitetura, endpoints e testes
- Base para trilha UML em `.png` no diretorio de documentacao

**Fora do escopo:**
- Implementacao de novas features de negocio
- Mudancas arquiteturais disruptivas sem aprovacao formal
- Troca de stack tecnologica (.NET/Angular/PostgreSQL)

## 4) Entregaveis principais

- `charter.md`
- Planos subsidiarios PMI (`plano-*.md`)
- Diretriz de evolucao para diagramas UML em `.png`

## 5) Premissas e restricoes

- Fontes de verdade: `README.md`, codigo em `backend/src` e testes em `backend/src/InterceptorSystem.Tests`
- Formatos aceitos para esta trilha: `.md` e `.png`
- Ambiente principal: Docker Compose com `db`, `api`, `frontend` e `nginx`

## 6) Marcos de referencia

- M1: baseline documental validado com arquitetura real
- M2: planos PMI revisados com riscos e metricas
- M3: alinhamento com CI/CD e estrategia de testes
- M4: priorizacao da fase UML

## 7) Riscos iniciais

- Divergencia entre documentacao e codigo vivo
- Quebras de integracao externa (Meta/SMTP)
- Crescimento de escopo sem controle de mudanca
- Dependencia de conhecimento tacito em poucos membros

## 8) Criterios de sucesso

- Planos coerentes entre si e aderentes ao repositorio
- Referencias explicitas a arquitetura, endpoints e testes
- Governanca executavel para backlog tecnico e funcional
