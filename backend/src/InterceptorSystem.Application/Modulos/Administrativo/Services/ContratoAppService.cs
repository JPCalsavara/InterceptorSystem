using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
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

        // Validar se já existe um contrato vigente para este condomínio
        var existeContratoVigente = await _repository.ExisteContratoVigenteAsync(input.CondominioId);
        if (existeContratoVigente)
        {
            throw new InvalidOperationException("Já existe um contrato vigente para este condomínio.");
        }

        var contrato = new Contrato(
            empresaId,
            input.CondominioId,
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualImpostos,
            input.NumeroDePostos,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim,
            input.Status);

        _repository.Add(contrato);
        await _repository.UnitOfWork.CommitAsync();

        var saved = await _repository.GetByIdAsync(contrato.Id)
            ?? throw new InvalidOperationException("Contrato não encontrado após persistência.");

        return ContratoDtoOutput.FromEntity(saved)!;
    }

    public async Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input)
    {
        var contrato = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        // Validar se não há contrato vigente quando alterando status para ATIVO ou PENDENTE
        if ((input.Status == StatusContrato.ATIVO || input.Status == StatusContrato.PENDENTE) && 
            contrato.Status == StatusContrato.FINALIZADO)
        {
            var existeContratoVigente = await _repository.ExisteContratoVigenteAsync(contrato.CondominioId, id);
            if (existeContratoVigente)
            {
                throw new InvalidOperationException("Já existe um contrato vigente para este condomínio.");
            }
        }

        contrato.AtualizarDados(
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualImpostos,
            input.NumeroDePostos,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim);

        contrato.AtualizarStatus(input.Status);

        _repository.Update(contrato);
        await _repository.UnitOfWork.CommitAsync();

        var saved = await _repository.GetByIdAsync(contrato.Id)
            ?? throw new InvalidOperationException("Contrato não encontrado após atualização.");

        return ContratoDtoOutput.FromEntity(saved)!;
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
        
        // BL-10: Auto-finalização de contratos vencidos
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var alterados = false;
        
        foreach (var contrato in contratos)
        {
            if (contrato.Status != StatusContrato.FINALIZADO && contrato.DataFim < hoje)
            {
                contrato.AtualizarStatus(StatusContrato.FINALIZADO);
                _repository.Update(contrato);
                alterados = true;
            }
        }
        
        if (alterados)
        {
            await _repository.UnitOfWork.CommitAsync();
        }
        
        return contratos.Select(ContratoDtoOutput.FromEntity)!;
    }
}
