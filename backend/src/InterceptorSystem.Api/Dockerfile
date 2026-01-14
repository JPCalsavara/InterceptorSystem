# Estágio de Build (SDK - Imagem pesada com ferramentas de compilação)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia os arquivos de projeto primeiro para aproveitar o cache de camadas do Docker
COPY ["InterceptorSystem.Api/InterceptorSystem.Api.csproj", "InterceptorSystem.Api/"]
COPY ["InterceptorSystem.Application/InterceptorSystem.Application.csproj", "InterceptorSystem.Application/"]
COPY ["InterceptorSystem.Domain/InterceptorSystem.Domain.csproj", "InterceptorSystem.Domain/"]
COPY ["InterceptorSystem.Infrastructure/InterceptorSystem.Infrastructure.csproj", "InterceptorSystem.Infrastructure/"]

# Restaura as dependências (NuGet)
RUN dotnet restore "InterceptorSystem.Api/InterceptorSystem.Api.csproj"

# Copia o resto do código
COPY . .
WORKDIR "/src/InterceptorSystem.Api"

# Compila e Publica (Release mode)
RUN dotnet publish "InterceptorSystem.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio Final (Runtime - Imagem leve, só o necessário para rodar)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Define a porta que o container vai escutar internamente
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "InterceptorSystem.Api.dll"]