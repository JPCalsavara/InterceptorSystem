using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTagIdToDiaria_ExposeValorDiaria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TagId",
                table: "Diarias",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Diarias_TagId",
                table: "Diarias",
                column: "TagId");

            migrationBuilder.AddForeignKey(
                name: "FK_Diarias_Tags_TagId",
                table: "Diarias",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Diarias_Tags_TagId",
                table: "Diarias");

            migrationBuilder.DropIndex(
                name: "IX_Diarias_TagId",
                table: "Diarias");

            migrationBuilder.DropColumn(
                name: "TagId",
                table: "Diarias");
        }
    }
}
