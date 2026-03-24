using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCepNumeroComplementoToPosto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cep",
                table: "Postos",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Complemento",
                table: "Postos",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Numero",
                table: "Postos",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cep",
                table: "Postos");

            migrationBuilder.DropColumn(
                name: "Complemento",
                table: "Postos");

            migrationBuilder.DropColumn(
                name: "Numero",
                table: "Postos");
        }
    }
}
