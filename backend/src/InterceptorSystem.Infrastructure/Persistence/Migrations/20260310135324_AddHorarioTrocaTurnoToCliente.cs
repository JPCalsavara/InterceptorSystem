using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHorarioTrocaTurnoToCliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<Guid>(
                name: "ClienteId",
                table: "Funcionarios",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<decimal>(
                name: "ValorDiariaVigilante",
                table: "Contratos",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "HorarioTrocaTurno",
                table: "Clientes",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(6, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeIdealPorTurno",
                table: "Clientes",
                type: "integer",
                nullable: false,
                defaultValue: 2);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValorDiariaVigilante",
                table: "Contratos");

            migrationBuilder.DropColumn(
                name: "HorarioTrocaTurno",
                table: "Clientes");

            migrationBuilder.DropColumn(
                name: "QuantidadeIdealPorTurno",
                table: "Clientes");

            migrationBuilder.AddColumn<Guid>(
                name: "ContratoId",
                table: "Postos",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ClienteId",
                table: "Funcionarios",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Postos_ContratoId",
                table: "Postos",
                column: "ContratoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Postos_Contratos_ContratoId",
                table: "Postos",
                column: "ContratoId",
                principalTable: "Contratos",
                principalColumn: "Id");
        }
    }
}
