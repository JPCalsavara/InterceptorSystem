using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class DiariaConfiguration : IEntityTypeConfiguration<Diaria>
{
    public void Configure(EntityTypeBuilder<Diaria> builder)
    {
        builder.ToTable("Diarias");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.EmpresaId).IsRequired();
        builder.Property(d => d.Data).IsRequired();
        builder.Property(d => d.ValorDiaria).IsRequired();
        builder.Property(d => d.StatusDiaria).IsRequired().HasConversion<string>();
        builder.Property(d => d.TipoDiaria).IsRequired().HasConversion<string>();

        builder.HasOne(d => d.Alocacao)
            .WithMany(a => a.Diarias)
            .HasForeignKey(d => d.AlocacaoId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.Funcionario)
            .WithMany(f => f.Diarias)
            .HasForeignKey(d => d.FuncionarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
