using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Fase3RemoverCamposSalarioFuncionario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SalarioMensal",
                table: "Funcionarios");

            migrationBuilder.DropColumn(
                name: "ValorDiariasFixas",
                table: "Funcionarios");

            migrationBuilder.DropColumn(
                name: "ValorTotalBeneficiosMensal",
                table: "Funcionarios");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "SalarioMensal",
                table: "Funcionarios",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorDiariasFixas",
                table: "Funcionarios",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ValorTotalBeneficiosMensal",
                table: "Funcionarios",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
