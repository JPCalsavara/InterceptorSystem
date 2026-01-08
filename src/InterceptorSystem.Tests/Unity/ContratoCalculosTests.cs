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
        var contrato = new Contrato(
            empresaId: Guid.NewGuid(),
            condominioId: Guid.NewGuid(),
            descricao: "Contrato Teste",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,              // 15% = R$ 10.800
            quantidadeFuncionarios: 12,
            margemLucroPercentual: 0.20m,           // 20% = R$ 14.400
            margemCoberturaFaltasPercentual: 0.10m, // 10% = R$  7.200
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.PAGO
        );

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
        var contrato = new Contrato(
            empresaId: Guid.NewGuid(),
            condominioId: Guid.NewGuid(),
            descricao: "Sem Margens",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0m,                 // 0%
            quantidadeFuncionarios: 12,
            margemLucroPercentual: 0m,              // 0%
            margemCoberturaFaltasPercentual: 0m,    // 0%
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.PAGO
        );

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
        var contrato = new Contrato(
            empresaId: Guid.NewGuid(),
            condominioId: Guid.NewGuid(),
            descricao: "Margens Altas Demais",
            valorTotalMensal: 1000m,                // Valor muito baixo
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 900m,
            percentualImpostos: 0.15m,              // 150
            quantidadeFuncionarios: 10,
            margemLucroPercentual: 0.20m,           // 200
            margemCoberturaFaltasPercentual: 0.10m, // 100
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.PAGO
        );

        // Act & Assert
        // (1000 - 150 - 200 - 100 - 900) = -350 (negativo!)
        var ex = Assert.Throws<InvalidOperationException>(
            () => contrato.CalcularSalarioBasePorFuncionario()
        );

        Assert.Contains("Base para salários é negativa ou zero", ex.Message);
    }

    [Fact]
    public void Contrato_FuncionariosZero_NaoDevePermitirCriacao()
    {
        // Arrange & Act & Assert
        // Validação acontece no construtor (não permite criar)
        var ex = Assert.Throws<InvalidOperationException>(() =>
            new Contrato(
                empresaId: Guid.NewGuid(),
                condominioId: Guid.NewGuid(),
                descricao: "Sem Funcionários",
                valorTotalMensal: 10000m,
                valorDiariaCobrada: 100m,
                percentualAdicionalNoturno: 0.30m,
                valorBeneficiosExtrasMensal: 1000m,
                percentualImpostos: 0.15m,
                quantidadeFuncionarios: 0,              // ❌ Zero! (validado no construtor)
                margemLucroPercentual: 0.20m,
                margemCoberturaFaltasPercentual: 0.10m,
                dataInicio: DateOnly.FromDateTime(DateTime.Today),
                dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
                status: StatusContrato.PAGO
            )
        );

        Assert.Contains("funcionários deve ser maior que zero", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void CalcularAdicionalNoturno_DeveRetornarPercentualCorreto()
    {
        // Arrange
        var contrato = new Contrato(
            empresaId: Guid.NewGuid(),
            condominioId: Guid.NewGuid(),
            descricao: "Adicional Noturno",
            valorTotalMensal: 10000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,      // 30%
            valorBeneficiosExtrasMensal: 1000m,
            percentualImpostos: 0.15m,
            quantidadeFuncionarios: 10,
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.PAGO
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
        var contrato = new Contrato(
            empresaId: Guid.NewGuid(),
            condominioId: Guid.NewGuid(),
            descricao: "Benefícios",
            valorTotalMensal: 10000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,     // Total
            percentualImpostos: 0.15m,
            quantidadeFuncionarios: 12,
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.PAGO
        );

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
        var contrato = new Contrato(
            empresaId: Guid.NewGuid(),
            condominioId: Guid.NewGuid(),
            descricao: "Residencial Estrela - Contrato 2026",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,
            quantidadeFuncionarios: 12,
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.PAGO
        );

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

