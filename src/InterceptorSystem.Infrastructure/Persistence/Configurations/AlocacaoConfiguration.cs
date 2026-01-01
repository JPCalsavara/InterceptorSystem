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

        builder.Property(a => a.Data).IsRequired();
        builder.Property(a => a.StatusAlocacao).IsRequired().HasMaxLength(50);
        builder.Property(a => a.TipoAlocacao).IsRequired().HasMaxLength(50);

        builder.Property(a => a.EmpresaId).IsRequired();
        builder.Property(a => a.FuncionarioId).IsRequired();
        builder.Property(a => a.PostoDeTrabalhoId).IsRequired();

        builder.HasOne(a => a.Funcionario)
            .WithMany(f => f.Alocacoes)
            .HasForeignKey(a => a.FuncionarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.PostoDeTrabalho)
            .WithMany(p => p.Alocacoes)
            .HasForeignKey(a => a.PostoDeTrabalhoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => a.EmpresaId);
        builder.HasIndex(a => new { a.FuncionarioId, a.Data });
        builder.HasIndex(a => new { a.PostoDeTrabalhoId, a.Data });
    }
}

