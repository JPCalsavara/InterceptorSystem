using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailVerification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailPendente",
                table: "Contas",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EmailVerificado",
                table: "Contas",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "TokensVerificacao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Usado = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DadosAdicionais = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TokensVerificacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TokensVerificacao_Contas_ContaId",
                        column: x => x.ContaId,
                        principalTable: "Contas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TokensVerificacao_ContaId_Tipo_Usado",
                table: "TokensVerificacao",
                columns: new[] { "ContaId", "Tipo", "Usado" });

            migrationBuilder.CreateIndex(
                name: "IX_TokensVerificacao_Token",
                table: "TokensVerificacao",
                column: "Token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TokensVerificacao");

            migrationBuilder.DropColumn(
                name: "EmailPendente",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "EmailVerificado",
                table: "Contas");
        }
    }
}
