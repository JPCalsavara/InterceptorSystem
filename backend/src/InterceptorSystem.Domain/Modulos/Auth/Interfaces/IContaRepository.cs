using InterceptorSystem.Domain.Modulos.Auth.Entidades;

namespace InterceptorSystem.Domain.Modulos.Auth.Interfaces;

public interface IContaRepository
{
    Task<Conta?> GetByIdAsync(Guid id);
    Task<Conta?> GetByEmailAsync(string email);
    Task<Conta?> GetByTelefoneVerificadoAsync(string telefone);
    void Add(Conta conta);
    Task<bool> CommitAsync();
}
