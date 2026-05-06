using System.Linq;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class ContratoAppService : IContratoAppService
{
    private readonly IContratoRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly ITagRepository _tagRepository;
    private readonly ICurrentTenantService _tenantService;
    private readonly IContratoCalculoService _calculoService;
    private readonly IDiariaAppService _diariaAppService;

    public ContratoAppService(
        IContratoRepository repository,
        IClienteRepository clienteRepository,
        ITagRepository tagRepository,
        ICurrentTenantService tenantService,
        IContratoCalculoService calculoService,
        IDiariaAppService diariaAppService)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _tagRepository = tagRepository;
        _tenantService = tenantService;
        _calculoService = calculoService;
        _diariaAppService = diariaAppService;
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
            input.PercentualAdicionalFimSemana,
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
            input.PercentualAdicionalFimSemana,
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

        var dtos = new List<ContratoDtoOutput>();
        foreach (var contrato in contratos)
        {
            var dto = ContratoDtoOutput.FromEntity(contrato);
            if (dto == null) continue;

            if (contrato.Status == StatusContrato.ATIVO)
            {
                var resumo = await _diariaAppService.GetResumoByContratoAsync(contrato.Id, hoje.Year, hoje.Month);
                
                var diariasTotais = resumo.TotalDiarias;
                // TODO: A lógica para diárias noturnas e de fds precisa ser reavaliada,
                // pois o DTO de resumo não fornece essa granularidade.
                var diariasNoturnas = 0; 
                var diariasFds = 0;

                var input = new CalculoValorTotalInput(
                    DiariasTotaisMes: diariasTotais,
                    DiariasNoturnasMes: diariasNoturnas,
                    DiariasFdsMes: diariasFds,
                    DiariasFeriadosMes: 0,
                    FuncionariosEstimados: (int)Math.Ceiling(diariasTotais / 15m),
                    ValorDiariaCobrada: contrato.ValorDiariaCobrada,
                    PercentualAdicionalNoturno: contrato.PercentualAdicionalNoturno,
                    PercentualAdicionalFimSemana: contrato.PercentualAdicionalFimSemana,
                    ValorBeneficiosExtrasMensal: contrato.ValorBeneficiosExtrasMensal,
                    PercentualEncargosProvisoes: contrato.PercentualEncargosProvisoes,
                    MargemLucroPercentual: contrato.MargemLucroPercentual,
                    MargemCoberturaFaltasPercentual: contrato.MargemCoberturaFaltasPercentual
                );

                var calculo = _calculoService.CalcularValorTotal(input);
                
                dto = dto with 
                { 
                    CustoRealMensal = calculo.CustoBaseMensal, 
                    LucroRealMensal = calculo.ValorTotalMensal - calculo.CustoBaseMensal 
                };
            }
            
            dtos.Add(dto);
        }

        return dtos;
    }

    public async Task<IEnumerable<ContratoDtoOutput>> GetByClienteIdAsync(Guid clienteId)
    {
        var contratos = await _repository.GetAtivosByClienteIdAsync(clienteId);
        return contratos
            .Select(ContratoDtoOutput.FromEntity)
            .Where(dto => dto != null)
            .Select(dto => dto!);
    }
}
