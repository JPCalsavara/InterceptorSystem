using System.Net;
using System.Net.Http.Json;
using System.Text;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;

namespace InterceptorSystem.Tests.Integration.Administrativo;

/// <summary>
/// Testes de integração para o endpoint POST /api/diarias/batch
/// Testa o fluxo completo: HTTP Request → Controller → Service → Repository → Database.
/// Diária agora referencia AlocacaoId (não PostoId).
/// </summary>
public class DiariasBatchControllerIntegrationTests : IntegrationTestBase
{
    public DiariasBatchControllerIntegrationTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact(DisplayName = "POST /api/diarias/batch - Deve criar 3 diárias com sucesso")]
    public async Task CreateBatch_DeveCriar3Diarias_ComSucesso()
    {
        // Arrange - Criar dados completos: cliente → contrato → posto → alocação → funcionário
        var (_, _, alocacaoId, funcionarioId) = await CriarDadosCompletosAsync();

        var batch = new CreateDiariasBatchDtoInput(new List<CreateDiariaDtoInput>
        {
            new(funcionarioId, alocacaoId, new DateOnly(2026, 1, 18), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
            new(funcionarioId, alocacaoId, new DateOnly(2026, 1, 20), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
            new(funcionarioId, alocacaoId, new DateOnly(2026, 1, 22), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
        });

        // Act
        var response = await Client.PostAsJsonAsync("/api/diarias/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await ReadAsAsync<List<DiariaDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.Equal(3, result.Count);
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(alocacaoId, a.AlocacaoId));
        Assert.All(result, a => Assert.Equal(StatusDiaria.CONFIRMADA, a.StatusDiaria));
    }

    [Fact(DisplayName = "POST /api/diarias/batch - Deve retornar 400 quando lista vazia")]
    public async Task CreateBatch_DeveFalhar400_QuandoListaVazia()
    {
        // Arrange
        var batch = new CreateDiariasBatchDtoInput(new List<CreateDiariaDtoInput>());

        // Act
        var response = await Client.PostAsJsonAsync("/api/diarias/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var error = await ReadAsAsync<Dictionary<string, string>>(response);
        Assert.NotNull(error);
        Assert.Contains("Nenhuma diária foi informada", error["error"]);
    }

    [Fact(DisplayName = "POST /api/diarias/batch - Deve retornar 400 quando lista é nula")]
    public async Task CreateBatch_DeveFalhar400_QuandoListaNula()
    {
        var content = new StringContent("{}", Encoding.UTF8, "application/json");

        var response = await Client.PostAsync("/api/diarias/batch", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errorContent = await response.Content.ReadAsStringAsync();
        Assert.Contains("errors", errorContent, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("Diarias", errorContent, StringComparison.OrdinalIgnoreCase);
    }

    [Fact(DisplayName = "POST /api/diarias/batch - Deve retornar 404 quando item possui funcionário inválido")]
    public async Task CreateBatch_DeveFalhar404_QuandoItemComFuncionarioInvalido()
    {
        var (_, _, alocacaoId, _) = await CriarDadosCompletosAsync();
        var batch = new CreateDiariasBatchDtoInput(new List<CreateDiariaDtoInput>
        {
            new(Guid.Empty, alocacaoId, new DateOnly(2026, 1, 18), StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
        });

        var response = await Client.PostAsJsonAsync("/api/diarias/batch", batch);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact(DisplayName = "POST /api/diarias/batch - Deve criar ~91 diárias para escala 12x36 em 6 meses")]
    public async Task CreateBatch_DeveCriar91Diarias_Escala12x36_6Meses()
    {
        // Arrange
        var (_, _, alocacaoId, funcionarioId) = await CriarDadosCompletosAsync();

        // Gerar diárias para 6 meses (12x36 - trabalha 1 dia sim, 1 não)
        var diarias = new List<CreateDiariaDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;
        bool trabalha = true;

        while (dataAtual <= dataFim)
        {
            if (trabalha)
            {
                diarias.Add(new(funcionarioId, alocacaoId, dataAtual, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR));
            }
            trabalha = !trabalha;
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateDiariasBatchDtoInput(diarias);

        // Act
        var response = await Client.PostAsJsonAsync("/api/diarias/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await ReadAsAsync<List<DiariaDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.True(result.Count >= 90 && result.Count <= 92, $"Esperado ~91 diárias, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
        Assert.All(result, a => Assert.Equal(alocacaoId, a.AlocacaoId));
    }

    [Fact(DisplayName = "POST /api/diarias/batch - Deve criar ~130 diárias para escala semanal em 6 meses")]
    public async Task CreateBatch_DeveCriar130Diarias_EscalaSemanal_6Meses()
    {
        // Arrange
        var (_, _, alocacaoId, funcionarioId) = await CriarDadosCompletosAsync();

        // Gerar diárias para 6 meses (semanal - seg a sex)
        var diarias = new List<CreateDiariaDtoInput>();
        var dataInicio = new DateOnly(2026, 1, 18);
        var dataFim = new DateOnly(2026, 7, 18); // 6 meses
        var dataAtual = dataInicio;

        while (dataAtual <= dataFim)
        {
            var diaSemana = dataAtual.DayOfWeek;
            if (diaSemana >= DayOfWeek.Monday && diaSemana <= DayOfWeek.Friday)
            {
                diarias.Add(new(funcionarioId, alocacaoId, dataAtual, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR));
            }
            dataAtual = dataAtual.AddDays(1);
        }

        var batch = new CreateDiariasBatchDtoInput(diarias);

        // Act
        var response = await Client.PostAsJsonAsync("/api/diarias/batch", batch);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await ReadAsAsync<List<DiariaDtoOutput>>(response);
        Assert.NotNull(result);
        Assert.True(result.Count >= 128 && result.Count <= 132, $"Esperado ~130 diárias, recebido {result.Count}");
        Assert.All(result, a => Assert.Equal(funcionarioId, a.FuncionarioId));
    }

    // Note: CreateBatchAsync does not validate per-item date duplicates.
    // It's designed for bulk schedule generation. Duplicate validation 
    // only exists in the single CreateAsync path.

    // ========== Métodos auxiliares ==========

    private async Task<(Guid clienteId, Guid contratoId, Guid alocacaoId, Guid funcionarioId)> CriarDadosCompletosAsync(string? cpf = null)
    {
        var clienteId = await CriarClienteAsync();
        var contratoId = await CriarContratoAsync(clienteId);
        var postoId = await CriarPostoAsync(clienteId);
        var alocacaoId = await CriarAlocacaoAsync(postoId, contratoId);
        var funcionarioId = await CriarFuncionarioAsync(clienteId, contratoId, cpf);
        return (clienteId, contratoId, alocacaoId, funcionarioId);
    }

    private async Task<Guid> CriarClienteAsync()
    {
        var input = new CreateClienteDtoInput(
            Nome: $"Cliente Teste {Guid.NewGuid().ToString()[..8]}",
            Cnpj: "11222333000181",
            Cidade: "São Paulo",
            Estado: "SP",
            EmailGestor: "gestor@test.com",
            TelefoneEmergencia: "11987654321"
        );

        var response = await Client.PostAsJsonAsync("/api/clientes", input);
        response.EnsureSuccessStatusCode();
        var result = await ReadAsAsync<ClienteDtoOutput>(response);
        return result!.Id;
    }

    private async Task<Guid> CriarContratoAsync(Guid clienteId)
    {
        var input = new CreateContratoDtoInput(
            ClienteId: clienteId,
            Descricao: "Contrato Teste",
            ValorTotalMensal: 15000m,
            ValorDiariaCobrada: 100m,
            PercentualAdicionalNoturno: 0.20m,
            PercentualAdicionalFimSemana: 1.0m,
            ValorBeneficiosExtrasMensal: 350m,
            PercentualEncargosProvisoes: 0.085m,
            NumeroDePostos: 2,
            MargemLucroPercentual: 0.12m,
            MargemCoberturaFaltasPercentual: 0.10m,
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

    private async Task<Guid> CriarPostoAsync(Guid clienteId)
    {
        var input = new CreatePostoInput(
            ClienteId: clienteId,
            Nome: $"Posto Teste {Guid.NewGuid().ToString()[..8]}",
            Cep: "01310-100",
            Endereco: "Rua Teste",
            Numero: "123",
            Complemento: null,
            Cidade: "São Paulo",
            Estado: "SP"
        );

        var response = await Client.PostAsJsonAsync("/api/postos", input);
        response.EnsureSuccessStatusCode();
        var result = await ReadAsAsync<PostoDto>(response);
        return result!.Id;
    }

    private async Task<Guid> CriarAlocacaoAsync(Guid postoId, Guid contratoId)
    {
        var input = new CreateAlocacaoInput
        {
            PostoId = postoId,
            ContratoId = contratoId,
            HorarioInicio = new TimeSpan(6, 0, 0),
            HorarioFim = new TimeSpan(18, 0, 0),
            TipoEscala = TipoEscala.DOZE_POR_TRINTA_SEIS,
            PermiteDobrarEscala = true
        };

        var response = await Client.PostAsJsonAsync("/api/alocacao", input);
        response.EnsureSuccessStatusCode();
        var result = await ReadAsAsync<AlocacaoDto>(response);
        return result!.Id;
    }

    private async Task<Guid> CriarFuncionarioAsync(Guid clienteId, Guid contratoId, string? cpf = null)
    {
        var input = new CreateFuncionarioDtoInput(
            ClienteId: clienteId,
            ContratoId: contratoId,
            Nome: $"Funcionário Teste {Guid.NewGuid().ToString()[..8]}",
            Cpf: cpf ?? GerarCpfValido(),
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

    private static string GerarCpfValido()
    {
        var baseDigits = $"{DateTime.UtcNow.Ticks % 1000000000:000000000}";
        var d1 = CalcularDigitoCpf(baseDigits, new[] { 10, 9, 8, 7, 6, 5, 4, 3, 2 });
        var d2 = CalcularDigitoCpf(baseDigits + d1, new[] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 });
        return baseDigits + d1 + d2;
    }

    private static int CalcularDigitoCpf(string input, IReadOnlyList<int> pesos)
    {
        var soma = 0;
        for (var i = 0; i < input.Length; i++)
        {
            soma += (input[i] - '0') * pesos[i];
        }

        var resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
