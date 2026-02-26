using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes para a nova lógica de adicional noturno baseado no horário do posto de trabalho (CLT Art. 73)
/// </summary>
public class AdicionalNoturnoTests
{
    private readonly Guid _empresaId = Guid.NewGuid();
    private readonly Guid _condominioId = Guid.NewGuid();
    private readonly Guid _contratoId = Guid.NewGuid();

    [Fact(DisplayName = "PostoDeTrabalho - Deve identificar horário noturno (22h às 5h)")]
    public void PostoDeTrabalho_DeveIdentificarHorarioNoturno()
    {
        // Arrange & Act
        var postoNoturno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(22, 0, 0), // 22h
            new TimeSpan(10, 0, 0), // 10h (próximo dia)
            permiteDobrarEscala: true
        );

        // Assert
        Assert.True(postoNoturno.TemHorarioNoturno);
    }

    [Fact(DisplayName = "PostoDeTrabalho - Deve identificar horário diurno (6h às 18h)")]
    public void PostoDeTrabalho_DeveIdentificarHorarioDiurno()
    {
        // Arrange & Act
        var postoDiurno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(6, 0, 0),  // 6h
            new TimeSpan(18, 0, 0), // 18h
            permiteDobrarEscala: true
        );

        // Assert
        Assert.False(postoDiurno.TemHorarioNoturno);
    }

    [Fact(DisplayName = "PostoDeTrabalho - Deve identificar horário noturno parcial (18h às 6h)")]
    public void PostoDeTrabalho_DeveIdentificarHorarioNoturnoParcial()
    {
        // Arrange & Act
        var postoNoturno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(18, 0, 0), // 18h
            new TimeSpan(6, 0, 0),  // 6h (próximo dia)
            permiteDobrarEscala: true
        );

        // Assert - Entre 18h e 6h há período noturno (22h às 5h)
        Assert.True(postoNoturno.TemHorarioNoturno);
    }

    [Fact(DisplayName = "PostoDeTrabalho - Deve identificar horário noturno (0h às 12h)")]
    public void PostoDeTrabalho_DeveIdentificarHorarioNoturno_MeiaNoite()
    {
        // Arrange & Act
        var postoNoturno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(0, 0, 0),  // 0h (meia-noite)
            new TimeSpan(12, 0, 0), // 12h
            permiteDobrarEscala: true
        );

        // Assert - Entre 0h e 5h é período noturno
        Assert.True(postoNoturno.TemHorarioNoturno);
    }

    [Fact(DisplayName = "Funcionario - Deve calcular adicional noturno quando tem alocação em posto noturno")]
    public void Funcionario_DeveCalcularAdicionalNoturno_QuandoTemAlocacaoNoturna()
    {
        // Arrange
        var condominio = new Condominio(
            _empresaId,
            "Condomínio Teste",
            "12.345.678/0001-90",
            "Rua Teste, 123",
            quantidadeIdealPorTurno: 12,
            horarioTrocaTurno: new TimeSpan(6, 0, 0),
            emailGestor: "teste@teste.com",
            telefoneEmergencia: "(11) 98765-4321"
        );

        var contrato = new Contrato(
            _empresaId,
            _condominioId,
            "Contrato Teste",
            valorTotalMensal: 36000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.20m, // 20% de adicional noturno
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,
            numeroDePostos: 2,
            margemLucroPercentual: 0.15m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Now.AddMonths(-1)),
            dataFim: DateOnly.FromDateTime(DateTime.Now.AddMonths(5)),
            StatusContrato.ATIVO
        );

        var postoNoturno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(22, 0, 0), // 22h
            new TimeSpan(10, 0, 0), // 10h
            permiteDobrarEscala: true
        );

        var funcionario = new Funcionario(
            _empresaId,
            _condominioId,
            _contratoId,
            "João Silva",
            "123.456.789-00",
            "(11) 98765-4321",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );

        // Simular navegação (normalmente feita pelo EF Core)
        typeof(Funcionario).GetProperty("Contrato")!.SetValue(funcionario, contrato);
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio); // IMPORTANTE: Contrato precisa do Condominio para calcular QuantidadeFuncionarios
        typeof(PostoDeTrabalho).GetProperty("Condominio")!.SetValue(postoNoturno, condominio);

        var alocacao = new Alocacao(
            _empresaId,
            funcionario.Id,
            postoNoturno.Id,
            DateOnly.FromDateTime(DateTime.Now),
            StatusAlocacao.CONFIRMADA,
            TipoAlocacao.REGULAR
        );

        // Simular navegação da alocação
        typeof(Alocacao).GetProperty("PostoDeTrabalho")!.SetValue(alocacao, postoNoturno);
        
        // Adicionar alocação ao funcionário
        funcionario.Alocacoes.Add(alocacao);

        // Act
        var adicionalNoturno = funcionario.AdicionalNoturno;

        // Assert
        Assert.True(adicionalNoturno > 0, "Funcionário com alocação em posto noturno deve ter adicional noturno");
        
        // Validar cálculo: 20% do salário base
        var salarioBase = contrato.CalcularSalarioBasePorFuncionario();
        var adicionalEsperado = contrato.CalcularAdicionalNoturno(salarioBase);
        
        Assert.Equal(adicionalEsperado, adicionalNoturno);
    }

    [Fact(DisplayName = "Funcionario - NÃO deve calcular adicional noturno quando tem alocação em posto diurno")]
    public void Funcionario_NaoDeveCalcularAdicionalNoturno_QuandoTemAlocacaoDiurna()
    {
        // Arrange
        var condominio = new Condominio(
            _empresaId,
            "Condomínio Teste",
            "12.345.678/0001-90",
            "Rua Teste, 123",
            quantidadeIdealPorTurno: 12,
            horarioTrocaTurno: new TimeSpan(6, 0, 0),
            emailGestor: "teste@teste.com",
            telefoneEmergencia: "(11) 98765-4321"
        );

        var contrato = new Contrato(
            _empresaId,
            _condominioId,
            "Contrato Teste",
            valorTotalMensal: 36000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.20m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,
            numeroDePostos: 2,
            margemLucroPercentual: 0.15m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Now.AddMonths(-1)),
            dataFim: DateOnly.FromDateTime(DateTime.Now.AddMonths(5)),
            StatusContrato.ATIVO
        );

        var postoDiurno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(6, 0, 0),  // 6h
            new TimeSpan(18, 0, 0), // 18h
            permiteDobrarEscala: true
        );

        var funcionario = new Funcionario(
            _empresaId,
            _condominioId,
            _contratoId,
            "Maria Santos",
            "987.654.321-00",
            "(11) 98765-1234",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );

        // Simular navegação
        typeof(Funcionario).GetProperty("Contrato")!.SetValue(funcionario, contrato);
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);
        typeof(PostoDeTrabalho).GetProperty("Condominio")!.SetValue(postoDiurno, condominio);

        var alocacao = new Alocacao(
            _empresaId,
            funcionario.Id,
            postoDiurno.Id,
            DateOnly.FromDateTime(DateTime.Now),
            StatusAlocacao.CONFIRMADA,
            TipoAlocacao.REGULAR
        );

        typeof(Alocacao).GetProperty("PostoDeTrabalho")!.SetValue(alocacao, postoDiurno);
        funcionario.Alocacoes.Add(alocacao);

        // Act
        var adicionalNoturno = funcionario.AdicionalNoturno;

        // Assert
        Assert.Equal(0m, adicionalNoturno);
    }

    [Fact(DisplayName = "Funcionario - NÃO deve calcular adicional noturno quando alocação está cancelada")]
    public void Funcionario_NaoDeveCalcularAdicionalNoturno_QuandoAlocacaoCancelada()
    {
        // Arrange
        var condominio = new Condominio(
            _empresaId,
            "Condomínio Teste",
            "12.345.678/0001-90",
            "Rua Teste, 123",
            quantidadeIdealPorTurno: 12,
            horarioTrocaTurno: new TimeSpan(6, 0, 0),
            emailGestor: "teste@teste.com",
            telefoneEmergencia: "(11) 98765-4321"
        );

        var contrato = new Contrato(
            _empresaId,
            _condominioId,
            "Contrato Teste",
            valorTotalMensal: 36000m,
            valorDiariaCobrada: 100m,
            percentualAdicionalNoturno: 0.20m,
            valorBeneficiosExtrasMensal: 3600m,
            percentualImpostos: 0.15m,
            numeroDePostos: 2,
            margemLucroPercentual: 0.15m,
            margemCoberturaFaltasPercentual: 0.10m,
            dataInicio: DateOnly.FromDateTime(DateTime.Now.AddMonths(-1)),
            dataFim: DateOnly.FromDateTime(DateTime.Now.AddMonths(5)),
            StatusContrato.ATIVO
        );

        var postoNoturno = new PostoDeTrabalho(
            _condominioId,
            _empresaId,
            _contratoId,
            new TimeSpan(22, 0, 0),
            new TimeSpan(10, 0, 0),
            permiteDobrarEscala: true
        );

        var funcionario = new Funcionario(
            _empresaId,
            _condominioId,
            _contratoId,
            "Carlos Souza",
            "111.222.333-44",
            "(11) 98765-5555",
            StatusFuncionario.ATIVO,
            TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario.CLT
        );

        // Simular navegação
        typeof(Funcionario).GetProperty("Contrato")!.SetValue(funcionario, contrato);
        typeof(Contrato).GetProperty("Condominio")!.SetValue(contrato, condominio);
        typeof(PostoDeTrabalho).GetProperty("Condominio")!.SetValue(postoNoturno, condominio);

        // Alocação CANCELADA
        var alocacao = new Alocacao(
            _empresaId,
            funcionario.Id,
            postoNoturno.Id,
            DateOnly.FromDateTime(DateTime.Now),
            StatusAlocacao.CANCELADA, // ← Cancelada
            TipoAlocacao.REGULAR
        );

        typeof(Alocacao).GetProperty("PostoDeTrabalho")!.SetValue(alocacao, postoNoturno);
        funcionario.Alocacoes.Add(alocacao);

        // Act
        var adicionalNoturno = funcionario.AdicionalNoturno;

        // Assert
        Assert.Equal(0m, adicionalNoturno);
    }
}
