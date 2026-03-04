using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;

namespace InterceptorSystem.Application.Modulos.Administrativo.Services;

/// <summary>
/// FASE 5: Serviço orquestrador para criação em cascata
/// Coordena a criação de Condomínio, Contrato e Postos de Trabalho em uma única transação
/// </summary>
public class CondominioOrquestradorService : ICondominioOrquestradorService
{
    private readonly ICondominioAppService _condominioService;
    private readonly IContratoAppService _contratoService;
    private readonly IPostoDeTrabalhoAppService _postoService;
    private readonly ICurrentTenantService _tenantService;
    private readonly ICondominioRepository _condominioRepository; // BL-9: Para acessar UnitOfWork

    public CondominioOrquestradorService(
        ICondominioAppService condominioService,
        IContratoAppService contratoService,
        IPostoDeTrabalhoAppService postoService,
        ICurrentTenantService tenantService,
        ICondominioRepository condominioRepository)
    {
        _condominioService = condominioService;
        _contratoService = contratoService;
        _postoService = postoService;
        _tenantService = tenantService;
        _condominioRepository = condominioRepository;
    }

    public async Task<CondominioCompletoDtoOutput> CriarCondominioCompletoAsync(CreateCondominioCompletoDtoInput input)
    {
        // Validar tenant
        _ = _tenantService.EmpresaId 
            ?? throw new InvalidOperationException("EmpresaId não encontrado no contexto do locatário.");

        // Validação prévia
        var (valido, mensagemErro) = await ValidarCriacaoCompletaAsync(input);
        if (!valido)
            throw new InvalidOperationException(mensagemErro);

        // BL-9: Transação explícita para garantir atomicidade
        var unitOfWork = _condominioRepository.UnitOfWork;
        await unitOfWork.BeginTransactionAsync();
        
        try
        {
            // 1. Criar Condomínio
            var condominio = await _condominioService.CreateAsync(input.Condominio);

            // 2. Criar Contrato vinculado ao condomínio
            var contratoInput = new CreateContratoDtoInput(
                CondominioId: condominio.Id,
                Descricao: input.Contrato.Descricao,
                ValorTotalMensal: input.Contrato.ValorTotalMensal,
                ValorDiariaCobrada: input.Contrato.ValorDiariaCobrada,
                PercentualAdicionalNoturno: input.Contrato.PercentualAdicionalNoturno,
                ValorBeneficiosExtrasMensal: input.Contrato.ValorBeneficiosExtrasMensal,
                PercentualImpostos: input.Contrato.PercentualImpostos,
                NumeroDePostos: input.NumeroDePostos,
                MargemLucroPercentual: input.Contrato.MargemLucroPercentual,
                MargemCoberturaFaltasPercentual: input.Contrato.MargemCoberturaFaltasPercentual,
                DataInicio: input.Contrato.DataInicio,
                DataFim: input.Contrato.DataFim,
                Status: input.Contrato.Status
            );

            var contrato = await _contratoService.CreateAsync(contratoInput);

            // 3. Criar Postos de Trabalho automaticamente (se solicitado)
            var postos = new List<PostoDeTrabalhoDto>();
            
            if (input.CriarPostosAutomaticamente)
            {
                postos.AddRange(await CriarPostosAutomaticamenteAsync(
                    condominio.Id,
                    contrato.Id,
                    condominio.HorarioTrocaTurno,
                    input.NumeroDePostos));
            }

            // Commit da transação — tudo ou nada
            await unitOfWork.CommitTransactionAsync();

            return new CondominioCompletoDtoOutput(
                Condominio: condominio,
                Contrato: contrato,
                Postos: postos
            );
        }
        catch (Exception ex)
        {
            // Rollback: desfaz Condomínio, Contrato e Postos parcialmente criados
            await unitOfWork.RollbackTransactionAsync();
            throw new InvalidOperationException(
                $"Erro ao criar condomínio completo: {ex.Message}", ex);
        }
    }

    public Task<(bool Valido, string? MensagemErro)> ValidarCriacaoCompletaAsync(CreateCondominioCompletoDtoInput input)
    {
        // Validação 1: Data de início do contrato não pode ser no passado
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        if (input.Contrato.DataInicio < hoje)
        {
            return Task.FromResult<(bool, string?)>((false, "Data de início do contrato não pode ser no passado."));
        }

        // Validação 2: Data de fim deve ser posterior à data de início
        if (input.Contrato.DataFim <= input.Contrato.DataInicio)
        {
            return Task.FromResult<(bool, string?)>((false, "Data de fim do contrato deve ser posterior à data de início."));
        }

        // Validação 3: Número de postos válido (2 a 4)
        if (input.NumeroDePostos < 2 || input.NumeroDePostos > 4)
        {
            return Task.FromResult<(bool, string?)>((false, "Número de postos deve estar entre 2 e 4 (ex: 2=12x36, 3=8h, 4=6h)."));
        }

        // Validação 4: CNPJ não pode estar duplicado (verificar no service)
        // Essa validação já é feita no CondominioAppService

        return Task.FromResult<(bool, string?)>((true, null));
    }

    /// <summary>
    /// Cria postos de trabalho automaticamente baseado no horário de troca de turno
    /// </summary>
    private async Task<IEnumerable<PostoDeTrabalhoDto>> CriarPostosAutomaticamenteAsync(
        Guid condominioId,
        Guid contratoId,
        string horarioTrocaTurno,
        int numeroDePostos)
    {
        var postos = new List<PostoDeTrabalhoDto>();

        // Parse do horário de troca de turno
        var horarioTroca = TimeSpan.Parse(horarioTrocaTurno);

        // Calcular intervalo entre postos (24 horas / número de postos)
        var intervaloHoras = 24.0 / numeroDePostos;

        for (int i = 0; i < numeroDePostos; i++)
        {
            var inicio = horarioTroca.Add(TimeSpan.FromHours(i * intervaloHoras));
            var fim = horarioTroca.Add(TimeSpan.FromHours((i + 1) * intervaloHoras));

            // Normalizar horários (evitar valores > 24h)
            if (inicio.TotalHours >= 24)
                inicio = inicio.Subtract(TimeSpan.FromHours(24));
            if (fim.TotalHours >= 24)
                fim = fim.Subtract(TimeSpan.FromHours(24));

            var postoInput = new CreatePostoInput(
                CondominioId: condominioId,
                ContratoId: contratoId,
                HorarioInicio: inicio,
                HorarioFim: fim,
                PermiteDobrarEscala: true
            );

            var posto = await _postoService.CreateAsync(postoInput);
            postos.Add(posto);
        }

        return postos;
    }
}

