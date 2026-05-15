using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Tests.Unity;

/// <summary>
/// Testes para a lógica de horário noturno CLT Art. 73.
/// TemHorarioNoturno agora pertence a Alocacao (shift slot), não Posto (location).
/// Testes de cálculo de adicional noturno no Funcionario dependem de Phase 3 (Tags).
/// </summary>
public class AdicionalNoturnoTests
{
    private readonly Guid _empresaId = Guid.NewGuid();
    private readonly Guid _postoId = Guid.NewGuid();
    private readonly Guid _contratoId = Guid.NewGuid();

    [Fact(DisplayName = "Alocacao - Deve identificar horário noturno (22h às 10h)")]
    public void Alocacao_DeveIdentificarHorarioNoturno()
    {
        // Arrange & Act
        var alocacao = new Alocacao(
            _postoId,
            _contratoId,
            _empresaId,
            new TimeSpan(22, 0, 0), // 22h
            new TimeSpan(10, 0, 0), // 10h (próximo dia)
            tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
            permiteDobrarEscala: true
        );

        // Assert
        Assert.True(alocacao.TemHorarioNoturno);
    }

    [Fact(DisplayName = "Alocacao - Deve identificar horário diurno (6h às 18h)")]
    public void Alocacao_DeveIdentificarHorarioDiurno()
    {
        // Arrange & Act
        var alocacao = new Alocacao(
            _postoId,
            _contratoId,
            _empresaId,
            new TimeSpan(6, 0, 0),  // 6h
            new TimeSpan(18, 0, 0), // 18h
            tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
            permiteDobrarEscala: true
        );

        // Assert
        Assert.False(alocacao.TemHorarioNoturno);
    }

    [Fact(DisplayName = "Alocacao - Deve identificar horário noturno parcial (18h às 6h)")]
    public void Alocacao_DeveIdentificarHorarioNoturnoParcial()
    {
        // Arrange & Act
        var alocacao = new Alocacao(
            _postoId,
            _contratoId,
            _empresaId,
            new TimeSpan(18, 0, 0), // 18h
            new TimeSpan(6, 0, 0),  // 6h (próximo dia)
            tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
            permiteDobrarEscala: true
        );

        // Assert - Entre 18h e 6h há período noturno (22h às 5h)
        Assert.True(alocacao.TemHorarioNoturno);
    }

    [Fact(DisplayName = "Alocacao - Deve identificar horário noturno (0h às 12h)")]
    public void Alocacao_DeveIdentificarHorarioNoturno_MeiaNoite()
    {
        // Arrange & Act
        var alocacao = new Alocacao(
            _postoId,
            _contratoId,
            _empresaId,
            new TimeSpan(0, 0, 0),  // 0h (meia-noite)
            new TimeSpan(12, 0, 0), // 12h
            tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
            permiteDobrarEscala: true
        );

        // Assert - Entre 0h e 5h é período noturno
        Assert.True(alocacao.TemHorarioNoturno);
    }

    [Fact(DisplayName = "Alocacao - Deve identificar horário diurno (7h às 15h)")]
    public void Alocacao_DeveIdentificarHorarioDiurno_8h()
    {
        // Arrange & Act
        var alocacao = new Alocacao(
            _postoId,
            _contratoId,
            _empresaId,
            new TimeSpan(7, 0, 0),  // 7h
            new TimeSpan(15, 0, 0), // 15h (8 horas)
            tipoEscala: TipoEscala.OITO_HORAS_SEIS_POR_DOIS,
            permiteDobrarEscala: false
        );

        // Assert
        Assert.False(alocacao.TemHorarioNoturno);
    }

    [Fact(DisplayName = "Alocacao - Deve validar duração entre 4 e 12 horas")]
    public void Alocacao_DeveFalhar_QuandoDuracaoInvalida()
    {
        // Arrange & Act & Assert — 2 horas
        Assert.Throws<DomainException>(() => new Alocacao(
            _postoId, _contratoId, _empresaId,
            new TimeSpan(8, 0, 0), new TimeSpan(10, 0, 0),
            TipoEscala.DOZE_POR_TRINTA_SEIS, false
        ));
    }
}
