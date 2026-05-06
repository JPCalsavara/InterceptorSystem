import { computePostosByQuantidadeIdeal } from './contrato-calculo.helper';

describe('contrato-calculo.helper', () => {
  const configMap = {
    PERSONALIZADO: {
      label: 'Personalizado',
      alocacoes: 1,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 0,
      diasTrabalhadosPorFuncMes: 22,
      operaFimDeSemana: false,
    },
    ESCALA_12X36: {
      label: '12x36',
      alocacoes: 2,
      funcionariosPorAlocacao: 1,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 15,
      operaFimDeSemana: true,
    },
    ESCALA_8H_5X2: {
      label: '8h 5x2',
      alocacoes: 3,
      funcionariosPorAlocacao: 2,
      alocacoesNoturnas: 1,
      diasTrabalhadosPorFuncMes: 22,
      operaFimDeSemana: false,
    },
  };

  it('replica postos para atender quantidade ideal por turno', () => {
    const result = computePostosByQuantidadeIdeal(3, ['ESCALA_12X36'], configMap);

    expect(result.length).toBe(3);
    expect(result.every((p) => p.tipoPosto === 'ESCALA_12X36')).toBe(true);
    expect(result.every((p) => p.quantidadeAlocacoes === 2)).toBe(true);
  });

  it('mantem um posto quando tipo ja cobre capacidade ideal', () => {
    const result = computePostosByQuantidadeIdeal(2, ['ESCALA_8H_5X2'], configMap);

    expect(result.length).toBe(1);
    expect(result[0].quantidadeFuncionariosPorAlocacao).toBe(2);
  });

  it('normaliza ideal invalido para minimo de 1', () => {
    const result = computePostosByQuantidadeIdeal(0, ['ESCALA_12X36'], configMap);

    expect(result.length).toBe(1);
  });

  it('combina multiplos tipos somando replicas de cada tipo', () => {
    const result = computePostosByQuantidadeIdeal(2, ['ESCALA_12X36', 'ESCALA_8H_5X2'], configMap);

    // 12x36 => 2 replicas (capacidade 1), 8h5x2 => 1 replica (capacidade 2)
    expect(result.length).toBe(3);
    expect(result.filter((p) => p.tipoPosto === 'ESCALA_12X36').length).toBe(2);
    expect(result.filter((p) => p.tipoPosto === 'ESCALA_8H_5X2').length).toBe(1);
  });

  it('gera ao menos um posto por tipo quando ideal menor que capacidade', () => {
    const result = computePostosByQuantidadeIdeal(1, ['ESCALA_8H_5X2'], configMap);

    expect(result.length).toBe(1);
    expect(result[0].tipoPosto).toBe('ESCALA_8H_5X2');
  });

  it('usa fallback PERSONALIZADO quando tipo nao existe no mapa', () => {
    const result = computePostosByQuantidadeIdeal(
      2,
      ['TIPO_INEXISTENTE'],
      configMap,
      'PERSONALIZADO',
    );

    expect(result.length).toBe(2);
    expect(result.every((p) => p.tipoPosto === 'TIPO_INEXISTENTE')).toBe(true);
    expect(result.every((p) => p.quantidadeAlocacoes === 1)).toBe(true);
    expect(result.every((p) => p.quantidadeFuncionariosPorAlocacao === 1)).toBe(true);
  });

  it('retorna lista vazia quando nenhum tipo foi selecionado', () => {
    const result = computePostosByQuantidadeIdeal(3, [], configMap);

    expect(result).toEqual([]);
  });
});
