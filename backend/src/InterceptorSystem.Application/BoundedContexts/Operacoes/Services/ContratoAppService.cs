using System.Linq;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Exceptions;

namespace InterceptorSystem.Application.BoundedContexts.Operacoes.Services;

public class ContratoAppService : IContratoAppService
{
    private readonly IContratoRepository _repository;
    private readonly IClienteRepository _clienteRepository;
    private readonly IContratoTagService _tagService;
    private readonly ICurrentTenantService _tenantService;
    private readonly IContratoCalculoService _calculoService;
    private readonly IDiariaAppService _diariaAppService;
    private readonly IFuncionarioRepository _funcionarioRepository;

    public ContratoAppService(
        IContratoRepository repository,
        IClienteRepository clienteRepository,
        IContratoTagService tagService,
        ICurrentTenantService tenantService,
        IContratoCalculoService calculoService,
        IDiariaAppService diariaAppService,
        IFuncionarioRepository funcionarioRepository)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _tagService = tagService;
        _tenantService = tenantService;
        _calculoService = calculoService;
        _diariaAppService = diariaAppService;
        _funcionarioRepository = funcionarioRepository;
    }

    public async Task<ContratoDtoOutput> CreateAsync(CreateContratoDtoInput input, CancellationToken ct = default)
    {
        var empresaId = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var cliente = await _clienteRepository.GetByIdAsync(input.ClienteId, ct)
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

        // Assign tags using the dedicated tag service
        if (input.Tags != null && input.Tags.Any())
        {
            var tagsInput = input.Tags.Select(t => (t.TagId, t.ValorDiaria)).ToList();
            await _tagService.AtribuirTagsAsync(contrato, tagsInput);
        }

        _repository.Add(contrato);
        await _repository.UnitOfWork.CommitAsync(ct);

        var saved = await _repository.GetByIdAsync(contrato.Id, ct)
            ?? throw new InvalidOperationException("Contrato não encontrado após persistência.");

        return ContratoDtoOutput.FromEntity(saved)!;
    }

    public async Task<ContratoDtoOutput> UpdateAsync(Guid id, UpdateContratoDtoInput input, CancellationToken ct = default)
    {
        var contrato = await _repository.GetByIdAsync(id, ct)
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

        // Update tags using the dedicated tag service
        if (input.Tags != null && input.Tags.Any())
        {
            var tagsInput = input.Tags.Select(t => (t.TagId, t.ValorDiaria)).ToList();
            await _tagService.AtribuirTagsAsync(contrato, tagsInput);
        }

        contrato.AtualizarStatus(input.Status);

        _repository.Update(contrato);
        await _repository.UnitOfWork.CommitAsync(ct);

        var saved = await _repository.GetByIdAsync(contrato.Id, ct)
            ?? throw new InvalidOperationException("Contrato não encontrado após atualização.");

        return ContratoDtoOutput.FromEntity(saved)!;
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var contrato = await _repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Contrato não encontrado.");

        // Valida explicitamente se há funcionários vinculados antes de tentar o DELETE
        // Evita que a FK violation do Postgres suba como erro genérico de banco
        var funcionariosVinculados = await _funcionarioRepository.GetByClienteAsync(contrato.ClienteId, ct);
        var temFuncionariosNoContrato = funcionariosVinculados.Any(f => f.ContratoId == id);
        if (temFuncionariosNoContrato)
        {
            throw new DomainException(
                "Não é possível excluir o contrato pois existem funcionários vinculados a ele. " +
                "Transfira ou remova os funcionários antes de excluir o contrato.",
                "CONTRATO_COM_FUNCIONARIOS");
        }

        contrato.PrepararExclusao();
        _repository.Remove(contrato);
        await _repository.UnitOfWork.CommitAsync(ct);
    }

    public async Task<ContratoDtoOutput?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var contrato = await _repository.GetByIdAsync(id, ct);
        return ContratoDtoOutput.FromEntity(contrato!);
    }

    public async Task<IEnumerable<ContratoDtoOutput>> GetAllAsync(CancellationToken ct = default)
    {
        var contratos = await _repository.GetAllAsync(ct);
        
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
            await _repository.UnitOfWork.CommitAsync(ct);
        }

        var dtos = new List<ContratoDtoOutput>();
        foreach (var contrato in contratos)
        {
            var dto = ContratoDtoOutput.FromEntity(contrato);
            if (dto == null) continue;

            if (contrato.Status == StatusContrato.ATIVO)
            {
                var resumo = await _diariaAppService.GetResumoByContratoAsync(contrato.Id, hoje.Year, hoje.Month, ct);
                
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

    public async Task<IEnumerable<ContratoDtoOutput>> GetByClienteIdAsync(Guid clienteId, CancellationToken ct = default)
    {
        var contratos = await _repository.GetAtivosByClienteIdAsync(clienteId, ct);
        return contratos
            .Select(ContratoDtoOutput.FromEntity)
            .Where(dto => dto != null)
            .Select(dto => dto!);
    }
}
