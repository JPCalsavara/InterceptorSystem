using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class FuncionarioTagConfiguration : IEntityTypeConfiguration<FuncionarioTag>
{
    public void Configure(EntityTypeBuilder<FuncionarioTag> builder)
    {
        builder.ToTable("FuncionarioTags");
        builder.HasKey(ft => ft.Id);

        builder.Property(ft => ft.EmpresaId).IsRequired();
        builder.Property(ft => ft.FuncionarioId).IsRequired();
        builder.Property(ft => ft.TagId).IsRequired();

        builder.HasOne(ft => ft.Funcionario)
            .WithMany(f => f.Tags)
            .HasForeignKey(ft => ft.FuncionarioId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ft => ft.Tag)
            .WithMany()
            .HasForeignKey(ft => ft.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(ft => new { ft.FuncionarioId, ft.TagId }).IsUnique();
        builder.HasIndex(ft => ft.EmpresaId);
    }
}
