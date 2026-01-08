using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class FuncionarioConfiguration : IEntityTypeConfiguration<Funcionario>
{
    public void Configure(EntityTypeBuilder<Funcionario> builder)
    {
        builder.ToTable("Funcionarios");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Nome).IsRequired().HasMaxLength(250);
        builder.Property(f => f.Cpf).IsRequired().HasMaxLength(14);
        builder.HasIndex(f => f.Cpf).IsUnique();

        builder.Property(f => f.Celular).IsRequired().HasMaxLength(30);

        builder.Property(f => f.StatusFuncionario)
            .IsRequired()
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<StatusFuncionario>(v))
            .HasMaxLength(50);

        builder.Property(f => f.TipoEscala)
            .IsRequired()
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<TipoEscala>(NormalizeTipoEscala(v)))
            .HasMaxLength(50);

        builder.Property(f => f.TipoFuncionario)
            .IsRequired()
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<TipoFuncionario>(NormalizeTipoFuncionario(v)))
            .HasMaxLength(50);

        // FASE 3: Campos de salário removidos - agora são calculados automaticamente
        // As propriedades SalarioBase, AdicionalNoturno, Beneficios e SalarioTotal
        // estão marcadas como [NotMapped] e são calculadas em tempo real do Contrato

        builder.Property(f => f.EmpresaId).IsRequired();
        builder.Property(f => f.CondominioId).IsRequired();
        builder.Property(f => f.ContratoId).IsRequired();

        builder.HasOne(f => f.Condominio)
            .WithMany(c => c.Funcionarios)
            .HasForeignKey(f => f.CondominioId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // FASE 2: Relacionamento com Contrato
        builder.HasOne(f => f.Contrato)
            .WithMany(c => c.Funcionarios)
            .HasForeignKey(f => f.ContratoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(f => f.EmpresaId);
        builder.HasIndex(f => f.CondominioId);
        builder.HasIndex(f => f.ContratoId); // FASE 2: Índice para performance
    }

    private static string NormalizeTipoEscala(string value)
    {
        return value switch
        {
            "12x36" => nameof(TipoEscala.DOZE_POR_TRINTA_SEIS),
            "5x2" => nameof(TipoEscala.SEMANAL_COMERCIAL),
            _ => value
        };
    }

    private static string NormalizeTipoFuncionario(string value)
    {
        return value.ToUpperInvariant() switch
        {
            "PORTEIRO" => nameof(TipoFuncionario.CLT),
            "PORTEIROS" => nameof(TipoFuncionario.CLT),
            _ => value.ToUpperInvariant()
        };
    }
}
