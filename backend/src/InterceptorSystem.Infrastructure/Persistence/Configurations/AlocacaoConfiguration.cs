using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class AlocacaoConfiguration : IEntityTypeConfiguration<Alocacao>
{
    public void Configure(EntityTypeBuilder<Alocacao> builder)
    {
        builder.ToTable("Alocacoes");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.EmpresaId).IsRequired();
        builder.Property(a => a.HorarioInicio).IsRequired();
        builder.Property(a => a.HorarioFim).IsRequired();
        builder.Property(a => a.TipoEscala).IsRequired().HasConversion<string>();
        builder.Property(a => a.PermiteDobrarEscala).IsRequired();

        builder.HasOne(a => a.Posto)
            .WithMany(p => p.Alocacoes)
            .HasForeignKey(a => a.PostoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Contrato)
            .WithMany(c => c.Alocacoes)
            .HasForeignKey(a => a.ContratoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
