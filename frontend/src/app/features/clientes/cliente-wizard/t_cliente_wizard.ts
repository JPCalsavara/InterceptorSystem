export interface WizardStep {
  number: number;
  label: string;
  icon: string;
}

export interface BreakdownResult {
  valorTotalMensal: number;
  custoBaseMensal: number;
  valorMargemLucro: number;
  valorMargemFaltas: number;
  custoDiariasFimSemana: number;
  custoAdicionalNoturno: number;
}
