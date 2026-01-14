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
    private readonly IContratoRepository _contratoRepository; // FASE 2: Novo repositório
    private readonly ICurrentTenantService _tenantService;

    public FuncionarioAppService(
        IFuncionarioRepository repository,
        ICondominioRepository condominioRepository,
        IContratoRepository contratoRepository, // FASE 2: Injetar repositório de contrato
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _condominioRepository = condominioRepository;
        _contratoRepository = contratoRepository; // FASE 2: Atribuir repositório
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

        // FASE 2: Validar se o contrato existe e está vigente
        var contrato = await _contratoRepository.GetByIdAsync(input.ContratoId);
        if (contrato == null)
        {
            throw new KeyNotFoundException("Contrato não encontrado.");
        }

        if (contrato.CondominioId != input.CondominioId)
        {
            throw new InvalidOperationException("O contrato não pertence ao condomínio informado.");
        }

        var dataAtual = DateOnly.FromDateTime(DateTime.Now);
        if (contrato.Status != StatusContrato.PAGO && contrato.Status != StatusContrato.PENDENTE)
        {
            throw new InvalidOperationException($"Não é possível vincular funcionário a um contrato com status {contrato.Status}.");
        }

        if (dataAtual < contrato.DataInicio || dataAtual > contrato.DataFim)
        {
            throw new InvalidOperationException("O contrato não está vigente. Funcionários só podem ser vinculados a contratos vigentes.");
        }

        var cpfExistente = await _repository.GetByCpfAsync(input.Cpf);
        if (cpfExistente != null)
        {
            throw new InvalidOperationException("Já existe um funcionário cadastrado com este CPF.");
        }

        // FASE 3: Funcionário sem parâmetros de salário (calculados automaticamente)
        var funcionario = new Funcionario(
            empresaId,
            input.CondominioId,
            input.ContratoId,
            input.Nome,
            input.Cpf,
            input.Celular,
            input.StatusFuncionario,
            input.TipoEscala,
            input.TipoFuncionario);

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

        // FASE 3: Atualizar sem parâmetros de salário (calculados automaticamente)
        funcionario.AtualizarDados(
            input.Nome,
            input.Celular,
            input.StatusFuncionario,
            input.TipoEscala,
            input.TipoFuncionario);

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
