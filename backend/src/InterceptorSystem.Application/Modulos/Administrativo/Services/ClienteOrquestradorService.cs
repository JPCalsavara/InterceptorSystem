using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

public class ClienteOrquestradorService : IClienteOrquestradorService
{
    private readonly IClienteAppService _clienteService;
    private readonly IContratoAppService _contratoService;
    private readonly ICurrentTenantService _tenantService;
    private readonly IClienteRepository _clienteRepository;

    public ClienteOrquestradorService(
        IClienteAppService clienteService,
        IContratoAppService contratoService,
        ICurrentTenantService tenantService,
        IClienteRepository clienteRepository)
    {
        _clienteService = clienteService;
        _contratoService = contratoService;
        _tenantService = tenantService;
        _clienteRepository = clienteRepository;
    }

    public async Task<ClienteCompletoDtoOutput> CriarClienteCompletoAsync(CreateClienteCompletoDtoInput input)
    {
        _ = _tenantService.EmpresaId ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        var (valido, mensagemErro) = await ValidarCriacaoCompletaAsync(input);
        if (!valido) throw new InvalidOperationException(mensagemErro);

        var unitOfWork = _clienteRepository.UnitOfWork;
        await unitOfWork.BeginTransactionAsync();
        
        try
        {
            var cliente = await _clienteService.CreateAsync(input.Cliente);

            var contratoInput = new CreateContratoDtoInput(
                cliente.Id,
                input.Contrato.Descricao,
                input.Contrato.ValorTotalMensal,
                input.Contrato.ValorDiariaCobrada,
                input.Contrato.PercentualAdicionalNoturno,
                input.Contrato.ValorBeneficiosExtrasMensal,
                input.Contrato.PercentualImpostos,
                input.NumeroDePostos,
                input.Contrato.MargemLucroPercentual,
                input.Contrato.MargemCoberturaFaltasPercentual,
                input.Contrato.DataInicio,
                input.Contrato.DataFim,
                input.Contrato.Status,
                null,
                input.Contrato.ValorDiariaVigilante
            );

            var contrato = await _contratoService.CreateAsync(contratoInput);

            await unitOfWork.CommitTransactionAsync();

            return new ClienteCompletoDtoOutput(
                cliente,
                contrato,
                new List<PostoDto>() // FASE 2B: Postos são físicos agora, não criamos turnos físicos automáticos no cliente
            );
        }
        catch (Exception ex)
        {
            await unitOfWork.RollbackTransactionAsync();
            throw new InvalidOperationException($"Erro ao criar cliente completo: {ex.Message}", ex);
        }
    }

    public Task<(bool Valido, string? MensagemErro)> ValidarCriacaoCompletaAsync(CreateClienteCompletoDtoInput input)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        if (input.Contrato.DataInicio < hoje)
            return Task.FromResult<(bool, string?)>((false, "Data de início do contrato não pode ser no passado."));

        if (input.Contrato.DataFim <= input.Contrato.DataInicio)
            return Task.FromResult<(bool, string?)>((false, "Data de fim do contrato deve ser posterior à data de início."));

        if (input.NumeroDePostos < 1)
            return Task.FromResult<(bool, string?)>((false, "O número de alocações (postos/turnos) deve ser maior que zero."));

        return Task.FromResult<(bool, string?)>((true, null));
    }
}
