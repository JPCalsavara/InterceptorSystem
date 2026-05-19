using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class PostoAppService : IPostoAppService
{
    private readonly IPostoRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly ICurrentTenantService _tenantService;

    public PostoAppService(
        IPostoRepository repository,
        IClienteRepository clienteRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _tenantService = tenantService;
    }

    public async Task<PostoDto> CreateAsync(CreatePostoInput input, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var cliente = await _clienteRepository.GetByIdAsync(input.ClienteId, ct);
        if (cliente == null)
            throw new InvalidOperationException("Cliente não encontrado.");

        var posto = new Posto(
            input.ClienteId,
            input.ContratoId,
            input.Nome,
            input.Cep,
            input.Endereco,
            input.Numero,
            input.Complemento,
            input.Cidade,
            input.Estado
        );

        _repository.Add(posto);
        await _repository.UnitOfWork.CommitAsync(ct);

        return PostoDto.FromEntity(posto);
    }

    public async Task<PostoDto> UpdateAsync(Guid id, UpdatePostoInput input, CancellationToken ct = default)
    {
        var posto = await _repository.GetByIdAsync(id, ct);
        if (posto == null)
            throw new KeyNotFoundException("Posto de Trabalho não encontrado.");

        posto.AtualizarDetalhes(
            input.Nome,
            input.Cep,
            input.Endereco,
            input.Numero,
            input.Complemento,
            input.Cidade,
            input.Estado);

        _repository.Update(posto);
        await _repository.UnitOfWork.CommitAsync(ct);

        return PostoDto.FromEntity(posto);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var posto = await _repository.GetByIdAsync(id, ct);
        if (posto == null)
            throw new KeyNotFoundException("Posto de Trabalho não encontrado.");

        posto.Desativar();
        _repository.Update(posto);
        await _repository.UnitOfWork.CommitAsync(ct);
    }

    public async Task<PostoDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var posto = await _repository.GetByIdAsync(id, ct);
        return posto == null ? null : PostoDto.FromEntity(posto);
    }

    public async Task<IEnumerable<PostoDto>> GetAllAsync(CancellationToken ct = default)
    {
        var lista = await _repository.GetAllAsync(ct);
        return lista.Select(PostoDto.FromEntity);
    }

    public async Task<IEnumerable<PostoDto>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        var lista = await _repository.GetByClienteIdAsync(clienteId, ct);
        return lista.Select(PostoDto.FromEntity);
    }
}
