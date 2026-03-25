using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Auth.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class ContaConfiguration : IEntityTypeConfiguration<Conta>
{
    public void Configure(EntityTypeBuilder<Conta> builder)
    {
        builder.ToTable("Contas");

        builder.HasKey(c => c.Id);

        builder.OwnsOne(c => c.Email, email =>
        {
            email.Property(e => e.Valor)
                .HasColumnName("Email")
                .IsRequired()
                .HasMaxLength(255);
        });

        // TODO: Reintroduzir indice unico de email via migration SQL para owned type.

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

        builder.Property(c => c.Telefone)
            .HasMaxLength(20);

        builder.Property(c => c.TelefoneVerificado)
            .IsRequired()
            .HasDefaultValue(false);

        // Índice único parcial: apenas quando Telefone não é nulo
        // Impede dois contas com o mesmo telefone verificado
        builder.HasIndex(c => c.Telefone)
            .IsUnique()
            .HasFilter("\"Telefone\" IS NOT NULL");
    }
}
