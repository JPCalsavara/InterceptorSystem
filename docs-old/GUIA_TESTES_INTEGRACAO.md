# 📘 Guia Completo: Componentes para Testes de Integração em .NET

## 🎯 O que são Testes de Integração?

Testes de integração verificam o funcionamento de **múltiplos componentes trabalhando juntos**, diferente dos testes unitários que testam componentes isolados.

---

## 🧩 Componentes Necessários para Testes de Integração

### 1️⃣ **WebApplicationFactory<TProgram>**
**O que é:** Cria uma instância da aplicação ASP.NET Core em memória.

**Para que serve:**
- Inicia a aplicação sem precisar de servidor real
- Permite fazer requisições HTTP reais
- Mantém todo o pipeline de middleware

**Pacote:** `Microsoft.AspNetCore.Mvc.Testing`

```csharp
public class MyTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    
    public MyTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }
}
```

---

### 2️⃣ **Banco de Dados de Teste**

#### **Opção A: In-Memory Database (Recomendado para testes rápidos)**

**Pacote:** `Microsoft.EntityFrameworkCore.InMemory`

**Vantagens:**
- ✅ Muito rápido
- ✅ Não precisa configurar nada
- ✅ Isolado entre testes
- ✅ Não persiste dados

**Desvantagens:**
- ⚠️ Não valida constraints do banco real
- ⚠️ Não testa migrations
- ⚠️ Comportamento pode diferir do PostgreSQL

```csharp
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseInMemoryDatabase("TestDatabase");
});
```

#### **Opção B: Testcontainers (Recomendado para produção)**

**Pacote:** `Testcontainers.PostgreSql`

**Vantagens:**
- ✅ Usa PostgreSQL real
- ✅ Valida constraints
- ✅ Testa migrations reais
- ✅ 100% compatível com produção

**Desvantagens:**
- ⚠️ Mais lento
- ⚠️ Precisa Docker instalado

```csharp
private readonly PostgreSqlContainer _postgresContainer = new PostgreSqlBuilder()
    .WithDatabase("testdb")
    .Build();

await _postgresContainer.StartAsync();

services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(_postgresContainer.GetConnectionString());
});
```

---

### 3️⃣ **CustomWebApplicationFactory**

**O que é:** Classe que customiza a `WebApplicationFactory` para substituir serviços.

**Para que serve:**
- Substituir banco de dados real pelo de teste
- Mockar serviços externos (email, SMS, APIs)
- Configurar autenticação fake
- Desabilitar features (cache, logs)

```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove DbContext real
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            
            if (descriptor != null)
                services.Remove(descriptor);

            // Adiciona DbContext de teste
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("InMemoryDbForTesting");
            });

            // Cria o banco
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureCreated();
        });
    }
}
```

---

### 4️⃣ **HttpClient**

**O que é:** Cliente HTTP para fazer requisições.

**Para que serve:**
- Fazer requisições HTTP reais (GET, POST, PUT, DELETE)
- Testar controllers
- Validar status codes
- Verificar respostas JSON

```csharp
// POST
var response = await _client.PostAsJsonAsync("/api/clientes", input);

// GET
var response = await _client.GetAsync("/api/clientes/123");

// PUT
var response = await _client.PutAsJsonAsync("/api/clientes/123", updateInput);

// DELETE
var response = await _client.DeleteAsync("/api/clientes/123");
```

---

### 5️⃣ **IClassFixture<T>**

**O que é:** Interface do xUnit para compartilhar contexto entre testes.

**Para que serve:**
- Criar `WebApplicationFactory` uma vez para todos os testes
- Economizar tempo de inicialização
- Compartilhar banco de dados entre testes

```csharp
public class MyTests : IClassFixture<CustomWebApplicationFactory>
{
    // A factory será criada UMA VEZ e compartilhada entre todos os testes
}
```

---

### 6️⃣ **Classe Base para Testes (Opcional)**

**Para que serve:**
- Evitar duplicação de código
- Métodos auxiliares comuns
- Limpar banco entre testes

```csharp
public abstract class IntegrationTestBase : IClassFixture<CustomWebApplicationFactory>
{
    protected readonly HttpClient Client;
    protected readonly CustomWebApplicationFactory Factory;

    protected IntegrationTestBase(CustomWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    protected void ClearDatabase()
    {
        using var scope = Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();
    }
}
```

---

## 📦 Pacotes NuGet Necessários

```xml
<ItemGroup>
  <!-- Testes em geral -->
  <PackageReference Include="xunit" Version="2.4.2" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.4.5" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.6.0" />
  
  <!-- Testes de Integração -->
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
  
  <!-- Banco de Dados de Teste -->
  <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.0" />
  <!-- OU -->
  <PackageReference Include="Testcontainers.PostgreSql" Version="3.5.0" />
  
  <!-- Mocks (para testes unitários) -->
  <PackageReference Include="Moq" Version="4.20.72" />
</ItemGroup>
```

---

## 🔧 Configuração do Projeto de Testes

### **InterceptorSystem.Tests.csproj**

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
    <PreserveCompilationContext>true</PreserveCompilationContext> <!-- ⭐ IMPORTANTE -->
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\InterceptorSystem.Api\InterceptorSystem.Api.csproj" />
  </ItemGroup>
</Project>
```

---

## 🏗️ Estrutura de Pastas Recomendada

```
InterceptorSystem.Tests/
├── Unity/                              # Testes Unitários
│   ├── ClienteAppServiceTests.cs
│   └── PostoAppServiceTests.cs
│
├── Integration/                        # Testes de Integração
│   ├── CustomWebApplicationFactory.cs  # ⭐ Factory customizado
│   ├── IntegrationTestBase.cs          # ⭐ Classe base (opcional)
│   ├── ClientesControllerIntegrationTests.cs
│   └── PostosControllerIntegrationTests.cs
│
└── Fixtures/                           # Dados de teste (opcional)
    ├── ClienteFixture.cs
    └── PostoFixture.cs
```

---

## 📝 Exemplo Completo de Teste de Integração

```csharp
public class ClientesControllerIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ClientesControllerIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact(DisplayName = "POST /api/clientes - Deve criar cliente com dados válidos")]
    public async Task Create_DeveRetornar201_QuandoDadosValidos()
    {
        // Arrange
        var input = new CreateClienteDtoInput(
            Nome: "Cliente Solar",
            Cnpj: "12.345.678/0001-90",
            Endereco: "Av. Paulista, 1000"
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/clientes", input);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var result = await response.Content.ReadFromJsonAsync<ClienteDtoOutput>();
        Assert.NotNull(result);
        Assert.Equal(input.Nome, result.Nome);
        Assert.Equal(input.Cnpj, result.Cnpj);
    }
}
```

---

## ⚙️ Configurações Importantes

### 1️⃣ **Program.cs - Tornar acessível para testes**

```csharp
app.Run();

// ⭐ Necessário para WebApplicationFactory
public partial class Program { }
```

### 2️⃣ **InterceptorSystem.Api.csproj - InternalsVisibleTo**

```xml
<ItemGroup>
  <InternalsVisibleTo Include="InterceptorSystem.Tests" />
</ItemGroup>
```

---

## 🎯 Diferenças: Testes Unitários vs Integração

| Aspecto | Testes Unitários | Testes de Integração |
|---------|------------------|----------------------|
| **Escopo** | Um componente isolado | Múltiplos componentes |
| **Velocidade** | Muito rápido (ms) | Mais lento (segundos) |
| **Banco de Dados** | Mock (Moq) | Real ou In-Memory |
| **HTTP** | Não testa | Testa requisições reais |
| **Dependências** | Todas mockadas | Reais (DI real) |
| **Quando usar** | Lógica de negócio | Fluxos completos (CRUD) |

---

## 🚀 Executando os Testes

```bash
# Todos os testes
dotnet test

# Apenas testes unitários
dotnet test --filter "FullyQualifiedName~Unity"

# Apenas testes de integração
dotnet test --filter "FullyQualifiedName~Integration"

# Com detalhes
dotnet test --logger "console;verbosity=detailed"

# Com cobertura
dotnet test /p:CollectCoverage=true
```

---

## 📚 Recursos Adicionais

- [Microsoft Docs - Integration Tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests)
- [xUnit Documentation](https://xunit.net/)
- [Testcontainers](https://dotnet.testcontainers.org/)
- [EF Core In-Memory](https://learn.microsoft.com/en-us/ef/core/providers/in-memory/)

---

## ✅ Checklist para Testes de Integração

- [x] `Microsoft.AspNetCore.Mvc.Testing` instalado
- [x] `Microsoft.EntityFrameworkCore.InMemory` instalado
- [x] `CustomWebApplicationFactory` criado
- [x] `public partial class Program { }` no Program.cs
- [x] `InternalsVisibleTo` no projeto API
- [x] `PreserveCompilationContext=true` no .csproj
- [x] Testes usando `IClassFixture<CustomWebApplicationFactory>`
- [x] Banco de dados substituído por In-Memory
- [x] Testes fazem requisições HTTP reais
- [x] Validam status codes e respostas JSON

---

**Data:** 2025-12-31
**Projeto:** InterceptorSystem
**Autor:** Sistema de Testes

