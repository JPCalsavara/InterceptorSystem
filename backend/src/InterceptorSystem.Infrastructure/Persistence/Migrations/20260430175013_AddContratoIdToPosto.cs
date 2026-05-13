using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddContratoIdToPosto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContratoId",
                table: "Postos",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Postos_ContratoId",
                table: "Postos",
                column: "ContratoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Postos_Contratos_ContratoId",
                table: "Postos",
                column: "ContratoId",
                principalTable: "Contratos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Postos_Contratos_ContratoId",
                table: "Postos");

            migrationBuilder.DropIndex(
                name: "IX_Postos_ContratoId",
                table: "Postos");

            migrationBuilder.DropColumn(
                name: "ContratoId",
                table: "Postos");
        }
    }
}
