using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class PostoTagConfiguration : IEntityTypeConfiguration<PostoTag>
{
    public void Configure(EntityTypeBuilder<PostoTag> builder)
    {
        builder.ToTable("PostoTags");
        builder.HasKey(pt => pt.Id);

        builder.Property(pt => pt.EmpresaId).IsRequired();
        builder.Property(pt => pt.PostoId).IsRequired();
        builder.Property(pt => pt.TagId).IsRequired();

        builder.HasOne(pt => pt.Posto)
            .WithMany(p => p.Tags)
            .HasForeignKey(pt => pt.PostoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pt => pt.Tag)
            .WithMany()
            .HasForeignKey(pt => pt.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(pt => new { pt.PostoId, pt.TagId }).IsUnique();
        builder.HasIndex(pt => pt.EmpresaId);
    }
}
