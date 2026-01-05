using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixAlocacaoStatusAtivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Corrige registros de Alocações que têm status 'ATIVO' para 'CONFIRMADA'
            // pois 'ATIVO' não é um valor válido no enum StatusAlocacao
            migrationBuilder.Sql(@"
                UPDATE ""Alocacoes"" 
                SET ""StatusAlocacao"" = 'CONFIRMADA' 
                WHERE ""StatusAlocacao"" = 'ATIVO';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Não há necessidade de reverter esta correção de dados
            // pois 'ATIVO' não é um valor válido
        }
    }
}
