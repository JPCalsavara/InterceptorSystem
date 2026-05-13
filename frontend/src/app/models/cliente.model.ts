import { Cliente } from './index';

export type { Cliente };

export interface CreateClienteDto {
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  emailGestor?: string;
  telefoneEmergencia?: string;
  quantidadeIdealPorTurno?: number;
  horarioTrocaTurno?: string;
}

export interface UpdateClienteDto {
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  emailGestor?: string;
  telefoneEmergencia?: string;
  quantidadeIdealPorTurno?: number;
  horarioTrocaTurno?: string;
}
