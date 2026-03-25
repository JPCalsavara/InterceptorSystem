using Microsoft.Extensions.Caching.Memory;

namespace InterceptorSystem.Infrastructure.Caching.Configuration;

/// <summary>
/// Configuração centralizada de TTL para diferentes tipos de cache.
/// Permite gerenciar TTLs por volatilidade de dados sem repetir código.
/// 
/// Hierarquia de volatilidade:
/// 1. STABLE (20 min): Cliente, Contrato (mudam raramente)
/// 2. MODERATE (10 min): Posto, Funcionario (mudam ocasionalmente)
/// 3. VOLATILE (1 min): Alocacao, Diaria (mudam frequentemente)
/// 4. REALTIME (30 sec): Status em tempo real (não cacher geralmente)
/// </summary>
public static class CacheConfiguration
{
    /// <summary>
    /// Dados estáveis: Clientes, Contratos
    /// Mudam: Uma vez por semana ou menos frequente
    /// Usado para: GetAllAsync(), GetByIdAsync()
    /// TTL: 20 minutos
    /// </summary>
    public const int TTL_STABLE_SECONDS = 1200;  // 20 min

    /// <summary>
    /// Dados moderados: Postos, Funcionarios
    /// Mudam: Uma vez por dia em média
    /// Usado para: GetAllAsync(), GetByIdAsync(), GetByXxxIdAsync()
    /// TTL: 10 minutos
    /// </summary>
    public const int TTL_MODERATE_SECONDS = 600;  // 10 min

    /// <summary>
    /// Dados voláteis: Alocacoes, Diarias
    /// Mudam: Várias vezes por hora (confirmação constante)
    /// Usado para: GetAllAsync(), GetByXxxIdAsync()
    /// TTL: 1 minuto
    /// </summary>
    public const int TTL_VOLATILE_SECONDS = 60;   // 1 min

    /// <summary>
    /// Dados EXTREMAMENTE voláteis: Status em tempo real
    /// Mudam: Constantemente
    /// TTL: 30 segundos (considerar não cacher)
    /// </summary>
    public const int TTL_REALTIME_SECONDS = 30;   // 30 seg

    /// <summary>
    /// Obter opções de cache por volatilidade.
    /// </summary>
    public static MemoryCacheEntryOptions GetCacheOptions(CacheVolatility volatility)
    {
        var ttlSeconds = volatility switch
        {
            CacheVolatility.Stable => TTL_STABLE_SECONDS,
            CacheVolatility.Moderate => TTL_MODERATE_SECONDS,
            CacheVolatility.Volatile => TTL_VOLATILE_SECONDS,
            CacheVolatility.RealTime => TTL_REALTIME_SECONDS,
            _ => TTL_MODERATE_SECONDS
        };

        return new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromSeconds(ttlSeconds));
    }

    /// <summary>
    /// Mapa de repositórios para sua volatilidade.
    /// Usado para determinar TTL automaticamente.
    /// </summary>
    public static readonly Dictionary<string, CacheVolatility> RepositoryVolatility = new()
    {
        { "Cliente", CacheVolatility.Stable },
        { "Contrato", CacheVolatility.Stable },
        { "Posto", CacheVolatility.Moderate },
        { "Funcionario", CacheVolatility.Moderate },
        { "Alocacao", CacheVolatility.Volatile },
        { "Diaria", CacheVolatility.Volatile }
    };
}

/// <summary>
/// Enum para classificar volatilidade de dados.
/// Usado para determinar TTL automaticamente sem repetir números mágicos.
/// </summary>
public enum CacheVolatility
{
    /// <summary>Dados estáveis, TTL=20 min</summary>
    Stable,

    /// <summary>Dados moderados, TTL=10 min</summary>
    Moderate,

    /// <summary>Dados voláteis, TTL=1 min</summary>
    Volatile,

    /// <summary>Dados em tempo real, TTL=30 seg (não recomendar cacher)</summary>
    RealTime
}
