using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class PostoConfiguration : IEntityTypeConfiguration<Posto>
{
    public void Configure(EntityTypeBuilder<Posto> builder)
    {
        builder.ToTable("Postos");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Nome).IsRequired().HasMaxLength(150);

        builder.OwnsOne(p => p.Cep, cep =>
        {
            cep.Property(c => c.Valor).HasColumnName("Cep").IsRequired().HasMaxLength(8);
        });

        builder.Property(p => p.Endereco).IsRequired().HasMaxLength(250);
        builder.Property(p => p.Numero).IsRequired().HasMaxLength(20);
        builder.Property(p => p.Complemento).HasMaxLength(120);
        builder.Property(p => p.Cidade).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Estado).IsRequired().HasMaxLength(2);
        
        builder.Property(p => p.EmpresaId).IsRequired();
        
        builder.HasOne(p => p.Cliente)
            .WithMany(c => c.Postos)
            .HasForeignKey(p => p.ClienteId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Tags)
            .WithOne(pt => pt.Posto)
            .HasForeignKey(pt => pt.PostoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
