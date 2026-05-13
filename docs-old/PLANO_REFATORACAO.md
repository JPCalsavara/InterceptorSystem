# 📋 Plano de Refatoração - InterceptorSystem

## 🔍 Análise do Estado Atual

### ✅ **Pontos Fortes Já Implementados**

#### 1. **Arquitetura Limpa (Clean Architecture)** ⭐⭐⭐⭐⭐
- ✅ Separação clara em camadas (Domain, Application, Infrastructure, API)
- ✅ Domain rico com validações (`CheckRule`)
- ✅ Agregados bem definidos (`IAggregateRoot`)
- ✅ Repository Pattern genérico (`IRepository<T>`)
- ✅ Unit of Work implementado

#### 2. **Domain-Driven Design** ⭐⭐⭐⭐⭐
- ✅ Entidades com construtores ricos
- ✅ Validações no domínio (Fail Fast)
- ✅ Suporte a Domain Events (`_domainEvents`)
- ✅ Relacionamentos bem definidos
- ✅ Enums tipados (evita magic strings)

#### 3. **Multi-Tenancy** ⭐⭐⭐⭐⭐
- ✅ `EmpresaId` em todas entidades
- ✅ `CurrentTenantService` para isolamento
- ✅ Filtros globais (presumível no `ApplicationDbContext`)

#### 4. **Qualidade de Código** ⭐⭐⭐⭐
- ✅ Testes unitários e de integração
- ✅ Documentação técnica
- ✅ Payloads de teste

---

## 🚨 Problemas Identificados

### **1. Duplicação de Responsabilidades Financeiras**

#### 📌 Problema:
```csharp
// Funcionario.cs - Salário MANUAL
public decimal SalarioMensal { get; private set; }
public decimal ValorTotalBeneficiosMensal { get; private set; }
public decimal ValorDiariasFixas { get; private set; }

// Contrato.cs - Dados financeiros DO CONTRATO
public decimal ValorTotalMensal { get; private set; }
public int QuantidadeFuncionarios { get; private set; }
public decimal PercentualAdicionalNoturno { get; private set; }
```

#### ❌ **Impacto:**
- Funcionário CLT criado com salário X
- Contrato reajustado para valor Y
- **Salários ficam desatualizados** (dados divergentes)
- Cálculos financeiros manuais propensos a erros

---

### **2. Falta de Configurações Operacionais Centralizadas**

#### 📌 Problema:
```csharp
// Cliente.cs - Apenas dados cadastrais
public string Nome { get; private set; }
public string Cnpj { get; private set; }
public string Endereco { get; private set; }
```

#### ❌ **Falta:**
- Quantidade ideal de funcionários (deveria estar no Cliente)
- Horário de troca de turno (atualmente implícito em Posto)
- Email do gestor (para notificações automáticas)
- Telefone de emergência

#### ❌ **Impacto:**
- Criação manual de Postos de Trabalho (sem automação)
- Não há validação de "Cliente precisa de 10 funcionários, mas só tem 7"
- Notificações de contratos vencendo não podem ser enviadas

---

### **3. Posto com Responsabilidade Excessiva**

#### 📌 Problema:
```csharp
// Posto.cs
public int QuantidadeIdealFuncionarios { get; private set; } // Deveria vir do Cliente
public int CapacidadeMaximaPorDobras => PermiteDobrarEscala ? QuantidadeIdealFuncionarios * 2 : QuantidadeIdealFuncionarios;
```

#### ❌ **Impacto:**
- Se Cliente precisa de 10 funcionários divididos em 2 turnos (5 cada), essa lógica fica **duplicada** em cada Posto
- Mudança na quantidade total requer atualizar **todos os postos**

---

### **4. Sem Vínculo Contrato ↔ Funcionário**

#### 📌 Problema:
```csharp
public class Funcionario
{
    public Guid ClienteId { get; private set; } // ✅ Vinculado ao cliente
    // ❌ NÃO vinculado ao contrato vigente
}
```

#### ❌ **Impacto:**
- Funcionário CLT criado **sem saber qual contrato está pagando ele**
- Impossível saber se funcionário é de um contrato expirado
- Cálculo de salário não pode ser automático

---

## 📊 Matriz de Priorização

| # | Melhoria | Complexidade | Necessidade | Impacto | Prioridade |
|---|----------|--------------|-------------|---------|------------|
| **1** | Adicionar Configurações Operacionais no Cliente | 🟢 Baixa | 🔴 Alta | 🔴 Alta | **P0** |
| **2** | Vincular Funcionário ao Contrato | 🟡 Média | 🔴 Alta | 🔴 Alta | **P0** |
| **3** | Cálculo Automático de Salário via Contrato | 🔴 Alta | 🟡 Média | 🔴 Alta | **P1** |
| **4** | Remover QuantidadeIdeal de Posto | 🟡 Média | 🟡 Média | 🟡 Média | **P1** |
| **5** | Criação em Cascata (Cliente → Contrato → Postos) | 🟡 Média | 🟢 Baixa | 🟡 Média | **P2** |
| **6** | Value Objects (Email, Telefone, Dinheiro) | 🔴 Alta | 🟢 Baixa | 🟡 Média | **P3** |
| **7** | Domain Events para Notificações | 🔴 Alta | 🟢 Baixa | 🟡 Média | **P3** |
| **8** | CQRS para Relatórios Financeiros | 🔴 Alta | 🟢 Baixa | 🟢 Baixa | **P4** |

**Legenda:**
- 🟢 Baixa | 🟡 Média | 🔴 Alta
- **P0**: Crítico (fazer já)
- **P1**: Importante (próximo sprint)
- **P2**: Desejável (backlog)
- **P3**: Nice to have (quando possível)
- **P4**: Futuro (manter no radar)

---

## 🎯 Plano de Execução

### **FASE 0: Preparação** (1h)
✅ Criar branch `refactor/domain-improvements`
✅ Backup do banco de dados
✅ Executar testes atuais para baseline

---

### **FASE 1: Configurações Operacionais** (2-3 dias) - **P0**

#### **Objetivo:** Centralizar configurações operacionais no Cliente

#### **1.1 Atualizar Entidade Cliente** ⏱️ 1h
```csharp
public class Cliente : Entity, IAggregateRoot
{
    // ...propriedades existentes...
    
    // NOVOS CAMPOS
    public int QuantidadeFuncionariosIdeal { get; private set; }
    public TimeSpan HorarioTrocaTurno { get; private set; } // Ex: 06:00
    public string? EmailGestor { get; private set; }
    public string? TelefoneEmergencia { get; private set; }
    
    // Atualizar construtor
    public Cliente(
        Guid empresaId, 
        string nome, 
        string cnpj, 
        string endereco,
        int quantidadeFuncionariosIdeal,
        TimeSpan horarioTrocaTurno,
        string? emailGestor = null,
        string? telefoneEmergencia = null)
    {
        // ...validações existentes...
        CheckRule(quantidadeFuncionariosIdeal <= 0, "Quantidade de funcionários deve ser maior que zero.");
        
        QuantidadeFuncionariosIdeal = quantidadeFuncionariosIdeal;
        HorarioTrocaTurno = horarioTrocaTurno;
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;
    }
    
    // Método de atualização
    public void AtualizarConfiguracoesOperacionais(
        int quantidadeFuncionariosIdeal,
        TimeSpan horarioTrocaTurno,
        string? emailGestor,
        string? telefoneEmergencia)
    {
        CheckRule(quantidadeFuncionariosIdeal <= 0, "Quantidade de funcionários deve ser maior que zero.");
        
        QuantidadeFuncionariosIdeal = quantidadeFuncionariosIdeal;
        HorarioTrocaTurno = horarioTrocaTurno;
        EmailGestor = emailGestor;
        TelefoneEmergencia = telefoneEmergencia;
    }
}
```

#### **1.2 Atualizar DTOs** ⏱️ 30min
```csharp
// CreateClienteDtoInput
public record CreateClienteDtoInput(
    string Nome, 
    string Cnpj, 
    string Endereco,
    int QuantidadeFuncionariosIdeal,
    TimeSpan HorarioTrocaTurno,
    string? EmailGestor = null,
    string? TelefoneEmergencia = null
);

// ClienteDtoOutput
public record ClienteDtoOutput(
    Guid Id, 
    string Nome, 
    string Cnpj, 
    string Endereco,
    int QuantidadeFuncionariosIdeal,
    string HorarioTrocaTurno,
    string? EmailGestor,
    string? TelefoneEmergencia
);
```

#### **1.3 Migration** ⏱️ 30min
```bash
cd src/InterceptorSystem.Infrastructure
dotnet ef migrations add AddConfiguracoesOperacionaisCliente
dotnet ef database update
```

#### **1.4 Atualizar Testes** ⏱️ 1h
- Atualizar testes unitários de `Cliente`
- Atualizar testes de integração de `ClientesController`
- Adicionar casos de teste para validações

#### **1.5 Atualizar Payloads de Teste** ⏱️ 15min
```json
// docs/test-payloads/clientes.json
{
  "nome": "Cliente Estrela",
  "cnpj": "12345678000199",
  "endereco": "Rua das Flores, 123",
  "quantidadeFuncionariosIdeal": 10,
  "horarioTrocaTurno": "06:00:00",
  "emailGestor": "gestor@estrela.com.br",
  "telefoneEmergencia": "(11) 98765-4321"
}
```

---

### **FASE 2: Vínculo Funcionário ↔ Contrato** (2-3 dias) - **P0**

#### **Objetivo:** Garantir que funcionários estejam vinculados a contratos vigentes

#### **2.1 Atualizar Entidade Funcionario** ⏱️ 1h
```csharp
public class Funcionario : Entity, IAggregateRoot
{
    public Guid ClienteId { get; private set; }
    public Guid ContratoId { get; private set; } // NOVO
    
    // REMOVER campos de salário manual (faremos isso na Fase 3)
    // public decimal SalarioMensal { get; private set; } ❌
    // public decimal ValorTotalBeneficiosMensal { get; private set; } ❌
    // public decimal ValorDiariasFixas { get; private set; } ❌
    
    public Cliente? Cliente { get; private set; }
    public Contrato? Contrato { get; private set; } // NOVO
    
    public Funcionario(
        Guid empresaId,
        Guid clienteId,
        Guid contratoId, // NOVO
        string nome,
        string cpf,
        string celular,
        StatusFuncionario statusFuncionario,
        TipoEscala tipoEscala,
        TipoFuncionario tipoFuncionario)
    {
        // ...validações existentes...
        CheckRule(contratoId == Guid.Empty, "O funcionário deve estar vinculado a um contrato.");
        
        ContratoId = contratoId;
    }
}
```

#### **2.2 Adicionar Validação de Contrato Vigente** ⏱️ 1h
```csharp
// FuncionarioAppService.cs
public async Task<FuncionarioDtoOutput> CreateAsync(CreateFuncionarioDtoInput input)
{
    var contrato = await _contratoRepository.GetByIdAsync(input.ContratoId);
    
    if (contrato == null)
        throw new InvalidOperationException("Contrato não encontrado.");
    
    if (contrato.Status != StatusContrato.PAGO)
        throw new InvalidOperationException("Funcionário só pode ser criado para contrato vigente (PAGO).");
    
    var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
    if (contrato.DataFim < hoje)
        throw new InvalidOperationException("Contrato expirado. Não é possível criar funcionários.");
    
    // ...criação do funcionário...
}
```

#### **2.3 Migration** ⏱️ 30min
```bash
dotnet ef migrations add AddContratoIdToFuncionario
dotnet ef database update
```

#### **2.4 Atualizar Testes** ⏱️ 2h
- Casos de teste para contrato inexistente
- Casos de teste para contrato expirado
- Casos de teste para contrato não-vigente (PENDENTE/INATIVO)

---

### **FASE 3: Cálculo Automático de Salário** (3-5 dias) - **P1**

#### **Objetivo:** Salário calculado automaticamente baseado no contrato

#### **3.1 Adicionar Métodos de Cálculo no Contrato** ⏱️ 2h
```csharp
public class Contrato : Entity, IAggregateRoot
{
    // ...propriedades existentes...
    
    /// <summary>
    /// Calcula o salário base por funcionário (divisão igualitária)
    /// </summary>
    public decimal CalcularSalarioBasePorFuncionario()
    {
        if (QuantidadeFuncionarios == 0)
            throw new InvalidOperationException("Contrato sem funcionários definidos.");
        
        // Valor total - impostos - benefícios = salário líquido total
        var valorLiquidoTotal = ValorTotalMensal 
            - (ValorTotalMensal * PercentualImpostos) 
            - ValorBeneficiosExtrasMensal;
        
        return valorLiquidoTotal / QuantidadeFuncionarios;
    }
    
    /// <summary>
    /// Calcula adicional noturno baseado no tipo de escala
    /// </summary>
    public decimal CalcularAdicionalNoturno(decimal salarioBase)
    {
        return salarioBase * PercentualAdicionalNoturno;
    }
    
    /// <summary>
    /// Calcula benefícios por funcionário
    /// </summary>
    public decimal CalcularBeneficiosPorFuncionario()
    {
        if (QuantidadeFuncionarios == 0)
            throw new InvalidOperationException("Contrato sem funcionários definidos.");
        
        return ValorBeneficiosExtrasMensal / QuantidadeFuncionarios;
    }
}
```

#### **3.2 Adicionar Cálculo no Funcionário** ⏱️ 1h
```csharp
public class Funcionario : Entity, IAggregateRoot
{
    // Propriedade calculada (não persiste no banco)
    [NotMapped]
    public decimal SalarioTotal
    {
        get
        {
            if (Contrato == null)
                throw new InvalidOperationException("Funcionário sem contrato vinculado.");
            
            var salarioBase = Contrato.CalcularSalarioBasePorFuncionario();
            var adicionalNoturno = TipoEscala == TipoEscala.DOZE_POR_TRINTA_SEIS 
                ? Contrato.CalcularAdicionalNoturno(salarioBase) 
                : 0;
            var beneficios = Contrato.CalcularBeneficiosPorFuncionario();
            
            return salarioBase + adicionalNoturno + beneficios;
        }
    }
    
    public decimal SalarioBase => Contrato?.CalcularSalarioBasePorFuncionario() ?? 0;
    public decimal AdicionalNoturno => TipoEscala == TipoEscala.DOZE_POR_TRINTA_SEIS 
        ? Contrato?.CalcularAdicionalNoturno(SalarioBase) ?? 0 
        : 0;
    public decimal Beneficios => Contrato?.CalcularBeneficiosPorFuncionario() ?? 0;
}
```

#### **3.3 Atualizar DTOs** ⏱️ 30min
```csharp
public record FuncionarioDtoOutput(
    Guid Id,
    Guid ClienteId,
    Guid ContratoId,
    string Nome,
    string Cpf,
    string Celular,
    StatusFuncionario StatusFuncionario,
    TipoEscala TipoEscala,
    TipoFuncionario TipoFuncionario,
    decimal SalarioBase,      // Calculado
    decimal AdicionalNoturno, // Calculado
    decimal Beneficios,       // Calculado
    decimal SalarioTotal      // Calculado
);
```

#### **3.4 Testes Financeiros** ⏱️ 2h
```csharp
[Fact]
public void CalcularSalario_DeveDividirValorTotalMensalCorretamente()
{
    // Arrange
    var contrato = new Contrato(
        empresaId: Guid.NewGuid(),
        clienteId: Guid.NewGuid(),
        descricao: "Teste",
        valorTotalMensal: 30000m,
        valorDiariaCobrada: 1000m,
        percentualAdicionalNoturno: 0.20m,
        valorBeneficiosExtrasMensal: 3000m,
        percentualImpostos: 0.10m,
        quantidadeFuncionarios: 10,
        margemLucroPercentual: 0.15m,
        margemCoberturaFaltasPercentual: 0.05m,
        dataInicio: DateOnly.FromDateTime(DateTime.Today),
        dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
        status: StatusContrato.PAGO
    );
    
    // Act
    var salarioBase = contrato.CalcularSalarioBasePorFuncionario();
    
    // Assert
    // (30000 - 3000 - 3000) / 10 = 2400
    Assert.Equal(2400m, salarioBase);
}
```

---

### **FASE 4: Simplificar Posto** (2 dias) - **P1**

#### **Objetivo:** Remover `QuantidadeIdealFuncionarios` de Posto

#### **4.1 Atualizar Entidade** ⏱️ 1h
```csharp
public class Posto : Entity, IAggregateRoot
{
    public Guid ClienteId { get; private set; }
    public TimeSpan HorarioInicio { get; private set; }
    public TimeSpan HorarioFim { get; private set; }
    public bool PermiteDobrarEscala { get; private set; }
    
    // REMOVER
    // public int QuantidadeIdealFuncionarios { get; private set; } ❌
    
    public Cliente? Cliente { get; private set; }
    
    // Propriedade calculada baseada no Cliente
    [NotMapped]
    public int QuantidadeIdealFuncionarios
    {
        get
        {
            if (Cliente == null)
                throw new InvalidOperationException("Posto sem cliente vinculado.");
            
            // Divide igualmente entre turnos
            var totalPostos = Cliente.Postos.Count;
            return totalPostos > 0 
                ? Cliente.QuantidadeFuncionariosIdeal / totalPostos 
                : 0;
        }
    }
}
```

#### **4.2 Migration** ⏱️ 30min
```bash
dotnet ef migrations add RemoveQuantidadeIdealFromPosto
dotnet ef database update
```

---

### **FASE 5: Criação em Cascata** (2-3 dias) - **P2**

#### **Objetivo:** Criar Cliente + Contrato + Postos em uma operação

#### **5.1 Criar Serviço Orquestrador** ⏱️ 2h
```csharp
public interface IClienteOrquestradorService
{
    Task<ClienteCompletoDtoOutput> CriarClienteCompletoAsync(
        CreateClienteCompletoDtoInput input);
}

public class ClienteOrquestradorService : IClienteOrquestradorService
{
    private readonly IClienteAppService _clienteService;
    private readonly IContratoAppService _contratoService;
    private readonly IPostoAppService _postoService;
    
    public async Task<ClienteCompletoDtoOutput> CriarClienteCompletoAsync(
        CreateClienteCompletoDtoInput input)
    {
        // 1. Criar Cliente
        var cliente = await _clienteService.CreateAsync(input.Cliente);
        
        // 2. Criar Contrato
        input.Contrato.ClienteId = cliente.Id;
        var contrato = await _contratoService.CreateAsync(input.Contrato);
        
        // 3. Criar Postos Automaticamente
        var postoDiurno = new CreatePostoInput(
            ClienteId: cliente.Id,
            HorarioInicio: input.Cliente.HorarioTrocaTurno,
            HorarioFim: input.Cliente.HorarioTrocaTurno.Add(TimeSpan.FromHours(12)),
            PermiteDobrarEscala: true
        );
        
        var postoNoturno = new CreatePostoInput(
            ClienteId: cliente.Id,
            HorarioInicio: input.Cliente.HorarioTrocaTurno.Add(TimeSpan.FromHours(12)),
            HorarioFim: input.Cliente.HorarioTrocaTurno,
            PermiteDobrarEscala: true
        );
        
        var posto1 = await _postoService.CreateAsync(postoDiurno);
        var posto2 = await _postoService.CreateAsync(postoNoturno);
        
        return new ClienteCompletoDtoOutput(
            Cliente: cliente,
            Contrato: contrato,
            Postos: new[] { posto1, posto2 }
        );
    }
}
```

---

## 📈 Roadmap de Implementação

### **Sprint 1 (Semana 1-2)** ✅ CONCLUÍDO
- ✅ FASE 1: Configurações Operacionais
- ✅ FASE 2: Vínculo Contrato ↔ Funcionário

### **Sprint 2 (Semana 3-4)** ✅ CONCLUÍDO
- ✅ FASE 3: Cálculo Automático de Salário
- ✅ FASE 4: Simplificar Posto

### **Sprint 3 (Semana 5-6)** ✅ CONCLUÍDO
- ✅ FASE 5: Criação em Cascata
- ✅ Documentação final
- ⏳ Deploy em staging (próximo passo)

---

## 🎯 Melhorias Futuras (Backlog)

### **P3: Value Objects** (Complexidade Alta)
```csharp
public record Email
{
    public string Value { get; }
    
    public Email(string value)
    {
        if (!IsValid(value))
            throw new ArgumentException("Email inválido");
        Value = value;
    }
    
    private static bool IsValid(string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$");
    }
}

public record Telefone { /* ... */ }
public record Dinheiro { /* ... */ }
public record Cnpj { /* ... */ }
```

### **P3: Domain Events** (Complexidade Alta)
```csharp
public class ContratoFinalizadoEvent : IDomainEvent
{
    public Guid ContratoId { get; }
    public DateTime DataFinalizacao { get; }
    public string EmailGestor { get; }
}

// Handler
public class ContratoFinalizadoEventHandler : INotificationHandler<ContratoFinalizadoEvent>
{
    public async Task Handle(ContratoFinalizadoEvent evento, CancellationToken ct)
    {
        // Enviar email
        // Gerar relatório
        // Bloquear diárias
    }
}
```

### **P4: CQRS para Relatórios** (Complexidade Alta)
```csharp
public record ObterRelatorioFinanceiroQuery
{
    public Guid ClienteId { get; init; }
    public int Mes { get; init; }
    public int Ano { get; init; }
}

public class RelatorioFinanceiroQueryHandler
{
    public async Task<RelatorioFinanceiroDto> Handle(ObterRelatorioFinanceiroQuery query)
    {
        // Consulta otimizada com Dapper
        // Sem tracking do EF Core
        // Join manual para performance
    }
}
```

---

## 📊 Métricas de Sucesso

### **Antes da Refatoração**
- ❌ Salários desatualizados quando contrato muda
- ❌ Criação manual de postos de trabalho
- ❌ Sem validação de quantidade de funcionários
- ❌ Funcionários sem vínculo com contrato

### **Depois da Refatoração (Meta)**
- ✅ Salários sempre consistentes com contrato vigente
- ✅ Criação automática de postos (80% menos código)
- ✅ Validações centralizadas no Cliente
- ✅ 100% dos funcionários vinculados a contratos
- ✅ Notificações automáticas de contratos vencendo
- ✅ Relatórios financeiros precisos

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Breaking changes em dados existentes | 🔴 Alta | 🔴 Alta | Migrations com dados padrão + Scripts de migração |
| Testes quebrarem | 🔴 Alta | 🟡 Média | Atualizar testes incrementalmente por fase |
| Performance do cálculo de salário | 🟡 Média | 🟡 Média | Eager loading de `Contrato` + Testes de carga |
| Complexidade aumentar | 🟡 Média | 🟢 Baixa | Code review rigoroso + Documentação |

---

## ✅ Checklist de Cada Fase

- [ ] Código implementado
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Migration executada com sucesso
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] Deploy em ambiente de staging
- [ ] Validação com dados reais

---

**Status:** ✅ **FASE 5 CONCLUÍDA** - Todas as fases principais implementadas!  
**Responsável:** Arquiteto .NET  
**Prazo estimado:** 6 semanas (3 sprints de 2 semanas)  
**Conclusão:** 2026-01-08 ✅

---

## 🎉 RESUMO FINAL

### **O Que Foi Implementado:**

| Fase | Status | Impacto |
|------|--------|---------|
| **FASE 1:** Configurações Operacionais | ✅ COMPLETO | Cliente centraliza configs |
| **FASE 2:** Vínculo Contrato ↔ Funcionário | ✅ COMPLETO | Funcionários sempre vinculados |
| **FASE 3:** Cálculo Automático de Salário | ✅ COMPLETO | Salários sempre consistentes |
| **FASE 4:** Simplificar Posto | ✅ COMPLETO | Quantidade calculada |
| **FASE 5:** Criação em Cascata | ✅ COMPLETO | 1 request ao invés de 4 |

### **Próximos Passos Recomendados:**

1. ⏳ Deploy em ambiente de staging
2. ⏳ Testes com usuários reais
3. ⏳ Monitoramento de performance
4. 📋 Backlog: Value Objects (P3)
5. 📋 Backlog: Domain Events (P3)
6. 📋 Backlog: CQRS para Relatórios (P4)

