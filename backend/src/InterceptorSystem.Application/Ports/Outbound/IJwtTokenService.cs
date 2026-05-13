using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;

namespace InterceptorSystem.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GerarToken(Conta conta);
}
