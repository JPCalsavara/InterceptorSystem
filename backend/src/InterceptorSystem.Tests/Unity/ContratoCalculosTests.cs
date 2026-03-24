using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes para validar os cálculos financeiros do Contrato e Funcionário.
/// Phase 4: CalcularSalarioBasePorFuncionario removido; validamos CustoMensalEstimado via Tags.
/// </summary>
public class ContratoCalculosTests
{
    private static void PopularFuncionarios(Contrato contrato, int quantidade = 12)
    {
        var empresaId = contrato.EmpresaId;
        for (int i = 0; i < quantidade; i++)
        {
            var func = new Funcionario(
                empresaId, Guid.NewGuid(), contrato.Id,
                $"Func {i}", $"{i:00000000000}", "11999999999",
                StatusFuncionario.ATIVO, TipoEscala.DOZE_POR_TRINTA_SEIS, TipoFuncionario.CLT);
            typeof(Funcionario).GetProperty("Contrato")!.SetValue(func, contrato);
            contrato.Funcionarios.Add(func);
        }
    }

    [Fact]
    public void CalcularAdicionalNoturno_DeveRetornarPercentualCorreto()
    {
        // Arrange
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();
        
        var contrato = new Contrato(
            empresaId: empresaId,
            clienteId: clienteId,
            descricao: "Adicional Noturno",
            valorTotalMensal: 10000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,      // 30%
            valorBeneficiosExtrasMensal: 1000m,
            percentualEncargosProvisoes: 0.15m,
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
        var clienteId = Guid.NewGuid();
        
        var cliente = new Cliente(empresaId, "Residencial Teste", "00000000000000", "São Paulo", "SP");
        
        var contrato = new Contrato(
            empresaId: empresaId,
            clienteId: clienteId,
            descricao: "Benefícios",
            valorTotalMensal: 10000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,     // Total
            percentualEncargosProvisoes: 0.15m,
            numeroDePostos: 2,                      // Número de postos/turnos (12 funcionários)
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );
        
        typeof(Contrato).GetProperty("Cliente")!.SetValue(contrato, cliente);
        PopularFuncionarios(contrato, 12);

        // Act
        var beneficiosPorFuncionario = contrato.CalcularBeneficiosPorFuncionario();

        // Assert
        // 3600 / 12 = 300
        Assert.Equal(300m, beneficiosPorFuncionario);
    }

    [Fact]
    public void CustoMensalEstimado_DeveUsarMaiorValorDaTagNoContrato()
    {
        var empresaId = Guid.NewGuid();
        var clienteId = Guid.NewGuid();

        var contrato = new Contrato(
            empresaId: empresaId,
            clienteId: clienteId,
            descricao: "Residencial Estrela - Contrato 2026",
            valorTotalMensal: 72000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.30m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualEncargosProvisoes: 0.15m,
            numeroDePostos: 2,
            margemLucroPercentual: 0.20m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Today),
            dataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(12)),
            status: StatusContrato.ATIVO
        );

        PopularFuncionarios(contrato, 12);
        var funcionario = contrato.Funcionarios.First();

        var tagBasica = new Tag(empresaId, "Vigia");
        var tagPremium = new Tag(empresaId, "PM");

        contrato.DefinirTags(new[]
        {
            new ContratoTag(empresaId, contrato.Id, tagBasica.Id, 250m),
            new ContratoTag(empresaId, contrato.Id, tagPremium.Id, 400m)
        });

        funcionario.DefinirTags(new[]
        {
            new FuncionarioTag(empresaId, funcionario.Id, tagBasica.Id),
            new FuncionarioTag(empresaId, funcionario.Id, tagPremium.Id)
        });

        var custoEstimado = funcionario.CustoMensalEstimado;

        Assert.Equal(12300m, custoEstimado);
    }
}

