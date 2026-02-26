import { Condominio } from './index';

export type { Condominio };

export interface CreateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeIdealPorTurno: number; // Funcionários ideais por turno
  horarioTrocaTurno: string; // formato "HH:mm:ss"
  emailGestor?: string;
  telefoneEmergencia?: string;
}

export interface UpdateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeIdealPorTurno: number; // Funcionários ideais por turno
  horarioTrocaTurno: string; // formato "HH:mm:ss"
  emailGestor?: string;
  telefoneEmergencia?: string;
}
