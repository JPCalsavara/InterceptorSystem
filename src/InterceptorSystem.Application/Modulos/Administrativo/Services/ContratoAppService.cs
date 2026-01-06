using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class ContratoAppService : IContratoAppService
{
    private readonly IContratoRepository _repository;
    private readonly ICondominioRepository _condominioRepository;
    private readonly ICurrentTenantService _tenantService;

    public ContratoAppService(
        IContratoRepository repository,
        ICondominioRepository condominioRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _condominioRepository = condominioRepository;
        _tenantService = tenantService;
    }

    public async Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var condominio = await _condominioRepository.GetByIdAsync(input.CondominioId)
            ?? throw new KeyNotFoundException("Condomínio não encontrado para o contrato.");

        var contrato = new Contrato(
            empresaId,
            input.CondominioId,
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualImpostos,
            input.QuantidadeFuncionarios,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim,
            input.Status);

        _repository.Add(contrato);
        await _repository.UnitOfWork.CommitAsync();

        return ContratoDtoOutput.FromEntity(contrato)!;
    }

    public async Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input)
    {
        var contrato = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        contrato.AtualizarDados(
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualImpostos,
            input.QuantidadeFuncionarios,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim);

        contrato.AtualizarStatus(input.Status);

        _repository.Update(contrato);
        await _repository.UnitOfWork.CommitAsync();

        return ContratoDtoOutput.FromEntity(contrato)!;
    }

    public async Task DeleteAsync(Guid id)
    {
        var contrato = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        _repository.Remove(contrato);
        await _repository.UnitOfWork.CommitAsync();
    }

    public async Task<ContratoDtoOutput?> GetByIdAsync(Guid id)
    {
        var contrato = await _repository.GetByIdAsync(id);
        return ContratoDtoOutput.FromEntity(contrato!);
    }

    public async Task<IEnumerable<ContratoDtoOutput>> GetAllAsync()
    {
        var contratos = await _repository.GetAllAsync();
        return contratos.Select(ContratoDtoOutput.FromEntity)!;
    }
}
