using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddValorToTag_RemovePostoTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "ALTER TABLE \"Tags\" ADD COLUMN IF NOT EXISTS \"Valor\" decimal(12,2) NOT NULL DEFAULT 0.0;");

            migrationBuilder.Sql("DROP TABLE IF EXISTS \"PostoTags\";");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PostoTags",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PostoId = table.Column<Guid>(type: "uuid", nullable: false),
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostoTags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PostoTags_Postos_PostoId",
                        column: x => x.PostoId,
                        principalTable: "Postos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostoTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PostoTags_EmpresaId",
                table: "PostoTags",
                column: "EmpresaId");

            migrationBuilder.CreateIndex(
                name: "IX_PostoTags_PostoId_TagId",
                table: "PostoTags",
                columns: new[] { "PostoId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PostoTags_TagId",
                table: "PostoTags",
                column: "TagId");

            migrationBuilder.DropColumn(
                name: "Valor",
                table: "Tags");
        }
    }
}
