using System.Linq;
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
    private readonly IClienteRepository _clienteRepository;
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentTenantService _tenantService;

    public ContratoAppService(
        IContratoRepository repository,
        IClienteRepository clienteRepository,
        ITagRepository tagRepository,
        ICurrentTenantService tenantService)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _tagRepository = tagRepository;
        _tenantService = tenantService;
    }

    public async Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var cliente = await _clienteRepository.GetByIdAsync(input.ClienteId)
            ?? throw new KeyNotFoundException("Cliente não encontrado para o contrato.");

        // Validar se já existe um contrato vigente para este cliente
        var existeContratoVigente = await _repository.ExisteContratoVigenteAsync(input.ClienteId);
        if (existeContratoVigente)
        {
            throw new InvalidOperationException("Já existe um contrato vigente para este cliente.");
        }

        var contrato = new Contrato(
            empresaId,
            input.ClienteId,
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualEncargosProvisoes,
            input.NumeroDePostos,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim,
            input.Status,
            input.ValorDiariaVigilante);

        if (input.Tags != null)
        {
            foreach (var tagInput in input.Tags)
            {
                var tag = await _tagRepository.GetByIdAsync(tagInput.TagId);
                if (tag == null)
                {
                    throw new KeyNotFoundException($"Tag não encontrada: {tagInput.TagId}.");
                }
            }

            var tags = input.Tags
                .DistinctBy(t => t.TagId)
                .Select(t => new ContratoTag(empresaId, contrato.Id, t.TagId, t.ValorDiaria))
                .ToList();
            contrato.DefinirTags(tags);
        }

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
            var existeContratoVigente = await _repository.ExisteContratoVigenteAsync(contrato.ClienteId, id);
            if (existeContratoVigente)
            {
                throw new InvalidOperationException("Já existe um contrato vigente para este cliente.");
            }
        }

        contrato.AtualizarDados(
            input.Descricao,
            input.ValorTotalMensal,
            input.ValorDiariaCobrada,
            input.PercentualAdicionalNoturno,
            input.ValorBeneficiosExtrasMensal,
            input.PercentualEncargosProvisoes,
            input.NumeroDePostos,
            input.MargemLucroPercentual,
            input.MargemCoberturaFaltasPercentual,
            input.DataInicio,
            input.DataFim,
            input.ValorDiariaVigilante);

        if (input.Tags != null)
        {
            var empresaIdForTags = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");
            foreach (var tagInput in input.Tags)
            {
                var tag = await _tagRepository.GetByIdAsync(tagInput.TagId);
                if (tag == null)
                {
                    throw new KeyNotFoundException($"Tag não encontrada: {tagInput.TagId}.");
                }
            }

            var tags = input.Tags
                .DistinctBy(t => t.TagId)
                .Select(t => new ContratoTag(empresaIdForTags, contrato.Id, t.TagId, t.ValorDiaria))
                .ToList();
            contrato.DefinirTags(tags);
        }

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

        contrato.PrepararExclusao();
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

        return contratos
            .Select(ContratoDtoOutput.FromEntity)
            .Where(dto => dto != null)
            .Select(dto => dto!);
    }

    public async Task<IEnumerable<ContratoDtoOutput>> GetByClienteIdAsync(Guid clienteId)
    {
        var contratos = await _repository.GetByClienteIdAsync(clienteId);
        return contratos
            .Select(ContratoDtoOutput.FromEntity)
            .Where(dto => dto != null)
            .Select(dto => dto!);
    }
}
