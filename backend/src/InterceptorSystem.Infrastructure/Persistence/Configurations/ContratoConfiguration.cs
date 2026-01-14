using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InterceptorSystem.Infrastructure.Persistence.Configurations;

public class ContratoConfiguration : IEntityTypeConfiguration<Contrato>
{
    public void Configure(EntityTypeBuilder<Contrato> builder)
    {
        builder.ToTable("Contratos");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Descricao).IsRequired().HasMaxLength(300);
        builder.Property(c => c.ValorTotalMensal).HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(c => c.ValorDiariaCobrada).HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(c => c.PercentualAdicionalNoturno).HasColumnType("decimal(5,4)").IsRequired();
        builder.Property(c => c.ValorBeneficiosExtrasMensal).HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(c => c.PercentualImpostos).HasColumnType("decimal(5,4)").IsRequired();
        builder.Property(c => c.QuantidadeFuncionarios).IsRequired();
        builder.Property(c => c.MargemLucroPercentual).HasColumnType("decimal(5,4)").IsRequired();
        builder.Property(c => c.MargemCoberturaFaltasPercentual).HasColumnType("decimal(5,4)").IsRequired();
        builder.Property(c => c.DataInicio).IsRequired();
        builder.Property(c => c.DataFim).IsRequired();
        builder.Property(c => c.Status)
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<StatusContrato>(v))
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.EmpresaId).IsRequired();
        builder.Property(c => c.CondominioId).IsRequired();

        builder.HasOne(c => c.Condominio)
            .WithMany(c => c.Contratos)
            .HasForeignKey(c => c.CondominioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(c => c.EmpresaId);
        builder.HasIndex(c => new { c.CondominioId, c.Status });
    }
}
