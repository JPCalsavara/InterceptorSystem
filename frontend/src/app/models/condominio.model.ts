import { Condominio } from './index';

export type { Condominio };

export interface CreateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeFuncionariosIdeal: number;  // FASE 4 - Quantidade ideal de funcionários
  horarioTrocaTurno: string;            // FASE 4 - Horário de troca de turno
  emailGestor?: string;                 // FASE 4 - Email do gestor
  telefoneEmergencia?: string;          // FASE 4 - Telefone de emergência
}

export interface UpdateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeFuncionariosIdeal: number;  // FASE 4 - Quantidade ideal de funcionários
  horarioTrocaTurno: string;            // FASE 4 - Horário de troca de turno
  emailGestor?: string;                 // FASE 4 - Email do gestor
  telefoneEmergencia?: string;          // FASE 4 - Telefone de emergência
}
