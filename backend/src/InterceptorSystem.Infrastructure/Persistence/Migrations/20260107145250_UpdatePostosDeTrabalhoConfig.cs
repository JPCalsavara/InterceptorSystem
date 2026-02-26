using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePostosDeTrabalhoConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PermiteDobrarEscala",
                table: "PostosDeTrabalho",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeIdealFuncionarios",
                table: "PostosDeTrabalho",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PermiteDobrarEscala",
                table: "PostosDeTrabalho");

            migrationBuilder.DropColumn(
                name: "QuantidadeIdealFuncionarios",
                table: "PostosDeTrabalho");
        }
    }
}
