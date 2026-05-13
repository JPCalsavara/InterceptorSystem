import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

describe('EntityCacheCoordinatorService', () => {
  let service: EntityCacheCoordinatorService;

  beforeEach(() => {
    service = new EntityCacheCoordinatorService();
  });

  it('invalidates entity and dependencies in deterministic chain order', () => {
    const calls: string[] = [];

    service.registerInvalidator('posto', () => calls.push('posto'));
    service.registerInvalidator('alocacao', () => calls.push('alocacao'));
    service.registerInvalidator('diaria', () => calls.push('diaria'));

    service.invalidateWithDependencies('posto');

    expect(calls).toEqual(['posto', 'alocacao', 'diaria']);
  });

  it('does not invoke duplicated invalidators twice', () => {
    let callCount = 0;
    const fn = () => {
      callCount += 1;
    };

    service.registerInvalidator('alocacao', fn);
    service.registerInvalidator('alocacao', fn);

    service.invalidate('alocacao');

    expect(callCount).toBe(1);
  });

  it('invalidates transitive dependencies from contrato', () => {
    const calls: string[] = [];

    service.registerInvalidator('contrato', () => calls.push('contrato'));
    service.registerInvalidator('alocacao', () => calls.push('alocacao'));
    service.registerInvalidator('funcionario', () => calls.push('funcionario'));
    service.registerInvalidator('diaria', () => calls.push('diaria'));

    service.invalidateWithDependencies('contrato');

    expect(calls).toContain('contrato');
    expect(calls).toContain('alocacao');
    expect(calls).toContain('funcionario');
    expect(calls).toContain('diaria');
    expect(new Set(calls).size).toBe(4);
  });

  it('invalidates all registered entities with invalidateAll', () => {
    const calls: string[] = [];

    service.registerInvalidator('cliente', () => calls.push('cliente'));
    service.registerInvalidator('posto', () => calls.push('posto'));
    service.registerInvalidator('alocacao', () => calls.push('alocacao'));
    service.registerInvalidator('diaria', () => calls.push('diaria'));
    service.registerInvalidator('contrato', () => calls.push('contrato'));
    service.registerInvalidator('funcionario', () => calls.push('funcionario'));
    service.registerInvalidator('tag', () => calls.push('tag'));

    service.invalidateAll();

    expect(new Set(calls)).toEqual(
      new Set(['cliente', 'posto', 'alocacao', 'diaria', 'contrato', 'funcionario', 'tag']),
    );
  });
});
