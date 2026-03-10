using InterceptorSystem.Domain.Modulos.Whatsapp.Entidades;
using InterceptorSystem.Domain.Modulos.Whatsapp.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class SessaoWhatsappConfiguration : IEntityTypeConfiguration<SessaoWhatsapp>
{
    public void Configure(EntityTypeBuilder<SessaoWhatsapp> builder)
    {
        builder.ToTable("SessoesWhatsapp");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Telefone)
            .IsRequired()
            .HasMaxLength(20);

        // Índice para lookup rápido a cada mensagem recebida
        builder.HasIndex(s => s.Telefone).IsUnique();

        builder.Property(s => s.ContaId)
            .IsRequired();

        builder.Property(s => s.Estado)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(s => s.OpcoesCacheJson)
            .HasColumnType("text");

        builder.Property(s => s.CriadoEm)
            .IsRequired();

        builder.Property(s => s.UltimaAtividade)
            .IsRequired();

        // Campos nullable de seleção durante o fluxo
        builder.Property(s => s.ClienteIdSelecionado);
        builder.Property(s => s.PostoIdSelecionado);
        builder.Property(s => s.DataSelecionada);
        builder.Property(s => s.DiariaIdParaSubstituir);
        builder.Property(s => s.FuncionarioSubstitutoId);
    }
}
