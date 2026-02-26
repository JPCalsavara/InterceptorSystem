using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddContratoIdToPostoDeTrabalho : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ContratoId",
                table: "PostosDeTrabalho",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_PostosDeTrabalho_ContratoId",
                table: "PostosDeTrabalho",
                column: "ContratoId");

            migrationBuilder.AddForeignKey(
                name: "FK_PostosDeTrabalho_Contratos_ContratoId",
                table: "PostosDeTrabalho",
                column: "ContratoId",
                principalTable: "Contratos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostosDeTrabalho_Contratos_ContratoId",
                table: "PostosDeTrabalho");

            migrationBuilder.DropIndex(
                name: "IX_PostosDeTrabalho_ContratoId",
                table: "PostosDeTrabalho");

            migrationBuilder.DropColumn(
                name: "ContratoId",
                table: "PostosDeTrabalho");
        }
    }
}
