using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("Clientes");

        builder.HasKey(c => c.Id);

        // Configuração de Propriedades
        builder.Property(c => c.Nome)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.Cnpj)
            .IsRequired()
            .HasMaxLength(14); // Exactly 14 for numbers only, but let's just make it 14

        builder.Property(c => c.Cidade)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Estado)
            .IsRequired()
            .HasMaxLength(2);

        // Configuração do Multi-tenancy (EmpresaId é obrigatório)
        builder.Property(c => c.EmpresaId).IsRequired();
        
        builder.Property(c => c.EmailGestor)
            .HasMaxLength(100);
        
        builder.Property(c => c.TelefoneEmergencia)
            .HasMaxLength(20);
        
        builder.Property(c => c.QuantidadeIdealPorTurno)
            .IsRequired()
            .HasDefaultValue(2);
        
        builder.Property(c => c.HorarioTrocaTurno)
            .IsRequired()
            .HasDefaultValue(new TimeOnly(6, 0));
        
        builder.HasIndex(c => c.Nome);
        builder.HasIndex(c => c.EmpresaId);
        
        // Cnpj Único por Empresa
        builder.HasIndex(c => new { c.EmpresaId, c.Cnpj }).IsUnique();
    }
}
