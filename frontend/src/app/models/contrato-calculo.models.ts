// DTOs para cálculo de valor total do contrato

export interface CalculoValorTotalInput {
  valorDiariaCobrada: number;
  quantidadeFuncionarios: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;              // 0.15 = 15%
  margemLucroPercentual: number;           // 0.20 = 20%
  margemCoberturaFaltasPercentual: number; // 0.10 = 10%
}

export interface CalculoValorTotalOutput {
  valorTotalMensal: number;      // R$ 72.000
  custoBaseMensal: number;       // R$ 39.600
  valorImpostos: number;         // R$ 10.800
  valorMargemLucro: number;      // R$ 14.400
  valorMargemFaltas: number;     // R$  7.200
  valorBeneficios: number;       // R$  3.600
  baseParaSalarios: number;      // R$ 36.000
}

