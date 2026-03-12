using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tags");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.EmpresaId).IsRequired();
        builder.Property(t => t.Nome).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Descricao).HasMaxLength(500);

        builder.HasIndex(t => new { t.EmpresaId, t.Nome }).IsUnique();
    }
}
