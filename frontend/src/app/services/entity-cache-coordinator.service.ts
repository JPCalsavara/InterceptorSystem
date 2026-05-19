import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export const ENTITY_CACHE_KEYS = [
  'cliente',
  'posto',
  'alocacao',
  'diaria',
  'contrato',
  'funcionario',
  'tag',
] as const;

export type EntityCacheKey = (typeof ENTITY_CACHE_KEYS)[number];
type InvalidatorFn = () => void;

@Injectable({
  providedIn: 'root',
})
export class EntityCacheCoordinatorService {
  private invalidators = new Map<EntityCacheKey, Set<InvalidatorFn>>();
  private invalidateSubject = new Subject<EntityCacheKey | 'all'>();
  
  public cacheInvalidated$ = this.invalidateSubject.asObservable();

  private readonly dependencyMap: Record<EntityCacheKey, readonly EntityCacheKey[]> = {
    cliente: ['posto', 'alocacao', 'diaria', 'contrato', 'funcionario'],
    posto: ['alocacao', 'diaria'],
    alocacao: ['diaria'],
    diaria: [],
    contrato: ['alocacao', 'funcionario', 'diaria'],
    funcionario: ['diaria'],
    tag: ['contrato', 'funcionario', 'diaria'],
  };

  registerInvalidator(entityKey: EntityCacheKey, fn: InvalidatorFn): void {
    const existing = this.invalidators.get(entityKey);
    if (existing) {
      existing.add(fn);
      return;
    }

    this.invalidators.set(entityKey, new Set([fn]));
  }

  invalidate(entityKey: EntityCacheKey): void {
    const entityInvalidators = this.invalidators.get(entityKey);
    if (!entityInvalidators || entityInvalidators.size === 0) {
      return;
    }

    for (const invalidator of entityInvalidators) {
      invalidator();
    }
    this.invalidateSubject.next(entityKey);
  }

  invalidateWithDependencies(entityKey: EntityCacheKey): void {
    const keysToInvalidate = this.resolveInvalidationKeys(entityKey);
    for (const key of keysToInvalidate) {
      this.invalidate(key);
    }
  }

  /**
   * Safety reset used after delete flows to avoid stale data in screens
   * that depend on multiple cached entities.
   */
  invalidateAll(): void {
    for (const key of ENTITY_CACHE_KEYS) {
      this.invalidate(key);
    }
    this.invalidateSubject.next('all');
  }

  private resolveInvalidationKeys(rootEntityKey: EntityCacheKey): EntityCacheKey[] {
    const visited = new Set<EntityCacheKey>();
    const ordered: EntityCacheKey[] = [];
    const queue: EntityCacheKey[] = [rootEntityKey];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) {
        continue;
      }

      visited.add(current);
      ordered.push(current);

      const dependencies = this.dependencyMap[current] ?? [];
      for (const dependency of dependencies) {
        if (!visited.has(dependency)) {
          queue.push(dependency);
        }
      }
    }

    return ordered;
  }
}
