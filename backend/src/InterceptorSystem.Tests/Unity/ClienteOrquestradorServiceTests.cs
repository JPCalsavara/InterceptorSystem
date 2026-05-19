using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.DTOs;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using Moq;

namespace InterceptorSystem.Tests.Unity;

public class ClienteOrquestradorServiceTests
{
	private readonly Mock<IClienteAppService> _clienteService = new();
	private readonly Mock<IContratoAppService> _contratoService = new();
	private readonly Mock<IPostoAppService> _postoService = new();
	private readonly Mock<IAlocacaoAppService> _alocacaoService = new();
	private readonly Mock<ICurrentTenantService> _tenantService = new();
	private readonly Mock<IClienteRepository> _clienteRepository = new();
	private readonly Mock<IUnitOfWork> _unitOfWork = new();

	private readonly ClienteOrquestradorService _sut;

	public ClienteOrquestradorServiceTests()
	{
		_clienteRepository.SetupGet(r => r.UnitOfWork).Returns(_unitOfWork.Object);
		_tenantService.SetupGet(t => t.EmpresaId).Returns(Guid.NewGuid());

		_sut = new ClienteOrquestradorService(_clienteService.Object, _contratoService.Object, _postoService.Object, _alocacaoService.Object, new Moq.Mock<InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces.IFuncionarioAppService>().Object, _tenantService.Object, _clienteRepository.Object);
	}

	[Fact]
	public async Task ValidarCriacaoCompletaAsync_ComPostoConfigInvalido_DeveRetornarErro()
	{
		var input = BuildValidInput() with
		{
			PostoConfigs = new List<CreatePostoConfigInput>
			{
				new("ESCALA_12X36", 0, 1, 0, 120m, 350m),
			},
		};

		var (valido, mensagemErro) = await _sut.ValidarCriacaoCompletaAsync(input);

		Assert.False(valido);
		Assert.Contains("QuantidadeAlocacoes", mensagemErro);
	}

	[Fact]
	public async Task CriarClienteCompletoAsync_ComPostoConfigs_DeveCriarPostosPelosTipos()
	{
		var input = BuildValidInput() with
		{
			NumeroDePostos = 2,
			PostoConfigs = new List<CreatePostoConfigInput>
			{
				new("ESCALA_12X36", 2, 1, 1, 120m, 350m),
				new("ESCALA_5X2", 1, 1, 0, 130m, 300m),
			},
		};

		SetupHappyPathServices();

		var postoId1 = Guid.NewGuid();
		var postoId2 = Guid.NewGuid();
		_postoService
			.SetupSequence(s => s.CreateAsync(It.IsAny<CreatePostoInput>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(new PostoDto(postoId1, _clienteId, "Posto 1 - ESCALA_12X36", "00000000", "End", "S/N", null, "Sao Paulo", "SP", true))
			.ReturnsAsync(new PostoDto(postoId2, _clienteId, "Posto 2 - ESCALA_5X2", "00000000", "End", "S/N", null, "Sao Paulo", "SP", true));

		_alocacaoService
			.Setup(s => s.CreateAsync(It.IsAny<CreateAlocacaoInput>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((CreateAlocacaoInput req, CancellationToken ct) => new AlocacaoDto
			{
				Id = Guid.NewGuid(),
				PostoId = req.PostoId,
				ContratoId = req.ContratoId,
				HorarioInicio = req.HorarioInicio,
				HorarioFim = req.HorarioFim,
				TipoEscala = req.TipoEscala,
				PermiteDobrarEscala = req.PermiteDobrarEscala
			});

		var output = await _sut.CriarClienteCompletoAsync(input);

		Assert.Equal(2, output.Postos.Count());
		_postoService.Verify(s => s.CreateAsync(It.Is<CreatePostoInput>(p => p.Nome.Contains("ESCALA_12X36")), It.IsAny<CancellationToken>()), Times.Once);
		_postoService.Verify(s => s.CreateAsync(It.Is<CreatePostoInput>(p => p.Nome.Contains("ESCALA_5X2")), It.IsAny<CancellationToken>()), Times.Once);
		_alocacaoService.Verify(s => s.CreateAsync(It.IsAny<CreateAlocacaoInput>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
		_alocacaoService.Verify(s => s.CreateAsync(It.Is<CreateAlocacaoInput>(a => a.TipoEscala == TipoEscala.DOZE_POR_TRINTA_SEIS), It.IsAny<CancellationToken>()), Times.AtLeastOnce);
		_alocacaoService.Verify(s => s.CreateAsync(It.Is<CreateAlocacaoInput>(a => a.TipoEscala == TipoEscala.SEMANAL_COMERCIAL), It.IsAny<CancellationToken>()), Times.Once);
		_unitOfWork.Verify(u => u.BeginTransactionAsync(), Times.Once);
		_unitOfWork.Verify(u => u.CommitTransactionAsync(), Times.Once);
	}

	[Fact]
	public async Task CriarClienteCompletoAsync_SemPostoConfigs_DeveUsarNumeroDePostosComoFallback()
	{
		var input = BuildValidInput() with
		{
			NumeroDePostos = 3,
			PostoConfigs = null,
		};

		SetupHappyPathServices();

		_postoService
			.Setup(s => s.CreateAsync(It.IsAny<CreatePostoInput>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(new PostoDto(Guid.NewGuid(), _clienteId, "Posto", "00000000", "End", "S/N", null, "Sao Paulo", "SP", true));

		_alocacaoService
			.Setup(s => s.CreateAsync(It.IsAny<CreateAlocacaoInput>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync((CreateAlocacaoInput req, CancellationToken ct) => new AlocacaoDto
			{
				Id = Guid.NewGuid(),
				PostoId = req.PostoId,
				ContratoId = req.ContratoId,
				HorarioInicio = req.HorarioInicio,
				HorarioFim = req.HorarioFim,
				TipoEscala = req.TipoEscala,
				PermiteDobrarEscala = req.PermiteDobrarEscala
			});

		var output = await _sut.CriarClienteCompletoAsync(input);

		Assert.Equal(3, output.Postos.Count());
		_postoService.Verify(s => s.CreateAsync(It.IsAny<CreatePostoInput>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
		_alocacaoService.Verify(s => s.CreateAsync(It.IsAny<CreateAlocacaoInput>(), It.IsAny<CancellationToken>()), Times.Exactly(3));
	}

	private readonly Guid _clienteId = Guid.NewGuid();

	private void SetupHappyPathServices()
	{
		_clienteService
			.Setup(s => s.CreateAsync(It.IsAny<CreateClienteDtoInput>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(new ClienteDtoOutput(_clienteId, "Cliente X", "12345678000199", "Sao Paulo", "SP", true, 2, "06:00:00", null, null));

		_contratoService
			.Setup(s => s.CreateAsync(It.IsAny<CreateContratoDtoInput>(), It.IsAny<CancellationToken>()))
			.ReturnsAsync(new ContratoDtoOutput(
				Guid.NewGuid(),
				_clienteId,
				"Contrato X",
				10000m,
				120m,
				0.2m,
				1.0m,
				350m,
				0.15m,
				4,
				2,
				0.2m,
				0.1m,
				DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
				DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
				StatusContrato.ATIVO,
				new List<ContratoTagDtoOutput>(),
				0m,
				0m,
				null));

	}

	private static CreateClienteCompletoDtoInput BuildValidInput()
	{
		return new CreateClienteCompletoDtoInput(
			Cliente: new CreateClienteDtoInput(
				Nome: "Cliente X",
				Cnpj: "12.345.678/0001-99",
				Cidade: "Sao Paulo",
				Estado: "SP",
				QuantidadeIdealPorTurno: 2,
				HorarioTrocaTurno: "06:00:00"),
			Contrato: new CreateContratoCompletoDtoInput(
				Descricao: "Contrato X",
				ValorTotalMensal: 10000m,
				ValorDiariaCobrada: 120m,
				PercentualAdicionalNoturno: 0.2m,
				PercentualAdicionalFimSemana: 1.0m,
				ValorBeneficiosExtrasMensal: 350m,
				PercentualEncargosProvisoes: 0.15m,
				MargemLucroPercentual: 0.2m,
				MargemCoberturaFaltasPercentual: 0.1m,
				DataInicio: DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
				DataFim: DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
				Status: StatusContrato.ATIVO),
			CriarPostosAutomaticamente: true,
			NumeroDePostos: 2);
	}
}
