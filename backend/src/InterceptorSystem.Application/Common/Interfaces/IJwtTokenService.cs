using InterceptorSystem.Domain.Modulos.Auth.Entidades;

namespace InterceptorSystem.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GerarToken(Conta conta);
}
