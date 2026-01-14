# 📝 CHANGELOG

---

## [2.0.0] - 2026-01-08

### 🎉 Versão Principal - Refatoração Completa

**Resumo:** 5 fases implementadas focando em consistência financeira e automação.

### ✨ Novidades

#### **FASE 5: Criação em Cascata**
- ✅ Endpoint `POST /api/condominios-completos` (1 request ao invés de 4)
- ✅ Validação dry-run: `POST /api/condominios-completos/validar`
- ✅ Cálculo automático de horários de turnos
- ✅ 75% redução em código frontend

#### **FASE 4: PostoDeTrabalho Simplificado**
- ✅ `QuantidadeIdealFuncionarios` agora é calculado do Condomínio
- ❌ Removidos campos duplicados

#### **FASE 3: Salários Automáticos**
- ✅ Salários calculados em tempo real do Contrato
- ✅ **CORREÇÃO CRÍTICA:** Margens de lucro e faltas agora consideradas
- ❌ Removidos campos de salário de Funcionário

#### **FASE 2: Vínculo Contrato**
- ✅ Funcionário DEVE ter contrato vigente
- ✅ Validação de expiração automática

#### **FASE 1: Configs Operacionais**
- ✅ Condomínio centraliza configs (qtd funcionários, horário troca)

### 🐛 Bugs Críticos Corrigidos

1. **Margens não consideradas:** Fórmula de salário corrigida
2. **Cálculo frontend errado:** Endpoint backend criado
3. **Testes com mocks incorretos:** Reflection configurado

### 📊 Métricas

- 75% menos requests API
- 75% menos código frontend
- 73 testes automatizados
- Zero inconsistências financeiras

---

## [1.0.0] - 2025-12-01

### Versão Inicial

- CRUD completo: Condomínios, Postos, Funcionários, Alocações, Contratos
- Multi-tenant por `EmpresaId`
- Validações básicas
- Docker + PostgreSQL

---

**Formato:** [Keep a Changelog](https://keepachangelog.com/)

