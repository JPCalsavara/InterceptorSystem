using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class CondominioAppService : ICondominioAppService
{
    private readonly ICondominioRepository _repository;
    private readonly ICurrentTenantService _tenantService;

    public CondominioAppService(
        ICondominioRepository repository, 
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _tenantService = tenantService;
    }


    public async Task<CondominioDtoOutput> CreateAsync(CreateCondominioDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var cnpjExist = await _repository.GetByCnpjAsync(input.Cnpj);
        if (cnpjExist != null)
        {
            throw new InvalidOperationException("Já existe um condomínio cadastrado com este CNPJ.");
        }
        
        var condominio = new Condominio(nome: input.Nome,
                                        cnpj: input.Cnpj,
                                        endereco: input.Endereco,
                                        empresaId: empresaId);
        _repository.Add(condominio);
        await _repository.UnitOfWork.CommitAsync();
        
        return CondominioDtoOutput.FromEntity(condominio);
    }

    public async Task<CondominioDtoOutput> UpdateAsync(Guid id, UpdateCondominioDtoInput input)
    {
        var condominio = await _repository.GetByIdAsync(id);
        if (condominio == null)
            throw new KeyNotFoundException("Condomínio não encontrado.");
        
        condominio.AtualizarDados(input.Nome, input.Endereco);
        
        _repository.Update(condominio);
        await  _repository.UnitOfWork.CommitAsync();
        
        return CondominioDtoOutput.FromEntity(condominio);
    }

    public async Task DeleteAsync(Guid id)
    {
        var condominio = await _repository.GetByIdAsync(id);
        if (condominio == null)
            throw new KeyNotFoundException("Condomínio não encontrado.");

        // Soft Delete (recomendado) ou Hard Delete? 
        // Vamos de Hard Delete por enquanto, mas o ideal seria condominio.Desativar()
        _repository.Remove(condominio);
        await _repository.UnitOfWork.CommitAsync();    }

    public async Task<CondominioDtoOutput?> GetByIdAsync(Guid id)
    {
        var condominio = await _repository.GetByIdAsync(id);
        return condominio == null ? null : CondominioDtoOutput.FromEntity(condominio);
    }

    public async Task<IEnumerable<CondominioDtoOutput>> GetAllAsync()
    {
        var lista = await _repository.GetAllAsync();
        return lista.Select(CondominioDtoOutput.FromEntity);    
    }
    
    public async Task<PostoDeTrabalhoDto> AddPostoAsync(Guid condominioId, CreatePostoInput input)
    {
        // 1. Carrega o Agregado Raiz
        var condominio = await _repository.GetByIdAsync(condominioId);
    
        if (condominio == null)
            throw new KeyNotFoundException("Condomínio não encontrado ou acesso negado.");

        // 2. Executa o comportamento de negócio (Regras estão na Entidade)
        condominio.AdicionarPosto(input.Descricao, input.HorarioInicio, input.HorarioFim);

        // 3. Persiste (O EF Core detecta que um filho foi adicionado à lista)
        _repository.Update(condominio);
        await _repository.UnitOfWork.CommitAsync();

        // 4. Retorna o DTO do posto recém-criado
        // Pegamos o último da lista, pois acabou de ser inserido
        var novoPosto = condominio.Postos.Last(); 
    
        return new PostoDeTrabalhoDto(
            novoPosto.Id, 
            novoPosto.Descricao, 
            $"{novoPosto.HorarioInicio:hh\\:mm} - {novoPosto.HorarioFim:hh\\:mm}"
        );
    }
}