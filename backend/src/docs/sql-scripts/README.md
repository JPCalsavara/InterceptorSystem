# 📊 Scripts SQL - Dados de Teste

## 📁 Localização
`/src/docs/sql-scripts/`

---

## 🎯 Objetivo

Scripts SQL para facilitar testes manuais no frontend após implementações de novas funcionalidades.

---

## 📋 Scripts Disponíveis

### 1️⃣ `00-reset-database.sql`
**Limpa todas as tabelas** do banco de dados.

```bash
# Executar via psql
psql -h localhost -U admin -d interceptor_db -f 00-reset-database.sql

# Ou via Docker
docker exec -i interceptor_db psql -U admin -d interceptor_db < 00-reset-database.sql
```

**⚠️ ATENÇÃO:** Este script apaga TODOS os dados!

---

### 2️⃣ `01-popular-dados-teste.sql`
**Popula o banco** com dados realistas para testes.

```bash
# Executar via psql
psql -h localhost -U admin -d interceptor_db -f 01-popular-dados-teste.sql

# Ou via Docker
docker exec -i interceptor_db psql -U admin -d interceptor_db < 01-popular-dados-teste.sql
```

#### 📦 Dados Inseridos:

| Entidade | Quantidade | Descrição |
|----------|------------|-----------|
| **Clientes** | 3 | Residencial Solar, Horizonte Verde, Torres do Parque |
| **Contratos** | 3 | 1 contrato vigente por cliente (FASE 2) |
| **Postos de Trabalho** | 6 | 2 turnos (diurno/noturno) por cliente *(FASE 4)* |
| **Funcionários** | 35 | 12 + 8 + 15 distribuídos nos contratos *(FASE 3)* |
| **Diárias** | 12 | Diárias de exemplo para Janeiro/2026 |

---

### 3️⃣ `02-fase3-remover-salarios.sql`
**FASE 3:** Remove colunas de salário de Funcionarios (agora calculados do Contrato).

```bash
docker exec -i interceptor_db psql -U admin -d interceptor_db < 02-fase3-remover-salarios.sql
```

---

### 4️⃣ `03-fase4-simplificar-postos.sql`
**FASE 4:** Remove `QuantidadeIdealFuncionarios` de Postos (agora calculado do Cliente).

```bash
docker exec -i interceptor_db psql -U admin -d interceptor_db < 03-fase4-simplificar-postos.sql
```

---

## 🚀 Fluxo Completo de Teste

### **Cenário 1: Resetar e Popular do Zero**
```bash
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem/src/docs/sql-scripts

# 1. Limpar banco
psql -h localhost -U postgres -d interceptor_db -f 00-reset-database.sql

# 2. Popular com dados de teste
psql -h localhost -U postgres -d interceptor_db -f 01-popular-dados-teste.sql
```

### **Cenário 2: Apenas Adicionar Dados (sem limpar)**
```bash
psql -h localhost -U postgres -d interceptor_db -f 01-popular-dados-teste.sql
```

---

## 🔑 UUIDs Fixos para Testes

Para facilitar testes, os scripts usam UUIDs fixos:

```
EmpresaId:                    11111111-1111-1111-1111-111111111111

Cliente Solar:             22222222-2222-2222-2222-222222222221
Cliente Horizonte:         22222222-2222-2222-2222-222222222222
Cliente Torres:            22222222-2222-2222-2222-222222222223

Contrato Solar:               33333333-3333-3333-3333-333333333331
Contrato Horizonte:           33333333-3333-3333-3333-333333333332
Contrato Torres:              33333333-3333-3333-3333-333333333333

Postos de Trabalho:           44444444-4444-4444-4444-444444444441 a 46
Funcionários:                 55555555-5555-5555-5555-555555555501 a 35
Diárias:                    66666666-6666-6666-6666-666666666601 a 12
```

---

## 📊 Dados de Exemplo Detalhados

### **Cliente Residencial Solar**
- **CNPJ:** 12.345.678/0001-90
- **Endereço:** Av. Paulista, 1000 - São Paulo/SP
- **Funcionários:** 12
- **Contrato:** R$ 36.000/mês
- **Postos:** Diurno (6h-18h) + Noturno (18h-6h)

### **Edifício Horizonte Verde**
- **CNPJ:** 23.456.789/0001-80
- **Endereço:** Rua Augusta, 500 - São Paulo/SP
- **Funcionários:** 8
- **Contrato:** R$ 24.000/mês
- **Postos:** Diurno (7h-19h) + Noturno (19h-7h)

### **Torres do Parque Imperial**
- **CNPJ:** 34.567.890/0001-70
- **Endereço:** Rua dos Pinheiros, 1200 - São Paulo/SP
- **Funcionários:** 15
- **Contrato:** R$ 45.000/mês
- **Postos:** Diurno (6:30h-18:30h) + Noturno (18:30h-6:30h)

---

## ✅ FASE 2: Vínculo Funcionário ↔ Contrato

**Novidade da FASE 2:**
- ✅ Todos os funcionários agora estão vinculados a um **contrato vigente**
- ✅ Campo `ContratoId` obrigatório na tabela `Funcionarios`
- ✅ Validação automática de contrato vigente ao criar funcionário
- ✅ Foreign Key entre `Funcionarios` → `Contratos`

**Novidade da FASE 3:**
- ✅ **Salários calculados automaticamente!** Campos removidos de `Funcionarios`:
  - ❌ `SalarioMensal` (removido)
  - ❌ `ValorBeneficiosMensal` (removido)
  - ❌ `ValorDiariasFixas` (removido)
- ✅ Propriedades calculadas em tempo real:
  - `SalarioBase` = Contrato.ValorTotalMensal / Contrato.QuantidadeFuncionarios
  - `AdicionalNoturno` = 30% do base (para escala 12x36)
  - `Beneficios` = Contrato.ValorBeneficiosExtrasMensal / Contrato.QuantidadeFuncionarios
  - `SalarioTotal` = SalarioBase + AdicionalNoturno + Beneficios

**Novidade da FASE 4:**
- ✅ **QuantidadeIdealFuncionarios calculado automaticamente!** Campos removidos de `Postos`:
  - ❌ `QuantidadeIdealFuncionarios` (removido - agora calculado)
  - ❌ `QuantidadeMaximaFuncionarios` (removido)
  - ❌ `NumeroFaltasAcumuladas` (removido)
- ✅ Nova propriedade calculada:
  - `QuantidadeIdealFuncionarios` = Cliente.QuantidadeFuncionariosIdeal / TotalPostos
- ✅ Novo campo opcional:
  - `QuantidadeMaximaFaltas` (controle de faltas antes de dobrar escala)

---

## 🛠️ Troubleshooting

### Erro: "relation does not exist"
**Causa:** Migrations não foram aplicadas.

**Solução:**
```bash
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem/src/InterceptorSystem.Infrastructure
dotnet ef database update --startup-project ../InterceptorSystem.Api
```

### Erro: "duplicate key value violates unique constraint"
**Causa:** Tentou executar o script de população 2x sem limpar.

**Solução:**
```bash
# Executar reset primeiro
psql -h localhost -U postgres -d interceptor_db -f 00-reset-database.sql
```

---

## 📝 Personalização

Para criar seus próprios dados de teste, edite o arquivo `01-popular-dados-teste.sql` e ajuste:

1. UUIDs (mantendo o padrão para facilitar)
2. Nomes de clientes e funcionários
3. Valores de contratos
4. Horários de postos de trabalho

---

## 🔗 Integração com Docker

Se estiver usando Docker Compose, os comandos são:

```bash
# Reset
docker exec -i interceptor_db psql -U postgres -d interceptor_db < 00-reset-database.sql

# Popular
docker exec -i interceptor_db psql -U postgres -d interceptor_db < 01-popular-dados-teste.sql
```

---

**✅ Scripts prontos para uso! Bons testes no frontend! 🚀**

