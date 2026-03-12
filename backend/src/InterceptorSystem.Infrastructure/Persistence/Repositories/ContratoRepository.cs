using InterceptorSystem.Domain.Common.Interfaces;
using InterceptorSystem.Domain.Modulos.Administrativo.Entidades;
using InterceptorSystem.Domain.Modulos.Administrativo.Enums;
using InterceptorSystem.Domain.Modulos.Administrativo.Interfaces;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace InterceptorSystem.Infrastructure.Persistence.Repositories;

public class ContratoRepository : IContratoRepository
{
    private readonly ApplicationDbContext _context;

    public ContratoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public IUnitOfWork UnitOfWork => _context;

    public async Task<Contrato?> GetByIdAsync(Guid id)
    {
        return await _context.Contratos
            .Include(c => c.Cliente) // FASE 3: Necessário para calcular QuantidadeFuncionarios
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Contrato>> GetAllAsync()
    {
        return await _context.Contratos
            .Include(c => c.Cliente) // FASE 3: Necessário para calcular QuantidadeFuncionarios
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .ToListAsync();
    }

    public async Task<IEnumerable<Contrato>> GetByClienteIdAsync(Guid clienteId)
    {
        return await _context.Contratos
            .Include(c => c.Cliente)
            .Include(c => c.Tags)
                .ThenInclude(ct => ct.Tag)
            .Where(c => c.ClienteId == clienteId)
            .ToListAsync();
    }

    public async Task<bool> ExisteContratoVigenteAsync(Guid clienteId, Guid? contratoIdIgnorado = null)
    {
        return await _context.Contratos
            .Where(c => c.ClienteId == clienteId && 
                       (c.Status == StatusContrato.ATIVO || c.Status == StatusContrato.PENDENTE) &&
                       (contratoIdIgnorado == null || c.Id != contratoIdIgnorado))
            .AnyAsync();
    }

    public void Add(Contrato entity) => _context.Contratos.Add(entity);

    public void Update(Contrato entity) => _context.Contratos.Update(entity);

    public void Remove(Contrato entity) => _context.Contratos.Remove(entity);
}

