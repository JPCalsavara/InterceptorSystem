using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class ContaConfiguration : IEntityTypeConfiguration<Conta>
{
    public void Configure(EntityTypeBuilder<Conta> builder)
    {
        builder.ToTable("Contas");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(c => c.Email).IsUnique();

        builder.Property(c => c.SenhaHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(c => c.NomeEmpresa)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Cnpj)
            .HasMaxLength(18);

        builder.Property(c => c.Plano)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(c => c.Ativo)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .IsRequired();

        builder.Property(c => c.EmailVerificado)
            .IsRequired();

        builder.Property(c => c.EmailPendente)
            .HasMaxLength(255);
    }
}
