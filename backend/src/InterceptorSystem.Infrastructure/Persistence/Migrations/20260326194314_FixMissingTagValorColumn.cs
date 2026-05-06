using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterceptorSystem.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixMissingTagValorColumn : Migration
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
            migrationBuilder.Sql("CREATE TABLE IF NOT EXISTS \"PostoTags\" (\"Id\" uuid NOT NULL, \"PostoId\" uuid NOT NULL, \"TagId\" uuid NOT NULL, \"EmpresaId\" uuid NOT NULL, \"CreatedAt\" timestamp with time zone NOT NULL, CONSTRAINT \"PK_PostoTags\" PRIMARY KEY (\"Id\"));");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_PostoTags_EmpresaId\" ON \"PostoTags\" (\"EmpresaId\");");
            migrationBuilder.Sql("CREATE UNIQUE INDEX IF NOT EXISTS \"IX_PostoTags_PostoId_TagId\" ON \"PostoTags\" (\"PostoId\", \"TagId\");");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS \"IX_PostoTags_TagId\" ON \"PostoTags\" (\"TagId\");");

            migrationBuilder.Sql("ALTER TABLE \"Tags\" DROP COLUMN IF EXISTS \"Valor\";");
        }
    }
}
