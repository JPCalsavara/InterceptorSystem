using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCnpjToCliente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cnpj",
                table: "Clientes",
                type: "character varying(14)",
                maxLength: 14,
                nullable: false,
                defaultValue: "");

            // Resolve duplicates created by legacy data before creating the unique index.
            // Keeps the first (EmpresaId, Cnpj) and rewrites subsequent duplicates.
            migrationBuilder.Sql(@"
                WITH duplicated AS (
                    SELECT
                        ""Id"",
                        ROW_NUMBER() OVER (
                            PARTITION BY ""EmpresaId"", ""Cnpj""
                            ORDER BY ""CreatedAt"", ""Id""
                        ) AS rn
                    FROM ""Clientes""
                )
                UPDATE ""Clientes"" c
                SET ""Cnpj"" = 'DUP' || SUBSTRING(MD5(c.""Id""::text) FROM 1 FOR 11)
                FROM duplicated d
                WHERE c.""Id"" = d.""Id""
                  AND d.rn > 1;
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Clientes_EmpresaId_Cnpj",
                table: "Clientes",
                columns: new[] { "EmpresaId", "Cnpj" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Clientes_EmpresaId_Cnpj",
                table: "Clientes");

            migrationBuilder.DropColumn(
                name: "Cnpj",
                table: "Clientes");
        }
    }
}
