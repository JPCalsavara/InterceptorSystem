using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateContratoFinancials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ValorTotal",
                table: "Contratos",
                newName: "ValorTotalMensal");

            migrationBuilder.AddColumn<decimal>(
                name: "MargemCoberturaFaltasPercentual",
                table: "Contratos",
                type: "numeric(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MargemLucroPercentual",
                table: "Contratos",
                type: "numeric(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentualAdicionalNoturno",
                table: "Contratos",
                type: "numeric(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PercentualImpostos",
                table: "Contratos",
                type: "numeric(5,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeFuncionarios",
                table: "Contratos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorBeneficiosExtrasMensal",
                table: "Contratos",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MargemCoberturaFaltasPercentual",
                table: "Contratos");

            migrationBuilder.DropColumn(
                name: "MargemLucroPercentual",
                table: "Contratos");

            migrationBuilder.DropColumn(
                name: "PercentualAdicionalNoturno",
                table: "Contratos");

            migrationBuilder.DropColumn(
                name: "PercentualImpostos",
                table: "Contratos");

            migrationBuilder.DropColumn(
                name: "QuantidadeFuncionarios",
                table: "Contratos");

            migrationBuilder.DropColumn(
                name: "ValorBeneficiosExtrasMensal",
                table: "Contratos");

            migrationBuilder.RenameColumn(
                name: "ValorTotalMensal",
                table: "Contratos",
                newName: "ValorTotal");
        }
    }
}
