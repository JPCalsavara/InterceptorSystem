# InterceptorSystem - Mapa de Arquitetura

Este documento serve como mapa mental **base** para o agente de IA e desenvolvedores. Antes de propor qualquer alteração ou novo plano, consulte este mapa para garantir consistência estrutural.

## 1. Backend (C# .NET 9) - Clean Architecture & AppServices

O backend está dividido rigorosamente em 4 camadas (`src/`):

### 1.1 `InterceptorSystem.Domain` (Core)
Onde vive o coração do negócio.
- **`Entities/`**: Agregados e Entidades (ex: `Cliente`, `Escala`, `Contrato`). **As propriedades devem ser alteradas APENAS via métodos comportamentais** (ex: `Atualizar()`).
- **`ValueObjects/`**: Regras isoladas como `Cpf`, `Cnpj`, `Email`, `Telefone`. Validações devem ocorrer no construtor do VO (Fail-fast com `DomainException`).
- **`Events/`**: Domain Events disparados pelas entidades.
- **Regra:** Esta camada **NUNCA** pode referenciar o banco de dados, DTOs ou APIs.

### 1.2 `InterceptorSystem.Application` (Casos de Uso)
- **`DTOs/`**: Modelos puramente anêmicos de entrada e saída.
- **`Services/`**: Casos de uso da aplicação (AppServices). Concentram o fluxo de orquestração (validar entrada, buscar entidade, chamar métodos de domínio, salvar repositório).
- **`Ports/`**: Interfaces de Repositórios (`IRepository`) e Serviços Externos.

### 1.3 `InterceptorSystem.Infrastructure` (Data & Externos)
- **`Data/`**: O `AppDbContext`, as Migrations do Entity Framework, e as implementações concretas dos Repositórios.
- É aqui que as transações são efetuadas e onde o Global Query Filter de Tenant (`EmpresaId`) atua.

### 1.4 `InterceptorSystem.Api` (Presentation)
- **Controllers**: Devem ser estritamente **Thin Controllers**. 
  - ❌ Proibido: Validação de regras de negócio, `try-catch`, injeção do DbContext.
  - ✅ Correto: Apenas injeção de `AppService`, anotações de Swagger e devolução do `Ok(result)`.
- **Middlewares**: Exceções como `DomainException` são capturadas pelo Global Exception Handler e convertidas em `400 BadRequest` automaticamente.

---

## 2. Frontend (Angular 21 Standalone)

O frontend adota arquitetura baseada em features e Single-File Components. Localizado em `frontend/src/app/`.

### 2.1 Estrutura de Pastas
- **`pages/`**: Os componentes de roteamento principais (Smart Components). Orquestram o estado da página.
  - Dentro de cada página, haverá uma subpasta **`components/`**. Aqui ficam os sub-componentes visuais daquela página (ex: forms, botões específicos). **Use Single-File Components (.ts apenas).**
- **`features/`**: Lógicas de negócio modulares compartilhadas.
- **`services/`**: Camada que fala com o Backend (via `HttpClient`). Nenhum componente deve injetar o HttpClient diretamente.
- **`core/`**: Interceptors de Auth (JWT), Guards, e Error Handlers globais.
- **`shared/`**: Componentes puramente visuais e genéricos usados pelo sistema todo (ex: botões padrões, inputs, modais).

### 2.2 UI & Styling
- **Design Tokens**: A responsividade e as cores dependem do `src/styles.scss`. Nunca chumbe cores (`#FF0000`) direto no componente.
- **Flexbox/Grid**: Responsividade feita manualmente com excelência, focando em quebras suaves desde o Mobile (`320px`) até Desktop.

---

## 3. Diretrizes Mestre do Sistema
1. **Multi-Tenant System:** Tudo roda em volta da `EmpresaId`. O Frontend manda o JWT, o Interceptor do backend pega o `EmpresaId`, e o `AppDbContext` injeta isso silenciosamente nas queries e inserts. Nunca confie no `EmpresaId` vindo no corpo do Request HTTP.
2. **Test Driven:** Se criou feature nova, precisa criar testes Cypress Component (para o UI/Responsivo) e xUnit (para cobrir 3 fluxos do Backend: Good, Edge, Bad).
3. **Falhas no Backend:** Erros sobem do Domínio como `DomainException`. O Middleware as pega e transforma em 400 com um JSON padronizado. O Frontend intercepta esse 400 e mostra um Toast bonitinho para o usuário.
