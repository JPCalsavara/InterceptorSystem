export interface Condominio {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  empresaId?: string;
  dataCriacao?: Date;
}

export interface CreateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone?: string;
  email?: string;
}

export interface UpdateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone?: string;
  email?: string;
}
