using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddConfiguracoesOperacionaisCondominio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "PermiteDobrarEscala",
                table: "PostosDeTrabalho",
                type: "boolean",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EmailGestor",
                table: "Condominios",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "HorarioTrocaTurno",
                table: "Condominios",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "QuantidadeFuncionariosIdeal",
                table: "Condominios",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TelefoneEmergencia",
                table: "Condominios",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailGestor",
                table: "Condominios");

            migrationBuilder.DropColumn(
                name: "HorarioTrocaTurno",
                table: "Condominios");

            migrationBuilder.DropColumn(
                name: "QuantidadeFuncionariosIdeal",
                table: "Condominios");

            migrationBuilder.DropColumn(
                name: "TelefoneEmergencia",
                table: "Condominios");

            migrationBuilder.AlterColumn<bool>(
                name: "PermiteDobrarEscala",
                table: "PostosDeTrabalho",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldDefaultValue: true);
        }
    }
}
