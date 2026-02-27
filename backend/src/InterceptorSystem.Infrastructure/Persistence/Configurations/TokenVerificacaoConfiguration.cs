using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class TokenVerificacaoConfiguration : IEntityTypeConfiguration<TokenVerificacao>
{
    public void Configure(EntityTypeBuilder<TokenVerificacao> builder)
    {
        builder.ToTable("TokensVerificacao");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Token)
            .IsRequired()
            .HasMaxLength(512);

        builder.HasIndex(t => t.Token).IsUnique();

        builder.Property(t => t.Tipo)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(t => t.ExpiresAt)
            .IsRequired();

        builder.Property(t => t.Usado)
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.DadosAdicionais)
            .HasMaxLength(1024);

        builder.HasIndex(t => new { t.ContaId, t.Tipo, t.Usado });

        builder.HasOne<Domain.Modulos.Auth.Entidades.Conta>()
            .WithMany()
            .HasForeignKey(t => t.ContaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
