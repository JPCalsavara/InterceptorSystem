using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTelefoneToConta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Telefone",
                table: "Contas",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TelefoneVerificado",
                table: "Contas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "SessoesWhatsapp",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Telefone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ContaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false),
                    CondominioIdSelecionado = table.Column<Guid>(type: "uuid", nullable: true),
                    PostoIdSelecionado = table.Column<Guid>(type: "uuid", nullable: true),
                    DataSelecionada = table.Column<DateOnly>(type: "date", nullable: true),
                    AlocacaoIdParaSubstituir = table.Column<Guid>(type: "uuid", nullable: true),
                    FuncionarioSubstitutoId = table.Column<Guid>(type: "uuid", nullable: true),
                    OpcoesCacheJson = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UltimaAtividade = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessoesWhatsapp", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Contas_Telefone",
                table: "Contas",
                column: "Telefone",
                unique: true,
                filter: "\"Telefone\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_SessoesWhatsapp_Telefone",
                table: "SessoesWhatsapp",
                column: "Telefone",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SessoesWhatsapp");

            migrationBuilder.DropIndex(
                name: "IX_Contas_Telefone",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "Telefone",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "TelefoneVerificado",
                table: "Contas");
        }
    }
}
