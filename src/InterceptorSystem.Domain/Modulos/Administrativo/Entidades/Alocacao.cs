using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class Alocacao : Entity, IAggregateRoot
{
    public Guid FuncionarioId { get; private set; }
    public Guid PostoDeTrabalhoId { get; private set; }
    public DateOnly Data { get; private set; }
    public StatusAlocacao StatusAlocacao { get; private set; }
    public TipoAlocacao TipoAlocacao { get; private set; }

    public Funcionario? Funcionario { get; private set; }
    public PostoDeTrabalho? PostoDeTrabalho { get; private set; }

    protected Alocacao() { }

    public Alocacao(
        Guid empresaId,
        Guid funcionarioId,
        Guid postoDeTrabalhoId,
        DateOnly data,
        StatusAlocacao statusAlocacao,
        TipoAlocacao tipoAlocacao)
    {
        CheckRule(empresaId == Guid.Empty, "A alocação deve pertencer a uma empresa.");
        CheckRule(funcionarioId == Guid.Empty, "A alocação deve referenciar um funcionário.");
        CheckRule(postoDeTrabalhoId == Guid.Empty, "A alocação deve referenciar um posto de trabalho.");
        CheckRule(!Enum.IsDefined(statusAlocacao), "Status da alocação é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoAlocacao), "Tipo de alocação é obrigatório.");

        EmpresaId = empresaId;
        FuncionarioId = funcionarioId;
        PostoDeTrabalhoId = postoDeTrabalhoId;
        Data = data;
        StatusAlocacao = statusAlocacao;
        TipoAlocacao = tipoAlocacao;
    }

    public void AtualizarStatus(StatusAlocacao statusAlocacao, TipoAlocacao tipoAlocacao)
    {
        CheckRule(!Enum.IsDefined(statusAlocacao), "Status da alocação é obrigatório.");
        CheckRule(!Enum.IsDefined(tipoAlocacao), "Tipo de alocação é obrigatório.");

        StatusAlocacao = statusAlocacao;
        TipoAlocacao = tipoAlocacao;
    }
}
