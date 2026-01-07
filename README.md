# InterceptorSystem

## Plano (Método STAR)

- **Situação**: Descrever o contexto que originou o InterceptorSystem e os desafios enfrentados pelo time de segurança patrimonial.
- **Tarefa**: Explicar os objetivos técnicos e de negócio que o sistema precisa cumprir para suportar múltiplos condomínios.
- **Ação**: Detalhar as soluções implementadas (arquitetura, tecnologias, processos de desenvolvimento e testes).
- **Resultado**: Evidenciar ganhos obtidos, indicadores de qualidade e próximos passos.

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

- **Confiabilidade**: ✅ **TODAS as regras críticas implementadas e cobertas** por testes unitários/integrados. Sistema detecta e previne inconsistências automaticamente, incluindo a finalização automática de contratos vencidos.
- **Escalabilidade**: ✅ **Arquitetura limpa** facilita adicionar novos módulos sem quebrar validações existentes.
- **Operacional**: ✅ **Docker Compose** + **README completo** + **payloads documentados** = onboarding rápido.
- **Segurança**: ✅ **Multi-tenant rigoroso** + **regras de alocação** + **contratos únicos** garantem integridade operacional.

### **🎯 Regras Implementadas Recentemente**
1. **Alocação simultânea bloqueada** (funcionário não pode trabalhar 2x no mesmo dia)
2. **Descanso obrigatório após dobra** (legislação trabalhista)  
3. **Contrato vigente único + finalização automática ao vencer** (elimina ambiguidades financeiras)
4. **Transições de status controladas** (reativação segura de contratos)

**Próximos passos sugeridos**:
  1. ✅ ~~Implementar regras críticas de alocação e contrato~~ **CONCLUÍDO** 
  2. Automatizar migrations em pipeline e nos ambientes Docker.
  3. Implementar observabilidade (logs estruturados + métricas).
  4. Expor APIs públicas com autenticação JWT e rate limiting.

---

## Cenários e Regras de Negócio das Entidades

### Condomínio (Agregado Raiz)
**Atributos Obrigatórios**: `Nome`, `CNPJ`, `EmpresaId`

**Regras de Negócio**:
- ✅ **Unicidade de CNPJ por empresa**: Não pode haver dois condomínios com o mesmo CNPJ na mesma empresa
- ✅ **Multi-tenant**: Todos os condomínios são isolados por `EmpresaId`
- ✅ **Endereço completo**: Obrigatório ter endereço válido para operação

**Cenários de Teste**:
```
✅ Criar condomínio válido → Status 201
❌ CNPJ duplicado na mesma empresa → Exceção: "Já existe um condomínio cadastrado com este CNPJ"
❌ CNPJ inválido ou vazio → Validação falha
```

---

### PostoDeTrabalho
**Atributos Obrigatórios**: `Nome`, `CondominioId`, `HorarioInicio`, `HorarioFim`

**Regras de Negócio**:
- ✅ **Relação 1:N com Condomínio**: Posto sempre vinculado a um condomínio
- ✅ **Turnos de 12 horas**: Diferença entre `HorarioInicio` e `HorarioFim` deve ser exatamente 12 horas
- ✅ **Respeito ao tenant**: Posto só pode ser criado em condomínio da mesma empresa

**Cenários de Teste**:
```
✅ Posto 06:00-18:00 → Criado com sucesso
✅ Posto 18:00-06:00 (madrugada) → Criado com sucesso  
❌ Posto 08:00-16:00 (8h) → Exceção: "Diferença deve ser de 12 horas"
❌ Posto em condomínio de outra empresa → KeyNotFoundException
```

---

### Funcionário
**Atributos Obrigatórios**: `Nome`, `CPF`, `CondominioId`, `StatusFuncionario`, `TipoEscala`, `TipoFuncionario`, `SalarioBase`

**Regras de Negócio**:
- ✅ **CPF único no sistema**: Não pode haver dois funcionários com mesmo CPF
- ✅ **Valores financeiros positivos**: `SalarioBase`, `AdicionalNoturno`, `Beneficios` ≥ 0
- ✅ **Status controlado**: `ATIVO`, `FERIAS`, `AFASTADO`, `DEMITIDO`
- ✅ **Vinculação a condomínio**: Funcionário pertence a um condomínio específico

**Cenários de Teste**:
```
✅ Funcionário ATIVO com salário 2000 → Criado com sucesso
❌ CPF duplicado → Exceção: "CPF já cadastrado"
❌ Salário negativo (-100) → Validação falha
✅ Atualizar status para AFASTADO → Permitido
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

### Resumo das Validações Implementadas

| Entidade | Validação Principal | Exceção/Status |
|----------|-------------------|----------------|
| Condomínio | CNPJ único por empresa | `InvalidOperationException` |
| PostoDeTrabalho | Turnos de 12h exatas | `ArgumentException` |
| Funcionário | CPF único global | `InvalidOperationException` |
| Alocação | Dias consecutivos + alocação simultânea + descanso pós-dobra | `InvalidOperationException` |
| Contrato | ✅ Um vigente por condomínio + auto-finalização | `InvalidOperationException` |

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
