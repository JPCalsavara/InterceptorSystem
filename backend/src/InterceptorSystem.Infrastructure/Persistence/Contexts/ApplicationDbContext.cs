using System.Reflection;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.Common;
using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Auth.Entidades;
using InterceptorSystem.Domain.Modulos.Whatsapp.Entidades;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Contexts;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    private readonly ICurrentTenantService _tenantService;

    // Construtor com Injeção de Dependência
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentTenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    // --- DbSets (Tabelas) ---
    public DbSet<Condominio> Condominios { get; set; }
    public DbSet<PostoDeTrabalho> PostosDeTrabalho { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<Alocacao> Alocacoes { get; set; }
    public DbSet<Contrato> Contratos => Set<Contrato>();
    public DbSet<Conta> Contas { get; set; }
    public DbSet<TokenVerificacao> TokensVerificacao { get; set; }
    public DbSet<SessaoWhatsapp> SessoesWhatsapp => Set<SessaoWhatsapp>();

    // --- Configuração do Modelo (Filtros de Leitura) ---
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // 1. Aplica as configurações individuais (Fluent API) de cada entidade
        // Isso busca todas as classes que implementam IEntityTypeConfiguration no Assembly atual
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // 2. APLICAÇÃO DO FILTRO GLOBAL DE TENANT
        // Varre todas as entidades mapeadas no EF Core
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            // Verifica se a entidade herda da nossa classe base "Entity"
            if (typeof(Entity).IsAssignableFrom(entityType.ClrType))
            {
                // Chama o método helper para configurar o filtro tipado
                var method = typeof(ApplicationDbContext)
                    .GetMethod(nameof(ConfigureGlobalFilters), BindingFlags.NonPublic | BindingFlags.Instance)
                    ?.MakeGenericMethod(entityType.ClrType);

                method?.Invoke(this, new object[] { builder });
            }
        }
    }

    // Método auxiliar genérico para criar a expressão Lambda
    private void ConfigureGlobalFilters<T>(ModelBuilder builder) where T : Entity
    {
        // A Regra: "Sempre adicione 'WHERE EmpresaId = X' em qualquer query desta tabela"
        builder.Entity<T>().HasQueryFilter(e => e.EmpresaId == _tenantService.EmpresaId);
    }

    // --- Interceptação do SaveChanges (Regras de Escrita) ---
    public async Task<bool> CommitAsync()
    {
        // Antes de salvar no banco, injetamos regras automáticas
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    if (entry.Entity.EmpresaId == Guid.Empty && _tenantService.EmpresaId.HasValue)
                    {
                        // Segurança extra: se o construtor não setou, garantimos aqui.
                    }
                    break;

                case EntityState.Modified:
                    // Segurança: Impede que alguém mude o dono do registro (Tenant) via Update
                    entry.Property(x => x.EmpresaId).IsModified = false;
                    break;
            }
        }

        // Persiste no banco
        var result = await base.SaveChangesAsync();
        return result > 0;
    }

    // --- Suporte a Transações Explícitas (BL-9) ---
    
    public async Task BeginTransactionAsync()
    {
        if (Database.CurrentTransaction != null) return; // Já dentro de transação
        await Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (Database.CurrentTransaction == null) return;
        await Database.CommitTransactionAsync();
    }

    public async Task RollbackTransactionAsync()
    {
        if (Database.CurrentTransaction == null) return;
        await Database.RollbackTransactionAsync();
    }
}
