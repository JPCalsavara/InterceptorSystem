using InterceptorSystem.Domain.BoundedContexts.Auth.Aggregates;
using InterceptorSystem.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using BCrypt.Net;

namespace InterceptorSystem.Infrastructure.Persistence.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        var adminEmail = "admin@gmail.com";
        var exists = await context.Contas.AnyAsync(c => c.Email.Valor == adminEmail);
        
        if (!exists)
        {
            var adminConta = new Conta(adminEmail, BCrypt.Net.BCrypt.HashPassword("Abcd1234"), "Interceptor Admin");
            adminConta.MarcarEmailComoVerificado();
            context.Contas.Add(adminConta);
            await context.SaveChangesAsync();
        }
    }
}
