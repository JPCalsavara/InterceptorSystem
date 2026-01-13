using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Application.Modulos.Administrativo.Interfaces;

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

    public CondominioOrquestradorService(
        ICondominioAppService condominioService,
        IContratoAppService contratoService,
        IPostoDeTrabalhoAppService postoService,
        ICurrentTenantService tenantService)
    {
        _condominioService = condominioService;
        _contratoService = contratoService;
        _postoService = postoService;
        _tenantService = tenantService;
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
                QuantidadeFuncionarios: input.Contrato.QuantidadeFuncionarios,
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
                    condominio.HorarioTrocaTurno, 
                    input.NumeroDePostos));
            }

            return new CondominioCompletoDtoOutput(
                Condominio: condominio,
                Contrato: contrato,
                Postos: postos
            );
        }
        catch (Exception ex)
        {
            // Em caso de erro, poderia implementar rollback manual ou usar TransactionScope
            throw new InvalidOperationException(
                $"Erro ao criar condomínio completo: {ex.Message}", ex);
        }
    }

    public Task<(bool Valido, string? MensagemErro)> ValidarCriacaoCompletaAsync(CreateCondominioCompletoDtoInput input)
    {
        // Validação 1: Quantidade de funcionários do contrato deve bater com o ideal do condomínio
        if (input.Contrato.QuantidadeFuncionarios != input.Condominio.QuantidadeFuncionariosIdeal)
        {
            return Task.FromResult<(bool, string?)>((false, 
                $"Quantidade de funcionários do contrato ({input.Contrato.QuantidadeFuncionarios}) " +
                $"deve ser igual à quantidade ideal do condomínio ({input.Condominio.QuantidadeFuncionariosIdeal})."));
        }

        // Validação 2: Número de postos deve ser divisor da quantidade de funcionários
        if (input.CriarPostosAutomaticamente)
        {
            if (input.Condominio.QuantidadeFuncionariosIdeal % input.NumeroDePostos != 0)
            {
                return Task.FromResult<(bool, string?)>((false,
                    $"Quantidade de funcionários ({input.Condominio.QuantidadeFuncionariosIdeal}) " +
                    $"deve ser divisível pelo número de postos ({input.NumeroDePostos})."));
            }
        }

        // Validação 3: Data de início do contrato não pode ser no passado
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        if (input.Contrato.DataInicio < hoje)
        {
            return Task.FromResult<(bool, string?)>((false, "Data de início do contrato não pode ser no passado."));
        }

        // Validação 4: Data de fim deve ser posterior à data de início
        if (input.Contrato.DataFim <= input.Contrato.DataInicio)
        {
            return Task.FromResult<(bool, string?)>((false, "Data de fim do contrato deve ser posterior à data de início."));
        }

        // Validação 5: CNPJ não pode estar duplicado (verificar no service)
        // Essa validação já é feita no CondominioAppService

        return Task.FromResult<(bool, string?)>((true, null));
    }

    /// <summary>
    /// Cria postos de trabalho automaticamente baseado no horário de troca de turno
    /// </summary>
    private async Task<IEnumerable<PostoDeTrabalhoDto>> CriarPostosAutomaticamenteAsync(
        Guid condominioId, 
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

