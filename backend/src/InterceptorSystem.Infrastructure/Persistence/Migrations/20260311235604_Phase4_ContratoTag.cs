using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase4_ContratoTag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ContratoTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ContratoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    ValorDiaria = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContratoTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContratoTags_Contratos_ContratoId",
                        column: x => x.ContratoId,
                        principalTable: "Contratos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ContratoTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FuncionarioTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FuncionarioId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FuncionarioTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FuncionarioTags_Funcionarios_FuncionarioId",
                        column: x => x.FuncionarioId,
                        principalTable: "Funcionarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FuncionarioTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContratoTags_ContratoId_TagId",
                table: "ContratoTags",
                columns: new[] { "ContratoId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContratoTags_EmpresaId",
                table: "ContratoTags",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_ContratoTags_TagId",
                table: "ContratoTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_FuncionarioTags_EmpresaId",
                table: "FuncionarioTags",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_FuncionarioTags_FuncionarioId_TagId",
                table: "FuncionarioTags",
                columns: new[] { "FuncionarioId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FuncionarioTags_TagId",
                table: "FuncionarioTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_EmpresaId_Nome",
                table: "Tags",
                columns: new[] { "EmpresaId", "Nome" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContratoTags");

            migrationBuilder.DropTable(
                name: "FuncionarioTags");

            migrationBuilder.DropTable(
                name: "Tags");
        }
    }
}
