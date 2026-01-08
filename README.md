# InterceptorSystem

**Versão:** 2.0 (FASE 5 - Criação em Cascata)  
**Data da Última Atualização:** 2026-01-08  
**Status:** ✅ Todas as 5 fases de refatoração concluídas

---

## Plano (Método STAR)

- **Situação**: Descrever o contexto que originou o InterceptorSystem e os desafios enfrentados pelo time de segurança patrimonial.
- **Tarefa**: Explicar os objetivos técnicos e de negócio que o sistema precisa cumprir para suportar múltiplos condomínios.
- **Ação**: Detalhar as soluções implementadas (arquitetura, tecnologias, processos de desenvolvimento e testes).
- **Resultado**: Evidenciar ganhos obtidos, indicadores de qualidade e próximos passos.

---

## 🎯 Novidades da Versão 2.0

### **FASE 1-5: Refatoração Completa** ✅

| Fase | Descrição | Status | Impacto |
|------|-----------|--------|---------|
| **FASE 1** | Configurações Operacionais no Condomínio | ✅ | Centralização de dados operacionais |
| **FASE 2** | Vínculo Funcionário ↔ Contrato | ✅ | 100% funcionários vinculados |
| **FASE 3** | Cálculo Automático de Salário | ✅ | Salários sempre consistentes |
| **FASE 4** | Simplificação de PostoDeTrabalho | ✅ | Quantidade calculada do Condomínio |
| **FASE 5** | Criação em Cascata | ✅ | **75% menos requests API** |

### **🚀 Nova Funcionalidade: Criação em Cascata**

Agora é possível criar **Condomínio + Contrato + Postos de Trabalho** em uma única operação:

```http
POST /api/condominios-completos
Content-Type: application/json

{
  "condominio": {
    "nome": "Residencial Estrela",
    "quantidadeFuncionariosIdeal": 12,
    "horarioTrocaTurno": "06:00:00"
  },
  "contrato": {
    "valorTotalMensal": 36000.00,
    "quantidadeFuncionarios": 12
  },
  "criarPostosAutomaticamente": true,
  "numeroDePostos": 2
}
```

**Antes:** 4 requests (Condomínio → Contrato → Posto 1 → Posto 2)  
**Depois:** 1 request  
**Redução:** 75% ⬇️

---

## Situação

A Interceptor presta serviços de segurança para diversos condomínios e precisava consolidar todas as operações em um único backend .NET 8. Problemas existentes antes do projeto:

- Cadastros duplicados e sem rastreabilidade de empresa (multi-tenant inexistente).
- Escalamento manual de postos de trabalho, funcionário e alocações, sem validações de regras (ex.: turnos consecutivos).
- Ausência de testes automatizados e documentação técnica mínima.

Esse cenário pressionava a equipe a agir rapidamente, garantindo uma base extensível, observável e preparada para novos módulos (funcionários, alocações, contratos, etc.).

## Tarefa

Definimos quatro metas principais:

1. **Multi-tenant consistente**: toda entidade deveria carregar `EmpresaId`, com filtros globais via `ICurrentTenantService`.
2. **Clean Architecture + DDD**: separar Domínio, Aplicação, Infra e API para reduzir acoplamento.
3. **Regras claras por módulo**:
   - Condomínio como agregado raiz para Funcionários, Postos, Contratos.
   - Funcionários com enums de status/tipo/escala e validação de valores financeiros.
   - Postos obrigatoriamente associados a um condomínio e com janelas de 12h.
   - Alocações bloqueando turnos consecutivos exceto em `DOBRA_PROGRAMADA`.
   - Contratos com ciclo de vida e status bem definidos.
4. **Qualidade**: testes unitários e de integração cobrindo cenários bons/ruins, payloads documentados e pipelines via Docker Compose.

## Ação

### Arquitetura e Tecnologias

- **Stack**: .NET 8, ASP.NET Core, Entity Framework Core + PostgreSQL, Docker/Compose, xUnit.
- **Estrutura**: `InterceptorSystem.Domain`, `.Application`, `.Infrastructure`, `.Api`, `.Tests` seguindo Clean Architecture.
- **Multi-tenant**: filtros globais no `ApplicationDbContext` e validação de tenant em cada AppService.

### Casos de uso implementados

| Módulo | Destaques de Regra de Negócio | Cobertura de Testes |
|--------|-------------------------------|---------------------|
| Condomínios | CRUD isolado por empresa, validações de CNPJ/ endereço | Integração (Controllers) |
| Postos de Trabalho | Vínculo 1:N com condomínio, turnos 12h | Unit + Integração |
| Funcionários | Enums fortes, CPF único, salários positivos | Unit (casos bons e ruins) + Integração |
| Alocações | Respeita tenant, valida funcionário/posto, bloqueio de dias consecutivos | Unit (múltiplos cenários) + Integração |
| Contratos | Status enumerado, valores/ datas coerentes | Unit + Integração |

### Qualidade e Documentação

- **Testes**: `dotnet test src/InterceptorSystem.Tests/InterceptorSystem.Tests.csproj` (124 cenários).
- **Payloads**: `src/docs/test-payloads/*.json` alinhados aos enums atuais.
- **Infra**: Docker Compose com API, PostgreSQL e NGINX. `.env` centraliza variáveis (`POSTGRES_*`, `ConnectionStrings__DefaultConnection`).
- **CI/CD-ready**: projeto organizado para pipelines (build, test, migrations).

## Resultado

### **✅ Indicadores de Qualidade (Versão 2.0)**

| Métrica | Antes (v1.0) | Depois (v2.0) | Melhoria |
|---------|--------------|---------------|----------|
| Requests para criar condomínio completo | 4 | 1 | **75% ↓** |
| Salários desatualizados | Frequente | Zero | **100% ✅** |
| Postos criados manualmente | 100% | 0% | **Automático** |
| Funcionários sem contrato | Possível | Impossível | **Validação** |
| Cálculos financeiros manuais | Sim | Não | **Automático** |

### **🎯 Ganhos Técnicos**

- **Confiabilidade**: ✅ **TODAS as regras críticas implementadas e cobertas** por testes unitários/integrados. Sistema detecta e previne inconsistências automaticamente.
- **Escalabilidade**: ✅ **Arquitetura limpa** facilita adicionar novos módulos sem quebrar validações existentes.
- **Operacional**: ✅ **Docker Compose** + **README completo** + **payloads documentados** = onboarding rápido.
- **Segurança**: ✅ **Multi-tenant rigoroso** + **regras de alocação** + **contratos únicos** garantem integridade operacional.
- **Manutenibilidade**: ✅ **75% menos código no frontend** para operações comuns.

### **🎯 Regras Implementadas nas 5 Fases**

#### **FASE 1: Configurações Operacionais** ✅
- Condomínio centraliza: quantidade ideal de funcionários, horário de troca de turno, email do gestor
- Criação automática de postos baseada nessas configurações

#### **FASE 2: Vínculo Funcionário ↔ Contrato** ✅
- Todo funcionário vinculado a contrato vigente
- Validação automática de contrato expirado

#### **FASE 3: Cálculo Automático de Salário** ✅
- `SalarioBase` = `ValorTotalContrato` / `QuantidadeFuncionarios`
- `AdicionalNoturno` = `SalarioBase` × `PercentualAdicionalNoturno`
- `Beneficios` = `ValorBeneficiosContrato` / `QuantidadeFuncionarios`
- `SalarioTotal` = `SalarioBase` + `AdicionalNoturno` + `Beneficios`

#### **FASE 4: Simplificação de PostoDeTrabalho** ✅
- `QuantidadeIdealFuncionarios` agora é propriedade calculada:
  - `QuantidadeIdeal` = `Condominio.QuantidadeFuncionariosIdeal` / `TotalPostos`
- Redução de duplicação de dados

#### **FASE 5: Criação em Cascata** ✅
- Endpoint `/api/condominios-completos` orquestra criação completa
- Validações automáticas de consistência
- Cálculo automático de horários de turnos

**Próximos passos sugeridos**:
  1. ✅ ~~Implementar regras críticas de alocação e contrato~~ **CONCLUÍDO** 
  2. ✅ ~~Refatoração de domínio (5 fases)~~ **CONCLUÍDO**
  3. ⏳ Deploy em ambiente de staging
  4. ⏳ Automatizar migrations em pipeline e nos ambientes Docker
  5. 📋 Implementar observabilidade (logs estruturados + métricas)
  6. 📋 Expor APIs públicas com autenticação JWT e rate limiting

---

## Cenários e Regras de Negócio das Entidades

### Condomínio (Agregado Raiz)
**Atributos Obrigatórios**: `Nome`, `CNPJ`, `EmpresaId`, `QuantidadeFuncionariosIdeal`, `HorarioTrocaTurno`

**Regras de Negócio**:
- ✅ **Unicidade de CNPJ por empresa**: Não pode haver dois condomínios com o mesmo CNPJ na mesma empresa
- ✅ **Multi-tenant**: Todos os condomínios são isolados por `EmpresaId`
- ✅ **Configurações Operacionais (FASE 1)**:
  - `QuantidadeFuncionariosIdeal`: Define quantos funcionários o condomínio precisa
  - `HorarioTrocaTurno`: Define quando ocorre a troca de turno (ex: 06:00)
  - `EmailGestor`: Para notificações automáticas (opcional)
  - `TelefoneEmergencia`: Contato de emergência (opcional)
- ✅ **Base para criação automática de postos**: Horário de troca define turnos

**Cenários de Teste**:
```
✅ Criar condomínio com 12 funcionários ideais → Status 201
✅ Criar condomínio com horário de troca 06:00 → Postos criados automaticamente
❌ CNPJ duplicado na mesma empresa → Exceção: "Já existe um condomínio cadastrado com este CNPJ"
❌ Quantidade de funcionários ≤ 0 → Validação falha
```

---

### PostoDeTrabalho
**Atributos Obrigatórios**: `CondominioId`, `HorarioInicio`, `HorarioFim`

**Regras de Negócio**:
- ✅ **Relação 1:N com Condomínio**: Posto sempre vinculado a um condomínio
- ✅ **Turnos de 12 horas**: Diferença entre `HorarioInicio` e `HorarioFim` deve ser exatamente 12 horas
- ✅ **Respeito ao tenant**: Posto só pode ser criado em condomínio da mesma empresa
- ✅ **FASE 4 - Quantidade Calculada**: `QuantidadeIdealFuncionarios` agora é propriedade calculada:
  - `QuantidadeIdeal = Condominio.QuantidadeFuncionariosIdeal / TotalPostos`
  - Exemplo: Condomínio com 12 funcionários e 2 postos = 6 funcionários por posto
- ✅ **Criação automática**: Postos criados automaticamente via endpoint `/api/condominios-completos`

**Cenários de Teste**:
```
✅ Posto 06:00-18:00 → Criado com sucesso (QuantidadeIdeal calculado automaticamente)
✅ Posto 18:00-06:00 (madrugada) → Criado com sucesso  
❌ Posto 08:00-16:00 (8h) → Exceção: "Diferença deve ser de 12 horas"
❌ Posto em condomínio de outra empresa → KeyNotFoundException
```

---

### Funcionário
**Atributos Obrigatórios**: `Nome`, `CPF`, `CondominioId`, `ContratoId`, `StatusFuncionario`, `TipoEscala`, `TipoFuncionario`

**Regras de Negócio**:
- ✅ **CPF único no sistema**: Não pode haver dois funcionários com mesmo CPF
- ✅ **FASE 2 - Vínculo com Contrato**: Todo funcionário deve estar vinculado a um contrato vigente
  - Validação automática: contrato deve existir e estar com status `PAGO`
  - Contrato não pode estar expirado (`DataFim` >= hoje)
- ✅ **FASE 3 - Salários Calculados Automaticamente**:
  - `SalarioBase` = `Contrato.ValorTotalMensal` / `Contrato.QuantidadeFuncionarios`
  - `AdicionalNoturno` = `SalarioBase` × `Contrato.PercentualAdicionalNoturno` (para escala 12x36)
  - `Beneficios` = `Contrato.ValorBeneficiosExtrasMensal` / `Contrato.QuantidadeFuncionarios`
  - `SalarioTotal` = `SalarioBase` + `AdicionalNoturno` + `Beneficios`
- ✅ **Status controlado**: `ATIVO`, `FERIAS`, `AFASTADO`, `DEMITIDO`
- ✅ **Vinculação a condomínio**: Funcionário pertence a um condomínio específico

**Cenários de Teste**:
```
✅ Funcionário ATIVO com contrato vigente → Criado com sucesso (salário calculado automaticamente)
❌ CPF duplicado → Exceção: "CPF já cadastrado"
❌ Contrato inexistente → Exceção: "Contrato não encontrado"
❌ Contrato expirado → Exceção: "Contrato expirado"
❌ Contrato não-vigente (PENDENTE/INATIVO) → Exceção: "Contrato não está vigente"
✅ Atualizar status para AFASTADO → Permitido
✅ Salário recalculado quando contrato é atualizado → Sempre consistente
```

---

### Alocação (Regras Críticas de Escalação)
**Atributos Obrigatórios**: `FuncionarioId`, `PostoDeTrabalhoId`, `Data`, `TipoAlocacao`, `StatusAlocacao`

**Regras de Negócio**:
- ✅ **Funcionário e posto do mesmo condomínio**: Validação de consistência de empresa
- ✅ **UMA alocação por funcionário por vez**: Funcionário não pode ter duas alocações simultâneas
- ✅ **Bloqueio de dias consecutivos**: Não permitir alocações em dias seguidos, **EXCETO** `DOBRA_PROGRAMADA`
- ✅ **Uma dobra e descanso**: Após `DOBRA_PROGRAMADA`, funcionário deve ter um dia de folga obrigatório
- ✅ **Status controlado**: `CONFIRMADA`, `CANCELADA`, `FALTA_REGISTRADA`

**Cenários Críticos**:
```
✅ Alocação REGULAR 2026-01-10 → Criada com sucesso
❌ Mesma pessoa 2026-01-10 e 2026-01-11 REGULAR → Exceção: "Não é permitido duas alocações em dias consecutivos"
✅ Mesma pessoa 2026-01-10 REGULAR + 2026-01-11 DOBRA_PROGRAMADA → Permitido
❌ Após DOBRA_PROGRAMADA, nova alocação no dia seguinte → Exceção: "Funcionário deve descansar após dobra"
❌ Funcionário de Condomínio A alocado em Posto do Condomínio B → Exceção: "Funcionário e Posto devem pertencer ao mesmo condomínio"
❌ Duas alocações simultâneas (mesma data) → Exceção: "Funcionário já possui alocação neste período"
```

---

### Contrato
**Atributos Obrigatórios**: `CondominioId`, `ValorTotalMensal`, `DataInicio`, `DataFim`, `Status`, `QuantidadeFuncionarios`

**Regras de Negócio**:
- ✅ **Um contrato vigente por condomínio**: Não pode haver dois contratos `PAGO` ou `PENDENTE` para o mesmo condomínio simultaneamente
- ✅ **Auto-finalização**: contratos com `DataFim` vencida são automaticamente marcados como `FINALIZADO`
- ✅ **Período válido**: `DataFim` > `DataInicio`
- ✅ **Valores positivos**: Todos os valores financeiros devem ser ≥ 0
- ✅ **Status controlado**: `PAGO`, `PENDENTE`, `FINALIZADO`, `INATIVO`
- ✅ **Cálculo automático**: Base de 30 dias/mês para cálculos de diárias

**Cenários Críticos**:
```
✅ Contrato 2026-01-01 a 2026-12-31 status PENDENTE → Criado
❌ Segundo contrato mesmo condomínio status PAGO → Exceção: "Já existe contrato vigente para este condomínio"
✅ Contrato INATIVO + novo contrato PAGO → Permitido (anterior não está vigente)
❌ DataFim < DataInicio → Validação falha
✅ Transição PENDENTE → PAGO → Permitido
✅ Transição PAGO → INATIVO → Permitido (encerramento)
✅ Contrato expirado automaticamente marcado como FINALIZADO → Não bloqueia novo contrato
```

---

### 🚀 Criação em Cascata (FASE 5)
**Endpoint**: `POST /api/condominios-completos`

**Objetivo**: Criar Condomínio, Contrato e Postos de Trabalho em uma única operação.

**Regras de Negócio**:
- ✅ **Validação de Consistência**: `Condominio.QuantidadeFuncionariosIdeal` == `Contrato.QuantidadeFuncionarios`
- ✅ **Validação de Divisibilidade**: Quantidade de funcionários deve ser divisível pelo número de postos
- ✅ **Validação de Datas**: Data de início do contrato não pode ser no passado
- ✅ **Criação Automática de Postos**: Postos criados automaticamente baseados no horário de troca de turno
  - 2 postos → turnos de 12h cada
  - 3 postos → turnos de 8h cada
  - N postos → 24h / N
- ✅ **Endpoint de Validação**: `POST /api/condominios-completos/validar` (dry-run)

**Exemplo de Request**:
```json
{
  "condominio": {
    "nome": "Residencial Estrela",
    "cnpj": "12.345.678/0001-90",
    "endereco": "Rua das Flores, 123",
    "quantidadeFuncionariosIdeal": 12,
    "horarioTrocaTurno": "06:00:00",
    "emailGestor": "gestor@estrela.com",
    "telefoneEmergencia": "+5511999999999"
  },
  "contrato": {
    "descricao": "Contrato 2026",
    "valorTotalMensal": 36000.00,
    "quantidadeFuncionarios": 12,
    "dataInicio": "2026-01-10",
    "dataFim": "2026-12-31"
  },
  "criarPostosAutomaticamente": true,
  "numeroDePostos": 2
}
```

**Cenários de Teste**:
```
✅ Criar condomínio completo (1 request) → Condomínio + Contrato + 2 Postos criados
✅ Validar dados antes de criar → Status 200 (válido) ou 400 (inválido)
❌ Quantidade de funcionários difere → Erro: "Quantidade deve ser igual"
❌ Funcionários não divisíveis por postos → Erro: "Deve ser divisível"
❌ Data de início no passado → Erro: "Data não pode ser no passado"
✅ Postos com horários calculados automaticamente → Posto 1: 06:00-18:00, Posto 2: 18:00-06:00
```

**Benefícios**:
- 📉 **75% menos requests** (de 4 para 1)
- 🎯 **Validações centralizadas** (consistência garantida)
- ⚡ **Cálculo automático de horários** (sem lógica no frontend)
- ✅ **Transação implícita** (tudo ou nada)

---

### Resumo das Validações Implementadas

| Entidade | Validação Principal | Exceção/Status |
|----------|-------------------|----------------|
| Condomínio | CNPJ único por empresa + Configs operacionais | `InvalidOperationException` |
| PostoDeTrabalho | Turnos de 12h exatas + Quantidade calculada | `ArgumentException` |
| Funcionário | CPF único + Vínculo com contrato vigente | `InvalidOperationException` |
| Alocação | Dias consecutivos + alocação simultânea + descanso pós-dobra | `InvalidOperationException` |
| Contrato | ✅ Um vigente por condomínio + auto-finalização | `InvalidOperationException` |
| **Criação Cascata** | **Consistência + Divisibilidade + Datas válidas** | `InvalidOperationException` |

## Como executar

```bash
# Restaurar pacotes e rodar testes
cd /home/jpcalsavara/projetos/andamento/InterceptorSystem
DOTNET_ENVIRONMENT=Development dotnet test src/InterceptorSystem.Tests/InterceptorSystem.Tests.csproj

# Subir ambiente local
cd src
cp ../.env.example ../.env   # ajuste variáveis antes
docker compose up --build
```

## Estrutura de pastas (resumo)

```
 src/
 ├── InterceptorSystem.Api/           # Controllers, Program
 ├── InterceptorSystem.Application/   # DTOs, AppServices, Interfaces
 ├── InterceptorSystem.Domain/        # Entidades, Enums, Interfaces
 ├── InterceptorSystem.Infrastructure/# DbContext, Configurations, Repositories
 ├── InterceptorSystem.Tests/         # Unity + Integration tests
 └── docs/test-payloads/              # JSONs para cURL/Swagger
```

## Contato e colaboração

- Abra issues detalhando Situação, Tarefa, Ação, Resultado esperados.
- Pull Requests devem incluir testes e seguir o mesmo padrão de validação já existente.
- Dúvidas sobre tenant, enums ou regras de negócio? Consulte as classes nos módulos de domínio antes de propor mudanças.
