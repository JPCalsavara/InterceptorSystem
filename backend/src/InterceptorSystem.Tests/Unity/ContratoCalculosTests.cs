using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes para validar os cálculos financeiros do Contrato
/// CRÍTICO: Valida FASE 3 (margens de lucro e faltas)
/// </summary>
public class ContratoCalculosTests
{
    [Fact]
    public void CalcularSalarioBase_DeveConsiderarTodasAsMargens()
    {
        // Arrange - Cenário realista
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        
        // Criar condomínio (necessário para calcular QuantidadeFuncionarios)
        var condominio = new Condominio(empresaId, "Residencial Teste", "12.345.678/0001-90", "Rua Teste, 123", 6, TimeSpan.FromHours(6));
        
        var contrato = new Contrato(
            empresaId: empresaId,
            condominioId: condominioId,
            descricao: "Contrato Teste",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,              // 15% = R$ 10.800
            numeroDePostos: 2,                      // Número de postos/turnos (QuantidadeFuncionarios = 6 × 2 = 12)
            margemLucroPercentual: 0.20m,           // 20% = R$ 14.400
            margemCoberturaFaltasPercentual: 0.10m, // 10% = R$  7.200
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );
        
        // Simular navegação (normalmente feita pelo EF Core)
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);

        // Act
        var salarioBase = contrato.CalcularSalarioBasePorFuncionario();

        // Assert
        // Distribuição esperada de R$ 72.000:
        // - Impostos (15%):  R$ 10.800
        // - Lucro (20%):     R$ 14.400
        // - Faltas (10%):    R$  7.200
        // - Benefícios:      R$  3.600
        // = Base Salários:   R$ 36.000
        // ÷ 12 funcionários = R$  3.000
        Assert.Equal(3000m, salarioBase);
    }

    [Fact]
    public void CalcularSalarioBase_SemMargens_DeveDarValorMaior()
    {
        // Arrange - Mesmo valor total mas SEM margens
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        
        // Criar condomínio (necessário para calcular QuantidadeFuncionarios)
        var condominio = new Condominio(empresaId, "Residencial Teste", "12.345.678/0001-90", "Rua Teste, 123", 6, TimeSpan.FromHours(6));
        
        var contrato = new Contrato(
            empresaId: empresaId,
            condominioId: condominioId,
            descricao: "Sem Margens",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0m,                 // 0%
            numeroDePostos: 2,                      // Número de postos/turnos (12 funcionários)
            margemLucroPercentual: 0m,              // 0%
            margemCoberturaFaltasPercentual: 0m,    // 0%
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );
        
        // Simular navegação (normalmente feita pelo EF Core)
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);

        // Act
        var salarioBase = contrato.CalcularSalarioBasePorFuncionario();

        // Assert
        // (72000 - 0 - 0 - 0 - 3600) / 12 = 5700
        // Muito maior que 3000 (com margens)
        Assert.Equal(5700m, salarioBase);
    }

    [Fact]
    public void CalcularSalarioBase_BaseNegativa_DeveLancarExcecao()
    {
        // Arrange - Margens muito altas para o valor total
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        
        var condominio = new Condominio(empresaId, "Residencial Teste", "12.345.678/0001-90", "Rua Teste, 123", 6, TimeSpan.FromHours(6));
        
        var contrato = new Contrato(
            empresaId: empresaId,
            condominioId: condominioId,
            descricao: "Margens Altas Demais",
            valorTotalMensal: 1000m,                // Valor muito baixo
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 900m,
            percentualImpostos: 0.15m,              // 150
            numeroDePostos: 2,                      // Número de postos/turnos (12 funcionários)
            margemLucroPercentual: 0.20m,           // 200
            margemCoberturaFaltasPercentual: 0.10m, // 100
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );
        
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);

        // Act & Assert
        // (1000 - 150 - 200 - 100 - 900) = -350 (negativo!)
        var ex = Assert.Throws<InvalidOperationException>(
            () => contrato.CalcularSalarioBasePorFuncionario()
        );

        Assert.Contains("Base para salários é negativa ou zero", ex.Message);
    }


    [Fact]
    public void CalcularAdicionalNoturno_DeveRetornarPercentualCorreto()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        
        var contrato = new Contrato(
            empresaId: empresaId,
            condominioId: condominioId,
            descricao: "Adicional Noturno",
            valorTotalMensal: 10000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,      // 30%
            valorBeneficiosExtrasMensal: 1000m,
            percentualImpostos: 0.15m,
            numeroDePostos: 2,                      // Número de postos/turnos
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );

        var salarioBase = 1000m;

        // Act
        var adicionalNoturno = contrato.CalcularAdicionalNoturno(salarioBase);

        // Assert
        // 1000 × 0.30 = 300
        Assert.Equal(300m, adicionalNoturno);
    }

    [Fact]
    public void CalcularBeneficiosPorFuncionario_DeveDividirIgualmente()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        
        var condominio = new Condominio(empresaId, "Residencial Teste", "12.345.678/0001-90", "Rua Teste, 123", 6, TimeSpan.FromHours(6));
        
        var contrato = new Contrato(
            empresaId: empresaId,
            condominioId: condominioId,
            descricao: "Benefícios",
            valorTotalMensal: 10000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,     // Total
            percentualImpostos: 0.15m,
            numeroDePostos: 2,                      // Número de postos/turnos (12 funcionários)
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );
        
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);

        // Act
        var beneficiosPorFuncionario = contrato.CalcularBeneficiosPorFuncionario();

        // Assert
        // 3600 / 12 = 300
        Assert.Equal(300m, beneficiosPorFuncionario);
    }

    [Fact]
    public void CalcularSalarioBase_CenarioRealCompleto()
    {
        // Arrange - Cenário real documentado
        // Contrato: R$ 72.000/mês para 12 funcionários
        var empresaId = Guid.NewGuid();
        var condominioId = Guid.NewGuid();
        
        var condominio = new Condominio(empresaId, "Residencial Estrela", "12.345.678/0001-90", "Av. Estrela, 456", 6, TimeSpan.FromHours(6));
        
        var contrato = new Contrato(
            empresaId: empresaId,
            condominioId: condominioId,
            descricao: "Residencial Estrela - Contrato 2026",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,
            numeroDePostos: 2,                      // Número de postos/turnos (12 funcionários)
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );
        
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);

        // Act - Calcular tudo
        var salarioBase = contrato.CalcularSalarioBasePorFuncionario();
        var adicionalNoturno = contrato.CalcularAdicionalNoturno(salarioBase);
        var beneficios = contrato.CalcularBeneficiosPorFuncionario();
        var salarioTotal = salarioBase + adicionalNoturno + beneficios;

        // Assert - Validar breakdown completo
        Assert.Equal(3000m, salarioBase);          // Base
        Assert.Equal(900m, adicionalNoturno);      // 30% do base
        Assert.Equal(300m, beneficios);            // 3600 / 12
        Assert.Equal(4200m, salarioTotal);         // Total

        // Validar distribuição do valor total (72000)
        var impostos = 72000m * 0.15m;             // 10800
        var lucro = 72000m * 0.20m;                // 14400
        var faltas = 72000m * 0.10m;               // 7200
        var beneficiosTotais = 3600m;
        var salariosTotais = salarioBase * 12;     // 36000

        var soma = impostos + lucro + faltas + beneficiosTotais + salariosTotais;
        Assert.Equal(72000m, soma);                // Deve fechar!
    }
}

