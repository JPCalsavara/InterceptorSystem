using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

public interface IContratoRepository : IRepository<Contrato>
{
    Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId);
    Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null);
}

