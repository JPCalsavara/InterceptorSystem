using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IContratoRepository : IRepository<Contrato>
{
    Task<bool> ExisteContratoVigenteAsync(Guid condominioId, Guid? contratoIdIgnorado = null);
}

