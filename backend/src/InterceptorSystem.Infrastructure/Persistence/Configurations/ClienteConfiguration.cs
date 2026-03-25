using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
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

        builder.OwnsOne(c => c.Cnpj, cnpj =>
        {
            cnpj.Property(v => v.Valor)
                .HasColumnName("Cnpj")
                .IsRequired()
                .HasMaxLength(14);
        });

        builder.Property(c => c.Cidade)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Estado)
            .IsRequired()
            .HasMaxLength(2);

        // Configuração do Multi-tenancy (EmpresaId é obrigatório)
        builder.Property(c => c.EmpresaId).IsRequired();
        
        builder.OwnsOne(c => c.EmailGestor, email =>
        {
            email.Property(v => v.Valor)
                .HasColumnName("EmailGestor")
                .HasMaxLength(255)
                .IsRequired(false);
        });

        builder.OwnsOne(c => c.TelefoneEmergencia, telefone =>
        {
            telefone.Property(v => v.Valor)
                .HasColumnName("TelefoneEmergencia")
                .HasMaxLength(11)
                .IsRequired(false);
        });
        
        builder.Property(c => c.QuantidadeIdealPorTurno)
            .IsRequired()
            .HasDefaultValue(2);
        
        builder.Property(c => c.HorarioTrocaTurno)
            .IsRequired()
            .HasDefaultValue(new TimeOnly(6, 0));
        
        builder.HasIndex(c => c.Nome);
        builder.HasIndex(c => c.EmpresaId);

        // TODO: Reintroduzir indice unico de CNPJ por empresa via migration SQL
        // quando o mapeamento de owned type suportar composite index de forma consistente.
    }
}
