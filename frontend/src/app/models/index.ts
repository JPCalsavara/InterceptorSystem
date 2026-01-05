// Enums
export enum StatusContrato {
  PAGO = 'PAGO',
  PENDENTE = 'PENDENTE',
  INATIVO = 'INATIVO',
}

export enum StatusFuncionario {
  ATIVO = 'ATIVO',
  FERIAS = 'FERIAS',
  AFASTADO = 'AFASTADO',
  DEMITIDO = 'DEMITIDO',
}

export enum TipoFuncionario {
  CLT = 'CLT',
  FREELANCER = 'FREELANCER',
  TERCEIRIZADO = 'TERCEIRIZADO',
}

export enum TipoEscala {
  DOZE_POR_TRINTA_SEIS = 'DOZE_POR_TRINTA_SEIS',
  SEMANAL_COMERCIAL = 'SEMANAL_COMERCIAL',
}

export enum StatusAlocacao {
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  FALTA_REGISTRADA = 'FALTA_REGISTRADA',
}

export enum TipoAlocacao {
  REGULAR = 'REGULAR',
  DOBRA_PROGRAMADA = 'DOBRA_PROGRAMADA',
  SUBSTITUICAO = 'SUBSTITUICAO',
}

// Condominio
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

// Contrato
export interface Contrato {
  id: string;
  condominioId: string;
  descricao: string;
  valorTotal: number;
  valorDiariaCobrada: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

export interface CreateContratoDto {
  condominioId: string;
  descricao: string;
  valorTotal: number;
  valorDiariaCobrada: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

export interface UpdateContratoDto {
  descricao: string;
  valorTotal: number;
  valorDiariaCobrada: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

// Funcionario
export interface Funcionario {
  id: string;
  condominioId: string;
  nome: string;
  cpf: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
  salarioMensal: number;
  valorTotalBeneficiosMensal: number;
  valorDiariasFixas: number;
  ativo: boolean;
}

export interface CreateFuncionarioDto {
  condominioId: string;
  nome: string;
  cpf: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
  salarioMensal: number;
  valorTotalBeneficiosMensal: number;
  valorDiariasFixas: number;
}

export interface UpdateFuncionarioDto {
  nome: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
  salarioMensal: number;
  valorTotalBeneficiosMensal: number;
  valorDiariasFixas: number;
}

// PostoDeTrabalho
export interface PostoDeTrabalho {
  id: string;
  condominioId: string;
  horario: string;
}

export interface CreatePostoDeTrabalhoDto {
  condominioId: string;
  horarioInicio: string;
  horarioFim: string;
}

export interface UpdatePostoDeTrabalhoDto {
  horarioInicio: string;
  horarioFim: string;
}

// Alocacao
export interface Alocacao {
  id: string;
  funcionarioId: string;
  postoDeTrabalhoId: string;
  data: string;
  statusAlocacao: StatusAlocacao;
  tipoAlocacao: TipoAlocacao;
}

export interface CreateAlocacaoDto {
  funcionarioId: string;
  postoDeTrabalhoId: string;
  data: string;
  statusAlocacao: StatusAlocacao;
  tipoAlocacao: TipoAlocacao;
}

export interface UpdateAlocacaoDto {
  statusAlocacao: StatusAlocacao;
  tipoAlocacao: TipoAlocacao;
}
