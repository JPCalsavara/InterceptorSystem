using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
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
        
        var condominio = new Condominio(
            empresaId: empresaId,
            nome: input.Nome,
            cnpj: input.Cnpj,
            endereco: input.Endereco,
            quantidadeFuncionariosIdeal: input.QuantidadeFuncionariosIdeal,
            horarioTrocaTurno: input.HorarioTrocaTurno,
            emailGestor: input.EmailGestor,
            telefoneEmergencia: input.TelefoneEmergencia);
        
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
        condominio.AtualizarConfiguracoesOperacionais(
            input.QuantidadeFuncionariosIdeal,
            input.HorarioTrocaTurno,
            input.EmailGestor,
            input.TelefoneEmergencia);
        
        _repository.Update(condominio);
        await  _repository.UnitOfWork.CommitAsync();
        
        return CondominioDtoOutput.FromEntity(condominio);
    }

    public async Task DeleteAsync(Guid id)
    {
        var condominio = await _repository.GetByIdAsync(id);
        if (condominio == null)
            throw new KeyNotFoundException("Condomínio não encontrado.");

        _repository.Remove(condominio);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<CondominioDtoOutput?> GetByIdAsync(Guid id)
    {
        var condominio = await _repository.GetByIdAsync(id);
        return CondominioDtoOutput.FromEntity(condominio);
    }

    public async Task<IEnumerable<CondominioDtoOutput>> GetAllAsync()
    {
        var lista = await _repository.GetAllAsync();
        return lista.Select(c => CondominioDtoOutput.FromEntity(c)!);    
    }
}
