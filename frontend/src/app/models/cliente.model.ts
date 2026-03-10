import { Cliente } from './index';

export type { Cliente };

export interface CreateClienteDto {
  nome: string;
  cidade: string;
  estado: string;
  emailGestor?: string;
  telefoneEmergencia?: string;
}

export interface UpdateClienteDto {
  nome: string;
  cidade: string;
  estado: string;
  emailGestor?: string;
  telefoneEmergencia?: string;
}
