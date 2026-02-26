namespace InterceptorSystem.Domain.Common.Interfaces;

/// <summary>
/// Interface marcadora para identificar as Raízes de Agregado (Aggregate Roots).
/// Regra: Apenas Agregados devem ter Repositórios diretos.
/// </summary>
public interface IAggregateRoot;