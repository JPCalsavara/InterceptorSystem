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

        builder.Property(f => f.SalarioMensal).HasColumnType("decimal(10,2)");
        builder.Property(f => f.ValorTotalBeneficiosMensal).HasColumnType("decimal(10,2)");
        builder.Property(f => f.ValorDiariasFixas).HasColumnType("decimal(10,2)");

        builder.Property(f => f.EmpresaId).IsRequired();
        builder.Property(f => f.CondominioId).IsRequired();

        builder.HasOne(f => f.Condominio)
            .WithMany(c => c.Funcionarios)
            .HasForeignKey(f => f.CondominioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(f => f.EmpresaId);
        builder.HasIndex(f => f.CondominioId);
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
