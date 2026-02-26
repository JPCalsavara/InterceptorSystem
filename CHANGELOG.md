# 📝 CHANGELOG

---

## [2.2.0] - 2026-02-06

### Refatoração: QuantidadeFuncionarios → Calculado Automaticamente

**Impacto:** Médio — breaking change na API, 1 migration

#### ✨ Mudanças

- `QuantidadeFuncionariosIdeal` renomeado para `QuantidadeIdealPorTurno` em `Condominio`
- `QuantidadeFuncionarios` removido da persistência de `Contrato` — agora propriedade `[NotMapped]` calculada: `QuantidadeIdealPorTurno × NumeroDePostos`
- Eager loading do `PostoDeTrabalhoRepository` simplificado (não carrega mais lista de postos desnecessariamente)
- Configuração EF Core atualizada em `CondominioConfiguration`

#### ⚠️ Breaking Changes (API)

- `POST /api/condominios` e `GET /api/condominios`: campo `quantidadeFuncionariosIdeal` → `quantidadeIdealPorTurno`
- `POST /api/contratos` e `POST /api/condominios-completos`: campo `quantidadeFuncionarios` **removido** do input (calculado automaticamente)
- `GET /api/contratos/{id}`: campo `quantidadeFuncionarios` mantido no output (retornado calculado)

#### 🔧 Fórmula

```
QuantidadeFuncionarios = Condominio.QuantidadeIdealPorTurno × Contrato.NumeroDePostos
```

#### 🐛 Benefícios

- Elimina inconsistências entre `QuantidadeFuncionarios` e os campos de origem
- Single Source of Truth: cada entidade tem sua responsabilidade clara
- Menos validações necessárias (o cálculo é sempre correto)

#### 📦 Arquivos Modificados

- Domain: `Condominio.cs`, `Contrato.cs`, `PostoDeTrabalho.cs`
- Application: `CondominioDto.cs`, `ContratoDto.cs`, `CondominioCompletoDto.cs`, `CondominioAppService.cs`, `ContratoAppService.cs`, `CondominioOrquestradorService.cs`
- Infrastructure: migration `RenameQuantidadeFuncionariosIdealToQuantidadeIdealPorTurno`, `CondominioConfiguration.cs`, `PostoDeTrabalhoRepository.cs`

---

## [2.1.0] - 2026-02-06

### Correção: Adicional Noturno (CLT Art. 73)

**Impacto:** Baixo — zero mudanças no banco de dados

#### 🐛 Bug Corrigido

Adicional noturno era calculado com base na **escala do funcionário** (ex: 12x36), o que é incorreto segundo a CLT. O correto é verificar se o **horário do posto de trabalho** passa pelo período noturno (22h às 5h).

#### ✨ Mudanças

- Nova propriedade calculada `TemHorarioNoturno` em `PostoDeTrabalho`: retorna `true` se o turno passa pelo período 22h–5h
- `Funcionario.AdicionalNoturno` agora depende de `PostoDeTrabalho.TemHorarioNoturno`
- 7 novos testes unitários em `AdicionalNoturnoTests.cs` cobrindo todos os cenários de horário

#### 📊 Exemplos

| Posto   | Antes              | Depois        |
| ------- | ------------------ | ------------- |
| 6h–18h  | Dependia da escala | Sem adicional |
| 18h–6h  | Com adicional      | Com adicional |
| 22h–10h | Com adicional      | Com adicional |
| 0h–12h  | Dependia da escala | Com adicional |

#### 🧪 Testes

- **167/167 testes passando** (era 160 antes desta correção)
- Zero quebras de compatibilidade
- Zero mudanças no banco de dados

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
