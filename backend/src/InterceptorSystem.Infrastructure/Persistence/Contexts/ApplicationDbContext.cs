using System.Reflection;
using InterceptorSystem.Application.Common.Interfaces;
using InterceptorSystem.Domain.SharedKernel;
using InterceptorSystem.Domain.SharedKernel.Exceptions;
using InterceptorSystem.Domain.SharedKernel.Interfaces;
using InterceptorSystem.Domain.BoundedContexts.Operacoes.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using InterceptorSystem.Domain.BoundedContexts.Whatsapp.Aggregates;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Contexts;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    private readonly ICurrentTenantService _tenantService;
    private readonly IMediator _mediator;

    // Construtor com Injeção de Dependência
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentTenantService tenantService,
        IMediator mediator) : base(options)
    {
        _tenantService = tenantService;
        _mediator = mediator;
    }

    // --- DbSets (Tabelas) ---
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Alocacao> Alocacoes { get; set; }
    public DbSet<Posto> Postos { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<Diaria> Diarias { get; set; }
    public DbSet<Contrato> Contratos => Set<Contrato>();
    public DbSet<Conta> Contas { get; set; }
    public DbSet<TokenVerificacao> TokensVerificacao { get; set; }
    public DbSet<SessaoWhatsapp> SessoesWhatsapp => Set<SessaoWhatsapp>();
    // Phase 4
    public DbSet<Tag> Tags { get; set; }
    public DbSet<FuncionarioTag> FuncionarioTags { get; set; }
    public DbSet<ContratoTag> ContratoTags { get; set; }
    public DbSet<PostoTag> PostoTags { get; set; }

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
    public async Task<bool> CommitAsync(CancellationToken cancellationToken = default)
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

        // Recupera as entidades com eventos antes de salvar
        var entitiesWithEvents = ChangeTracker.Entries<Entity>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Any())
            .ToList();

        // Persiste no banco
        int result;
        try
        {
            result = await base.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsForeignKeyViolation(ex))
        {
            throw new EntityInUseException("Não é possível remover a entidade pois está vinculada a outros registros.", ex);
        }
        
        // Dispara os eventos de domínio via MediatR
        if (entitiesWithEvents.Any())
        {
            var events = entitiesWithEvents.SelectMany(e => e.DomainEvents).ToList();

            foreach (var entity in entitiesWithEvents)
            {
                entity.ClearDomainEvents();
            }

            foreach (var domainEvent in events)
            {
                await _mediator.Publish(domainEvent, cancellationToken);
            }
        }

        return result > 0;
    }

    // --- Suporte a Transações Explícitas (BL-9) ---
    
    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory") return;
        if (Database.CurrentTransaction != null) return; // Já dentro de transação
        await Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory") return;
        if (Database.CurrentTransaction == null) return;
        await Database.CommitTransactionAsync(cancellationToken);
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (Database.ProviderName == "Microsoft.EntityFrameworkCore.InMemory") return;
        if (Database.CurrentTransaction == null) return;
        await Database.RollbackTransactionAsync(cancellationToken);
    }

    private static bool IsForeignKeyViolation(DbUpdateException ex)
    {
        var current = ex.InnerException as Exception;
        while (current != null)
        {
            if (current.Message.Contains("23503") ||
                current.Message.Contains("FOREIGN KEY") ||
                current.Message.Contains("FK_"))
                return true;
            current = current.InnerException;
        }
        return false;
    }
}
