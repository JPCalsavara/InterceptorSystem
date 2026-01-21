// DTOs para cálculo de valor total do contrato

export interface CalculoValorTotalInput {
  valorDiariaCobrada: number;
  quantidadeFuncionarios: number;
  numeroDePostos: number;                  // Quantidade de turnos (ex: 2 = 12x36)
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;              // 0.15 = 15%
  percentualAdicionalNoturno: number;      // 0.20 = 20%
  margemLucroPercentual: number;           // 0.15 = 15%
  margemCoberturaFaltasPercentual: number; // 0.10 = 10%
}

export interface CalculoValorTotalOutput {
  valorTotalMensal: number;        // R$ 12.583,33
  custoBaseMensal: number;         // R$  7.550,00
  valorAdicionalNoturno: number;   // R$  1.200,00
  valorImpostos: number;           // R$  1.887,50
  valorMargemLucro: number;        // R$  1.887,50
  valorMargemFaltas: number;       // R$  1.258,33
  valorBeneficios: number;         // R$    350,00
  baseParaSalarios: number;        // R$  7.200,00
  // Breakdown por turno/posto
  numeroDePostos: number;          // 2 postos
  funcionariosPorPosto: number;    // 1 funcionário/posto
  custoPorPostoDiario: number;     // R$ 100,00/dia
  custoPorPostoMensal: number;     // R$ 3.000,00/mês
}

