using System.Linq;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class FuncionarioAppService : IFuncionarioAppService
{
    private readonly IFuncionarioRepository _repository;
    private readonly ICondominioRepository _condominioRepository;
    private readonly ICurrentTenantService _tenantService;

    public FuncionarioAppService(
        IFuncionarioRepository repository,
        ICondominioRepository condominioRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _condominioRepository = condominioRepository;
        _tenantService = tenantService;
    }

    public async Task<FuncionarioDtoOutput> CreateAsync(CreateFuncionarioDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var condominio = await _condominioRepository.GetByIdAsync(input.CondominioId);
        if (condominio == null)
        {
            throw new KeyNotFoundException("Condomínio não encontrado para o funcionário.");
        }

        var cpfExistente = await _repository.GetByCpfAsync(input.Cpf);
        if (cpfExistente != null)
        {
            throw new InvalidOperationException("Já existe um funcionário cadastrado com este CPF.");
        }

        var funcionario = new Funcionario(
            empresaId,
            input.CondominioId,
            input.Nome,
            input.Cpf,
            input.Celular,
            input.StatusFuncionario,
            input.TipoEscala,
            input.TipoFuncionario,
            input.SalarioMensal,
            input.ValorTotalBeneficiosMensal,
            input.ValorDiariasFixas);

        _repository.Add(funcionario);
        await _repository.UnitOfWork.CommitAsync();

        return FuncionarioDtoOutput.FromEntity(funcionario)!;
    }

    public async Task<FuncionarioDtoOutput> UpdateAsync(Guid id, UpdateFuncionarioDtoInput input)
    {
        var funcionario = await _repository.GetByIdAsync(id);
        if (funcionario == null)
        {
            throw new KeyNotFoundException("Funcionário não encontrado.");
        }

        funcionario.AtualizarDados(
            input.Nome,
            input.Celular,
            input.StatusFuncionario,
            input.TipoEscala,
            input.TipoFuncionario,
            input.SalarioMensal,
            input.ValorTotalBeneficiosMensal,
            input.ValorDiariasFixas);

        _repository.Update(funcionario);
        await _repository.UnitOfWork.CommitAsync();

        return FuncionarioDtoOutput.FromEntity(funcionario)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var funcionario = await _repository.GetByIdAsync(id);
        if (funcionario == null)
        {
            throw new KeyNotFoundException("Funcionário não encontrado.");
        }

        _repository.Remove(funcionario);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<FuncionarioDtoOutput?> GetByIdAsync(Guid id)
    {
        var funcionario = await _repository.GetByIdAsync(id);
        return FuncionarioDtoOutput.FromEntity(funcionario!);
    }

    public async Task<IEnumerable<FuncionarioDtoOutput>> GetAllAsync()
    {
        var funcionarios = await _repository.GetAllAsync();
        return funcionarios.Select(f => FuncionarioDtoOutput.FromEntity(f)!);
    }

    public async Task<bool> CpfJaExisteAsync(string cpf)
    {
        var existente = await _repository.GetByCpfAsync(cpf);
        return existente != null;
    }

    public async Task<bool> CondominioExisteAsync(Guid condominioId)
    {
        var condominio = await _condominioRepository.GetByIdAsync(condominioId);
        return condominio != null;
    }
}
