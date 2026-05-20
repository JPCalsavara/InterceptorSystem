using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAlcalaEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // O banco armazena TipoEscala como string (HasConversion<string>).
            // ALCALA_8H foi removido. Registros com esse valor viram OITO_HORAS_SEIS_POR_DOIS.
            // Não há reordenação de FOLGUISTA pois os valores são identificados pelo nome, não pelo inteiro.

            // Alocacoes: converter ALCALA_8H → OITO_HORAS_SEIS_POR_DOIS
            migrationBuilder.Sql("UPDATE \"Alocacoes\" SET \"TipoEscala\" = 'OITO_HORAS_SEIS_POR_DOIS' WHERE \"TipoEscala\" = 'ALCALA_8H';");

            // Funcionarios: converter ALCALA_8H → OITO_HORAS_SEIS_POR_DOIS
            migrationBuilder.Sql("UPDATE \"Funcionarios\" SET \"TipoEscala\" = 'OITO_HORAS_SEIS_POR_DOIS' WHERE \"TipoEscala\" = 'ALCALA_8H';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
