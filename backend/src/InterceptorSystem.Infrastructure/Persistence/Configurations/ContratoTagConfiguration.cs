using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class ContratoTagConfiguration : IEntityTypeConfiguration<ContratoTag>
{
    public void Configure(EntityTypeBuilder<ContratoTag> builder)
    {
        builder.ToTable("ContratoTags");
        builder.HasKey(ct => ct.Id);

        builder.Property(ct => ct.EmpresaId).IsRequired();
        builder.Property(ct => ct.ContratoId).IsRequired();
        builder.Property(ct => ct.TagId).IsRequired();
        builder.Property(ct => ct.ValorDiaria).HasColumnType("decimal(12,2)").IsRequired();

        builder.HasOne(ct => ct.Contrato)
            .WithMany(c => c.Tags)
            .HasForeignKey(ct => ct.ContratoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ct => ct.Tag)
            .WithMany()
            .HasForeignKey(ct => ct.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(ct => new { ct.ContratoId, ct.TagId }).IsUnique();
        builder.HasIndex(ct => ct.EmpresaId);
    }
}
