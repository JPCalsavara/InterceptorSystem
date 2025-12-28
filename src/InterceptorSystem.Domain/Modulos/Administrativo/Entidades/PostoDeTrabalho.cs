using InterceptorSystem.Domain.Common;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Entidades;

public class PostoDeTrabalho : Entity
{
    public Guid CondominioId { get; private set; }
    public string Descricao { get; private set; }
    public TimeSpan HorarioInicio { get; private set; }
    public TimeSpan HorarioFim { get; private set; }
    
    protected PostoDeTrabalho() { }

    internal PostoDeTrabalho(Guid condominioId, Guid empresaId, string descricao, TimeSpan inicio,
        TimeSpan fim)
    {
        EmpresaId = empresaId;
        CondominioId = condominioId;
        Descricao = descricao;
        HorarioInicio = inicio;
        HorarioFim = fim;
    }
}