using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Enums;
using Moq;
using Xunit;

namespace InterceptorSystem.Tests.Application.Services
{
    public class ContratoCustoRealAppServiceTests
    {
        private readonly Mock<IAlocacaoRepository> _alocacaoRepositoryMock;
        private readonly Mock<IDiariaRepository> _diariaRepositoryMock;
        private readonly Mock<IContratoRepository> _contratoRepositoryMock;
        private readonly ContratoCustoRealAppService _sut;

        public ContratoCustoRealAppServiceTests()
        {
            _alocacaoRepositoryMock = new Mock<IAlocacaoRepository>();
            _diariaRepositoryMock = new Mock<IDiariaRepository>();
            _contratoRepositoryMock = new Mock<IContratoRepository>();
            _sut = new ContratoCustoRealAppService(
                _alocacaoRepositoryMock.Object,
                _diariaRepositoryMock.Object,
                _contratoRepositoryMock.Object
            );
        }

        [Fact]
        public async Task CalcularCustoRealAsync_ShouldReturnCorrectCalculations()
        {
            // Arrange
            var empresaId = Guid.NewGuid();
            var clienteId = Guid.NewGuid();
            var faturamentoSimulado = 20000m;

            var contrato = new Contrato(
                empresaId,
                clienteId,
                "Contrato Teste",
                20000m,
                150m,
                0.2m,
                1.0m,
                2500m,
                0.1m,
                2,
                0.15m,
                0.1m,
                DateOnly.FromDateTime(DateTime.Today),
                DateOnly.FromDateTime(DateTime.Today.AddMonths(1)),
                StatusContrato.ATIVO);

            var posto = new Posto(empresaId, clienteId, contrato.Id, "Posto Teste", "12345678", "Rua X", "123", null, "Cidade", "SP");
            
            var alocacao1 = new Alocacao(posto.Id, contrato.Id, empresaId, new TimeSpan(6, 0, 0), new TimeSpan(18, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, true, 2);
            var alocacao2 = new Alocacao(posto.Id, contrato.Id, empresaId, new TimeSpan(18, 0, 0), new TimeSpan(6, 0, 0), TipoEscala.DOZE_POR_TRINTA_SEIS, true, 3);
            
            var alocacoes = new List<Alocacao> { alocacao1, alocacao2 };
            var alocacaoIds = alocacoes.Select(a => a.Id).ToList();

            var diarias = new List<Diaria>
            {
                new Diaria(empresaId, Guid.NewGuid(), alocacaoIds[0], DateOnly.FromDateTime(DateTime.Today), 150, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
                new Diaria(empresaId, Guid.NewGuid(), alocacaoIds[0], DateOnly.FromDateTime(DateTime.Today), 150, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR),
                new Diaria(empresaId, Guid.NewGuid(), alocacaoIds[1], DateOnly.FromDateTime(DateTime.Today), 160, StatusDiaria.CONFIRMADA, TipoDiaria.REGULAR)
            };

            _alocacaoRepositoryMock.Setup(r => r.GetAlocacoesByClienteIdAsync(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(alocacoes);
            _diariaRepositoryMock.Setup(r => r.GetDiariasByAlocacoesIdsAsync(It.IsAny<List<Guid>>(), It.IsAny<CancellationToken>())).ReturnsAsync(diarias);
            _contratoRepositoryMock.Setup(r => r.GetByClienteId(clienteId, It.IsAny<CancellationToken>())).ReturnsAsync(contrato);

            // Act
            var result = await _sut.CalcularCustoRealAsync(clienteId, faturamentoSimulado);

            // Assert
            Assert.Equal(460, result.CustoTotalDiarias); // 150 + 150 + 160
            Assert.Equal(2500, result.CustoTotalBeneficios); // (2 + 3) * 500
            Assert.Equal(3256, result.CustoReal); // (460 + 2500) * (1 + 0.1)
            Assert.Equal(16744, result.LucroReal); // 20000 - 3256
            Assert.Equal(5, result.QuantidadeFuncionarios);
            Assert.Equal(3, result.QuantidadeDiarias);
        }
    }
}
