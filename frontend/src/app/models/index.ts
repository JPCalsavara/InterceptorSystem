// Enums
export enum StatusContrato {
  ATIVO = 'ATIVO',
  PENDENTE = 'PENDENTE',
  FINALIZADO = 'FINALIZADO',
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
  ALCALA_8H = 'ALCALA_8H',
  FOLGUISTA = 'FOLGUISTA',
  OITO_HORAS_SEIS_POR_DOIS = 'OITO_HORAS_SEIS_POR_DOIS',
}

export enum StatusDiaria {
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA',
  FALTA_REGISTRADA = 'FALTA_REGISTRADA',
}

export enum TipoDiaria {
  REGULAR = 'REGULAR',
  DOBRA_PROGRAMADA = 'DOBRA_PROGRAMADA',
  SUBSTITUICAO = 'SUBSTITUICAO',
}

// Cliente
export interface Cliente {
  id: string;
  nome: string;
  cidade: string;
  estado: string; // UF, e.g. "SP"
  ativo: boolean;
  emailGestor?: string;
  telefoneEmergencia?: string;
  empresaId?: string;
  dataCriacao?: Date;
}

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

// Contrato
export interface Contrato {
  id: string;
  clienteId: string;
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;
  numeroDePostos: number; // Número de turnos/postos
  quantidadeFuncionarios: number; // Read-only: calculado pelo backend (quantidadeIdealPorTurno × numeroDePostos)
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

export interface CreateContratoDto {
  clienteId: string;
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;
  numeroDePostos: number; // Backend calcula quantidadeFuncionarios a partir disso
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

export interface UpdateContratoDto {
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;
  numeroDePostos: number; // Backend calcula quantidadeFuncionarios a partir disso
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

// Funcionario
export interface Funcionario {
  id: string;
  clienteId: string;
  contratoId: string; // FASE 2 backend - obrigatório
  nome: string;
  cpf: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
  ativo: boolean;

  // FASE 3 backend - Campos calculados (read-only, vindos do backend)
  salarioBase?: number;
  adicionalNoturno?: number;
  beneficios?: number;
  salarioTotal?: number;
}

export interface CreateFuncionarioDto {
  clienteId: string;
  contratoId: string; // FASE 2 backend - obrigatório
  nome: string;
  cpf: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
}

export interface UpdateFuncionarioDto {
  nome: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
}
// Alocacao (Shift Slot)
export interface Alocacao {
  id: string;
  postoId: string;
  contratoId: string;
  horarioInicio: string; // format "HH:mm:ss"
  horarioFim: string; // format "HH:mm:ss"
  tipoEscala: TipoEscala;
  permiteDobrarEscala: boolean;
  temHorarioNoturno: boolean;
}

export interface CreateAlocacaoDto {
  postoId: string;
  contratoId: string;
  horarioInicio: string;
  horarioFim: string;
  tipoEscala: TipoEscala;
  permiteDobrarEscala: boolean;
}

export interface UpdateAlocacaoDto {
  horarioInicio: string;
  horarioFim: string;
  tipoEscala: TipoEscala;
  permiteDobrarEscala: boolean;
}

// Posto - FASE 2B
export interface Posto {
  id: string;
  clienteId: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  ativo: boolean;
  cliente?: Cliente;
}

export interface CreatePostoDto {
  clienteId: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
}

export interface UpdatePostoDto {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
}

// Diaria (Assignment)
export interface Diaria {
  id: string;
  funcionarioId: string;
  alocacaoId: string;
  data: string; // formato "yyyy-MM-dd"
  valorDiaria: number;
  statusDiaria: StatusDiaria;
  tipoDiaria: TipoDiaria;
  funcionario?: Funcionario;
  alocacao?: Alocacao;
}

export interface CreateDiariaDto {
  funcionarioId: string;
  alocacaoId: string;
  data: string; // formato "yyyy-MM-dd"
  statusDiaria: StatusDiaria;
  tipoDiaria: TipoDiaria;
}

export interface UpdateDiariaDto {
  statusDiaria: StatusDiaria;
  tipoDiaria: TipoDiaria;
  data?: string;
}

// Cálculo de Contrato
export * from './contrato-calculo.models';
