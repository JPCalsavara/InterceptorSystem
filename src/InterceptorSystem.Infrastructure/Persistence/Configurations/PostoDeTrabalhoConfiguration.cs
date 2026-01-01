using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class PostoDeTrabalhoConfiguration : IEntityTypeConfiguration<PostoDeTrabalho>
{
    public void Configure(EntityTypeBuilder<PostoDeTrabalho> builder)
    {
        builder.ToTable("PostosDeTrabalho");

        builder.HasKey(p => p.Id);

        // Configuração de Propriedades
        builder.Property(p => p.HorarioInicio)
            .HasColumnType("time")
            .IsRequired();

        builder.Property(p => p.HorarioFim)
            .HasColumnType("time")
            .IsRequired();

        // Configuração do Multi-tenancy (EmpresaId é obrigatório)
        builder.Property(p => p.EmpresaId).IsRequired();

        // Foreign Key para Condomínio
        builder.Property(p => p.CondominioId).IsRequired();

        // Relacionamento 1:N com Condomínio
        builder.HasOne(p => p.Condominio)
            .WithMany(c => c.PostosDeTrabalho)
            .HasForeignKey(p => p.CondominioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices
        builder.HasIndex(p => p.EmpresaId);
        builder.HasIndex(p => p.CondominioId);
    }
}
