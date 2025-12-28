using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class CondominioConfiguration : IEntityTypeConfiguration<Condominio>
{
    public void Configure(EntityTypeBuilder<Condominio> builder)
    {
        builder.ToTable("Condominios");

        builder.HasKey(c => c.Id);

        // Configuração de Propriedades
        builder.Property(c => c.Nome)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Cnpj)
            .IsRequired()
            .HasMaxLength(18); // Formato com pontuação
            
        // Índice único para CNPJ (Regra de banco)
        builder.HasIndex(c => c.Cnpj).IsUnique();

        // Configuração do Multi-tenancy (EmpresaId é obrigatório)
        builder.Property(c => c.EmpresaId).IsRequired();

        // Relacionamento 1:N com Postos (Comportamento de Agregado)
        builder.HasMany(c => c.Postos)
            .WithOne()
            .HasForeignKey(p => p.CondominioId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(c => c.Nome);
        builder.HasIndex(c => c.EmpresaId);
        builder.HasIndex(c => c.Cnpj);
    }
}