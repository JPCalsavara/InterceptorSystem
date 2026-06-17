using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;

namespace InterceptorSystem.Infrastructure.Persistence.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var adminEmail = "teste@teste.com";
        var exists = await context.Contas.AnyAsync(c => c.Email.Valor == adminEmail);
        
        if (!exists)
        {
            var adminConta = new Conta(adminEmail, BCrypt.Net.BCrypt.HashPassword("1234"), "Interceptor Teste");
            adminConta.MarcarEmailComoVerificado();
            context.Contas.Add(adminConta);
            await context.SaveChangesAsync();

            // Injeta dados falsos apenas para o admin testar o front-end
            var clienteId = Guid.NewGuid();
            var contratoId = Guid.NewGuid();
            var postoId = Guid.NewGuid();
            var func1Id = Guid.NewGuid();
            var func2Id = Guid.NewGuid();
            var alocacaoId = Guid.NewGuid();

            try {
                await context.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO ""Clientes"" (""Id"", ""EmpresaId"", ""Nome"", ""Cnpj"", ""Cidade"", ""Estado"", ""Ativo"", ""QuantidadeIdealPorTurno"", ""HorarioTrocaTurno"")
                    VALUES ({clienteId}, {adminConta.Id}, 'Empresa Fictícia S/A', '71218423000187', 'São Paulo', 'SP', true, 2, '06:00:00');

                    INSERT INTO ""Contratos"" (""Id"", ""EmpresaId"", ""ClienteId"", ""Descricao"", ""ValorTotalMensal"", ""ValorDiariaCobrada"", ""PercentualAdicionalNoturno"", ""PercentualAdicionalFimSemana"", ""ValorBeneficiosExtrasMensal"", ""PercentualEncargosProvisoes"", ""NumeroDePostos"", ""MargemLucroPercentual"", ""MargemCoberturaFaltasPercentual"", ""DataInicio"", ""DataFim"", ""Status"")
                    VALUES ({contratoId}, {adminConta.Id}, {clienteId}, 'Contrato Base SP', 50000, 150, 0.20, 0.10, 500, 0.70, 2, 0.10, 0.05, '2023-01-01', '2028-01-01', 0);

                    INSERT INTO ""Postos"" (""Id"", ""ClienteId"", ""ContratoId"", ""Nome"", ""Cep"", ""Endereco"", ""Numero"", ""Cidade"", ""Estado"")
                    VALUES ({postoId}, {clienteId}, {contratoId}, 'Portaria Principal', '01000000', 'Av Paulista', '100', 'São Paulo', 'SP');

                    INSERT INTO ""Funcionarios"" (""Id"", ""EmpresaId"", ""ClienteId"", ""ContratoId"", ""Nome"", ""Cpf"", ""Celular"", ""StatusFuncionario"", ""TipoEscala"", ""TipoFuncionario"")
                    VALUES ({func1Id}, {adminConta.Id}, {clienteId}, {contratoId}, 'João Vigilante', '05807073010', '11999999999', 0, 0, 0);

                    INSERT INTO ""Funcionarios"" (""Id"", ""EmpresaId"", ""ClienteId"", ""ContratoId"", ""Nome"", ""Cpf"", ""Celular"", ""StatusFuncionario"", ""TipoEscala"", ""TipoFuncionario"")
                    VALUES ({func2Id}, {adminConta.Id}, {clienteId}, {contratoId}, 'Maria Folguista', '27318356066', '11988888888', 0, 2, 0);

                    INSERT INTO ""Alocacoes"" (""Id"", ""PostoId"", ""ContratoId"", ""EmpresaId"", ""HorarioInicio"", ""HorarioFim"", ""TipoEscala"", ""PermiteDobrarEscala"", ""QuantidadeFuncionarios"")
                    VALUES ({alocacaoId}, {postoId}, {contratoId}, {adminConta.Id}, '06:00:00', '18:00:00', 0, true, 1);

                    INSERT INTO ""Diarias"" (""Id"", ""EmpresaId"", ""FuncionarioId"", ""AlocacaoId"", ""Data"", ""ValorDiaria"", ""StatusDiaria"", ""TipoDiaria"")
                    VALUES ({Guid.NewGuid()}, {adminConta.Id}, {func1Id}, {alocacaoId}, CURRENT_DATE, 150, 0, 0);

                    INSERT INTO ""Diarias"" (""Id"", ""EmpresaId"", ""FuncionarioId"", ""AlocacaoId"", ""Data"", ""ValorDiaria"", ""StatusDiaria"", ""TipoDiaria"")
                    VALUES ({Guid.NewGuid()}, {adminConta.Id}, {func2Id}, {alocacaoId}, CURRENT_DATE - INTERVAL '1 day', 150, 0, 1);
                ");
            } catch (Exception e) {
                Console.WriteLine("Erro ao inserir dados mock: " + e.Message);
            }
        }
    }
}
