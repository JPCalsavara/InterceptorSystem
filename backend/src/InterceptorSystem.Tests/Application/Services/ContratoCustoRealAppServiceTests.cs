using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InterceptorSystem.Application.BoundedContexts.Operacoes.Services;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Entities;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Interfaces;
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
            var clienteId = Guid.NewGuid();
            var faturamentoSimulado = 20000m;

            var alocacoes = new List<Alocacao>
            {
                new Alocacao { Id = Guid.NewGuid(), QuantidadeFuncionarios = 2, Posto = new Posto { Contrato = new Contrato { ClienteId = clienteId } } },
                new Alocacao { Id = Guid.NewGuid(), QuantidadeFuncionarios = 3, Posto = new Posto { Contrato = new Contrato { ClienteId = clienteId } } }
            };
            var alocacaoIds = alocacoes.Select(a => a.Id).ToList();

            var diarias = new List<Diaria>
            {
                new Diaria { Valor = 150, AlocacaoId = alocacaoIds[0] },
                new Diaria { Valor = 150, AlocacaoId = alocacaoIds[0] },
                new Diaria { Valor = 160, AlocacaoId = alocacaoIds[1] }
            };

            var contrato = new Contrato { PercentualImpostos = 0.1m };

            _alocacaoRepositoryMock.Setup(r => r.GetAlocacoesByClienteIdAsync(clienteId)).ReturnsAsync(alocacoes);
            _diariaRepositoryMock.Setup(r => r.GetDiariasByAlocacoesIdsAsync(It.IsAny<List<Guid>>())).ReturnsAsync(diarias);
            _contratoRepositoryMock.Setup(r => r.GetByClienteId(clienteId)).ReturnsAsync(contrato);

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
