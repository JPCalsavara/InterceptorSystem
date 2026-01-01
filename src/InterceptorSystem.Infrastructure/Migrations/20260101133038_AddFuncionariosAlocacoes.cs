using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFuncionariosAlocacoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Funcionarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CondominioId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Cpf = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    StatusFuncionario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TipoEscala = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TipoFuncionario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SalarioMensal = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ValorTotalBeneficiosMensal = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ValorDiariasFixas = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Funcionarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Funcionarios_Condominios_CondominioId",
                        column: x => x.CondominioId,
                        principalTable: "Condominios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Alocacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FuncionarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    PostoDeTrabalhoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    StatusAlocacao = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TipoAlocacao = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alocacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alocacoes_Funcionarios_FuncionarioId",
                        column: x => x.FuncionarioId,
                        principalTable: "Funcionarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Alocacoes_PostosDeTrabalho_PostoDeTrabalhoId",
                        column: x => x.PostoDeTrabalhoId,
                        principalTable: "PostosDeTrabalho",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alocacoes_EmpresaId",
                table: "Alocacoes",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_Alocacoes_FuncionarioId_Data",
                table: "Alocacoes",
                columns: new[] { "FuncionarioId", "Data" });

            migrationBuilder.CreateIndex(
                name: "IX_Alocacoes_PostoDeTrabalhoId_Data",
                table: "Alocacoes",
                columns: new[] { "PostoDeTrabalhoId", "Data" });

            migrationBuilder.CreateIndex(
                name: "IX_Funcionarios_CondominioId",
                table: "Funcionarios",
                column: "CondominioId");

            migrationBuilder.CreateIndex(
                name: "IX_Funcionarios_Cpf",
                table: "Funcionarios",
                column: "Cpf",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Funcionarios_EmpresaId",
                table: "Funcionarios",
                column: "EmpresaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alocacoes");

            migrationBuilder.DropTable(
                name: "Funcionarios");
        }
    }
}
