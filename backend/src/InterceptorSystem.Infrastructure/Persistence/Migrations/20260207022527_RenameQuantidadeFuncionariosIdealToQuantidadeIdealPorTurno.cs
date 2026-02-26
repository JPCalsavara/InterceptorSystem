using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameQuantidadeFuncionariosIdealToQuantidadeIdealPorTurno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuantidadeFuncionarios",
                table: "Contratos");

            migrationBuilder.RenameColumn(
                name: "QuantidadeFuncionariosIdeal",
                table: "Condominios",
                newName: "QuantidadeIdealPorTurno");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "QuantidadeIdealPorTurno",
                table: "Condominios",
                newName: "QuantidadeFuncionariosIdeal");

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeFuncionarios",
                table: "Contratos",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
