using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPostoDeTrabalhoEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostosDeTrabalho_Condominios_CondominioId",
                table: "PostosDeTrabalho");

            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "PostosDeTrabalho");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "HorarioInicio",
                table: "PostosDeTrabalho",
                type: "time",
                nullable: false,
                oldClrType: typeof(TimeSpan),
                oldType: "interval");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "HorarioFim",
                table: "PostosDeTrabalho",
                type: "time",
                nullable: false,
                oldClrType: typeof(TimeSpan),
                oldType: "interval");

            migrationBuilder.CreateIndex(
                name: "IX_PostosDeTrabalho_EmpresaId",
                table: "PostosDeTrabalho",
                column: "EmpresaId");

            migrationBuilder.AddForeignKey(
                name: "FK_PostosDeTrabalho_Condominios_CondominioId",
                table: "PostosDeTrabalho",
                column: "CondominioId",
                principalTable: "Condominios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostosDeTrabalho_Condominios_CondominioId",
                table: "PostosDeTrabalho");

            migrationBuilder.DropIndex(
                name: "IX_PostosDeTrabalho_EmpresaId",
                table: "PostosDeTrabalho");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "HorarioInicio",
                table: "PostosDeTrabalho",
                type: "interval",
                nullable: false,
                oldClrType: typeof(TimeSpan),
                oldType: "time");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "HorarioFim",
                table: "PostosDeTrabalho",
                type: "interval",
                nullable: false,
                oldClrType: typeof(TimeSpan),
                oldType: "time");

            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "PostosDeTrabalho",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_PostosDeTrabalho_Condominios_CondominioId",
                table: "PostosDeTrabalho",
                column: "CondominioId",
                principalTable: "Condominios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
