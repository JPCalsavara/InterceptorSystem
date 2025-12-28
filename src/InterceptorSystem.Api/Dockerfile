FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["InterceptorSystem.Api/InterceptorSystem.Api.csproj", "InterceptorSystem.Api/"]
COPY ["InterceptorSystem.Application/InterceptorSystem.Application.csproj", "InterceptorSystem.Application/"]
COPY ["InterceptorSystem.Domain/InterceptorSystem.Domain.csproj", "InterceptorSystem.Domain/"]
COPY ["InterceptorSystem.Infrastructure/InterceptorSystem.Infrastructure.csproj", "InterceptorSystem.Infrastructure/"]
RUN dotnet restore "InterceptorSystem.Api/InterceptorSystem.Api.csproj"
COPY . .
WORKDIR "/src/InterceptorSystem.Api"
RUN dotnet build "./InterceptorSystem.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./InterceptorSystem.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "InterceptorSystem.Api.dll"]
