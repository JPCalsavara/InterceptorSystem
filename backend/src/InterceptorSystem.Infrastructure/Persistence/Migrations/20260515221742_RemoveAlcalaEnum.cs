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
            // Migração de Dados: ALCALA_8H (2) -> OITO_HORAS_SEIS_POR_DOIS (3)
            //                   FOLGUISTA (3) -> FOLGUISTA (2)
            
            // Alocacoes
            migrationBuilder.Sql("UPDATE \"Alocacoes\" SET \"TipoEscala\" = -1 WHERE \"TipoEscala\" = 3;");
            migrationBuilder.Sql("UPDATE \"Alocacoes\" SET \"TipoEscala\" = 3 WHERE \"TipoEscala\" = 2;");
            migrationBuilder.Sql("UPDATE \"Alocacoes\" SET \"TipoEscala\" = 2 WHERE \"TipoEscala\" = -1;");

            // Funcionarios
            migrationBuilder.Sql("UPDATE \"Funcionarios\" SET \"TipoEscala\" = -1 WHERE \"TipoEscala\" = 3;");
            migrationBuilder.Sql("UPDATE \"Funcionarios\" SET \"TipoEscala\" = 3 WHERE \"TipoEscala\" = 2;");
            migrationBuilder.Sql("UPDATE \"Funcionarios\" SET \"TipoEscala\" = 2 WHERE \"TipoEscala\" = -1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
