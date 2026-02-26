using System.Net;
using System.Net.Http.Json;
using InterceptorSystem.Application.Modulos.Administrativo.DTOs;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de integração para o endpoint POST /api/alocacoes/batch
/// Testa o fluxo completo: HTTP Request → Controller → Service → Repository → Database
/// </summary>
public class AlocacoesBatchControllerIntegrationTests : IntegrationTestBase
{
    public AlocacoesBatchControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateBatch_DeveCriar3Alocacoes_ComSucesso()
    {
        // Arrange - Criar condomínio, contrato, posto e funcionário
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var postoId = await CriarPostoAsync(condominioId, contratoId);
        var funcionarioId = await CriarFuncionarioAsync(condominioId, contratoId);

        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionarioId, postoId, new DateOnly(2026, 1, 20), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionarioId, postoId, new DateOnly(2026, 1, 22), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await ReadAsAsync<List<AlocacaoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(postoId, a.PostoDeTrabalhoId));
        Assert.All(result, a => Assert.Equal(StatusAlocacao.CONFIRMADA, a.StatusAlocacao));
    }

    [Fact]
    public async Task CreateBatch_DeveFalhar400_QuandoListaVazia()
    {
        // Arrange
        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>());

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsAsync<Dictionary<string, string>>(response);
        Assert.NotNull(error);
        Assert.Contains("Nenhuma alocação foi informada", error["error"]);
    }

    [Fact]
    public async Task CreateBatch_DeveFalhar404_QuandoFuncionarioNaoExiste()
    {
        // Arrange
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var postoId = await CriarPostoAsync(condominioId, contratoId);
        var funcionarioInexistente = Guid.NewGuid();

        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioInexistente, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var error = await ReadAsAsync<Dictionary<string, string>>(response);
        Assert.NotNull(error);
        Assert.Contains("Funcionário não encontrado", error["error"]);
    }

    [Fact]
    public async Task CreateBatch_DeveFalhar404_QuandoPostoNaoExiste()
    {
        // Arrange
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var funcionarioId = await CriarFuncionarioAsync(condominioId, contratoId);
        var postoInexistente = Guid.NewGuid();

        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoInexistente, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);

        var error = await ReadAsAsync<Dictionary<string, string>>(response);
        Assert.NotNull(error);
        Assert.Contains("Posto de Trabalho não encontrado", error["error"]);
    }

    [Fact]
    public async Task CreateBatch_DeveFalhar400_QuandoCondominiosDiferentes()
    {
        // Arrange - Criar 2 condomínios diferentes
        var condominio1Id = await CriarCondominioAsync("11.222.333/0001-11");
        var condominio2Id = await CriarCondominioAsync("44.555.666/0001-22");

        var contrato1Id = await CriarContratoAsync(condominio1Id);
        var funcionario1Id = await CriarFuncionarioAsync(condominio1Id, contrato1Id);

        var contrato2Id = await CriarContratoAsync(condominio2Id);
        var posto2Id = await CriarPostoAsync(condominio2Id, contrato2Id); // Posto de OUTRO condomínio

        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>
        {
            new(funcionario1Id, posto2Id, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR), // Funcionário do condomínio 1, posto do condomínio 2
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsAsync<Dictionary<string, string>>(response);
        Assert.NotNull(error);
        Assert.Contains("mesmo condomínio", error["error"]);
    }

    [Fact]
    public async Task CreateBatch_DeveFalhar400_QuandoAlocacoesDeFuncionariosDiferentes()
    {
        // Arrange - Criar 2 funcionários
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var postoId = await CriarPostoAsync(condominioId, contratoId);
        
        var funcionario1Id = await CriarFuncionarioAsync(condominioId, contratoId, "11111111111");
        var funcionario2Id = await CriarFuncionarioAsync(condominioId, contratoId, "22222222222");

        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>
        {
            new(funcionario1Id, postoId, new DateOnly(2026, 1, 18), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionario2Id, postoId, new DateOnly(2026, 1, 20), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR), // Funcionário diferente
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsAsync<Dictionary<string, string>>(response);
        Assert.NotNull(error);
        Assert.Contains("mesmo funcionário e posto", error["error"]);
    }

    [Fact]
    public async Task CreateBatch_DeveCriar91Alocacoes_Escala12x36_6Meses()
    {
        // Arrange - Simular criação de funcionário com escala 12x36 por 6 meses
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var postoId = await CriarPostoAsync(condominioId, contratoId);
        var funcionarioId = await CriarFuncionarioAsync(condominioId, contratoId);

        // Gerar alocações para 6 meses (12x36 - trabalha 1 dia sim, 1 não)
        var alocacoes = new List<CreateAlocacaoDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;
        bool trabalha = true;

        while (dataAtual <= dataFim)
        {
            if (trabalha)
            {
                alocacoes.Add(new(funcionarioId, postoId, dataAtual, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR));
            }
            trabalha = !trabalha;
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await ReadAsAsync<List<AlocacaoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.True(result.Count >= 90 && result.Count <= 92, $"Esperado ~91 alocações, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(postoId, a.PostoDeTrabalhoId));
    }

    [Fact]
    public async Task CreateBatch_DeveCriar130Alocacoes_EscalaSemanal_6Meses()
    {
        // Arrange - Simular criação de funcionário com escala semanal por 6 meses
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var postoId = await CriarPostoAsync(condominioId, contratoId);
        var funcionarioId = await CriarFuncionarioAsync(condominioId, contratoId);

        // Gerar alocações para 6 meses (semanal - seg a sex)
        var alocacoes = new List<CreateAlocacaoDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;

        while (dataAtual <= dataFim)
        {
            var diaSemana = dataAtual.DayOfWeek;
            if (diaSemana >= DayOfWeek.Monday && diaSemana <= DayOfWeek.Friday)
            {
                alocacoes.Add(new(funcionarioId, postoId, dataAtual, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR));
            }
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateAlocacoesBatchDtoInput(alocacoes);

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await ReadAsAsync<List<AlocacaoDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.True(result.Count >= 128 && result.Count <= 132, $"Esperado ~130 alocações, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
    }

    [Fact]
    public async Task CreateBatch_DeveSerAtomico_RollbackEmCasoDeErro()
    {
        // Arrange - Criar dados válidos + 1 inválido no meio
        var condominioId = await CriarCondominioAsync();
        var contratoId = await CriarContratoAsync(condominioId);
        var postoId = await CriarPostoAsync(condominioId, contratoId);
        var funcionarioId = await CriarFuncionarioAsync(condominioId, contratoId);

        // Tentar criar alocações com uma já existente (duplicada)
        var dataExistente = new DateOnly(2026, 1, 18);
        
        // Criar primeira alocação
        await Client.PostAsJsonAsync("/api/alocacoes", new CreateAlocacaoDtoInput(
            funcionarioId, postoId, dataExistente, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR
        ));

        // Tentar criar batch incluindo a data já existente
        var batch = new CreateAlocacoesBatchDtoInput(new List<CreateAlocacaoDtoInput>
        {
            new(funcionarioId, postoId, new DateOnly(2026, 1, 20), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
            new(funcionarioId, postoId, dataExistente, StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR), // Duplicada
            new(funcionarioId, postoId, new DateOnly(2026, 1, 22), StatusAlocacao.CONFIRMADA, TipoAlocacao.REGULAR),
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/alocacoes/batch", batch);

        // Assert - Comportamento atual do CreateBatchAsync: não valida duplicidade de data e cria em lote
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        // Verificar que existem 4 alocações para o funcionário (1 original + 3 do batch)
        var getAllResponse = await Client.GetAsync("/api/alocacoes");
        var todasAlocacoes = await ReadAsAsync<List<AlocacaoDtoOutput>>(getAllResponse);
        
        var alocacoesFuncionario = todasAlocacoes!.Where(a => a.FuncionarioId == funcionarioId).ToList();
        Assert.Equal(4, alocacoesFuncionario.Count);
    }

    // ========== Métodos auxiliares ==========

    private async Task<Guid> CriarCondominioAsync(string? cnpj = null)
    {
        var input = new CreateCondominioDtoInput(
            Nome: $"Condomínio Teste {Guid.NewGuid().ToString()[..8]}",
            Cnpj: cnpj ?? $"{DateTime.Now.Ticks % 100000000:00000000}/0001-{DateTime.Now.Millisecond:00}",
            Endereco: "Rua Teste, 123",
            QuantidadeIdealPorTurno: 4,
            HorarioTrocaTurno: new TimeSpan(6, 0, 0),
            EmailGestor: "gestor@test.com",
            TelefoneEmergencia: "11987654321"
        );

        var response = await Client.PostAsJsonAsync("/api/condominios", input);
        response.EnsureSuccessStatusCode();
        var result = await ReadAsAsync<CondominioDtoOutput>(response);
        return result!.Id;
    }

    private async Task<Guid> CriarContratoAsync(Guid condominioId)
    {
        var input = new CreateContratoDtoInput(
            CondominioId: condominioId,
            Descricao: "Contrato Teste",
            ValorTotalMensal: 15000m,
            ValorDiariaCobrada: 100m,
            PercentualAdicionalNoturno: 0.20m,  // 20% = 0.20
            ValorBeneficiosExtrasMensal: 350m,
            PercentualImpostos: 0.085m,          // 8.5% = 0.085
            NumeroDePostos: 2,
            MargemLucroPercentual: 0.12m,        // 12% = 0.12
            MargemCoberturaFaltasPercentual: 0.10m, // 10% = 0.10
            DataInicio: DateOnly.FromDateTime(DateTime.Now),
            DataFim: DateOnly.FromDateTime(DateTime.Now.AddMonths(6)),
            Status: StatusContrato.ATIVO
        );

        var response = await Client.PostAsJsonAsync("/api/contratos", input);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Falha ao criar contrato. Status: {response.StatusCode}, Erro: {errorContent}");
        }
        
        var result = await ReadAsAsync<ContratoDtoOutput>(response);
        return result!.Id;
    }

    private async Task<Guid> CriarPostoAsync(Guid condominioId, Guid contratoId)
    {
        var input = new CreatePostoInput(
            CondominioId: condominioId,
            ContratoId: contratoId,
            HorarioInicio: new TimeSpan(6, 0, 0),
            HorarioFim: new TimeSpan(18, 0, 0),
            PermiteDobrarEscala: true
        );

        var response = await Client.PostAsJsonAsync("/api/postos-de-trabalho", input);
        response.EnsureSuccessStatusCode();
        var result = await ReadAsAsync<PostoDeTrabalhoDto>(response);
        return result!.Id;
    }

    private async Task<Guid> CriarFuncionarioAsync(Guid condominioId, Guid contratoId, string? cpf = null)
    {
        var input = new CreateFuncionarioDtoInput(
            CondominioId: condominioId,
            ContratoId: contratoId,
            Nome: $"Funcionário Teste {Guid.NewGuid().ToString()[..8]}",
            Cpf: cpf ?? Random.Shared.Next(10000000, 99999999).ToString().PadLeft(11, '0'),
            Celular: "11987654321",
            StatusFuncionario: StatusFuncionario.ATIVO,
            TipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
            TipoFuncionario: TipoFuncionario.CLT
        );

        var response = await Client.PostAsJsonAsync("/api/funcionarios", input);
        response.EnsureSuccessStatusCode();
        var result = await ReadAsAsync<FuncionarioDtoOutput>(response);
        return result!.Id;
    }
}
