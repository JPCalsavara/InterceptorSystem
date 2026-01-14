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
  quantidadeFuncionariosIdeal: number;  // FASE 1 backend
  horarioTrocaTurno: string;            // FASE 1 backend - formato "HH:mm"
  emailGestor?: string;                 // FASE 1 backend
  telefoneEmergencia?: string;          // FASE 1 backend
  ativo: boolean;
  empresaId?: string;
  dataCriacao?: Date;
}

export interface CreateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeFuncionariosIdeal: number;  // FASE 1 backend
  horarioTrocaTurno: string;            // FASE 1 backend
  emailGestor?: string;                 // FASE 1 backend
  telefoneEmergencia?: string;          // FASE 1 backend
}

export interface UpdateCondominioDto {
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeFuncionariosIdeal: number;  // FASE 1 backend
  horarioTrocaTurno: string;            // FASE 1 backend
  emailGestor?: string;                 // FASE 1 backend
  telefoneEmergencia?: string;          // FASE 1 backend
}

// Contrato
export interface Contrato {
  id: string;
  condominioId: string;
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;
  quantidadeFuncionarios: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
  valorTotalContrato?: number; // Calculado
}

export interface CreateContratoDto {
  condominioId: string;
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;
  quantidadeFuncionarios: number;
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
  quantidadeFuncionarios: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
}

// Funcionario
export interface Funcionario {
  id: string;
  condominioId: string;
  contratoId: string;                   // FASE 2 backend - obrigatório
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
  condominioId: string;
  contratoId: string;                   // FASE 2 backend - obrigatório
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

// PostoDeTrabalho - FASE 3
export interface PostoDeTrabalho {
  id: string;
  condominioId: string;
  horarioInicio: string;               // FASE 5 - formato "HH:mm:ss"
  horarioFim: string;                  // FASE 5 - formato "HH:mm:ss"
  horario: string;                     // FASE 5 - formato "HH:mm - HH:mm" (display)
  quantidadeIdealFuncionarios: number; // FASE 5 - calculado do condomínio
  permiteDobrarEscala: boolean;        // FASE 5
  capacidadeMaximaPorDobras: number;   // FASE 5
  condominio?: Condominio;             // Pode vir populado em alguns endpoints
}

export interface CreatePostoDeTrabalhoDto {
  condominioId: string;
  horarioInicio: string;             // formato "HH:mm:ss"
  horarioFim: string;                // formato "HH:mm:ss"
  permiteDobrarEscala: boolean;
  capacidadeMaximaExtraPorTerceiros?: number;
}

export interface UpdatePostoDeTrabalhoDto {
  horarioInicio: string;
  horarioFim: string;
  permiteDobrarEscala: boolean;
  capacidadeMaximaExtraPorTerceiros?: number;
}

// Alocacao - FASE 3
export interface Alocacao {
  id: string;
  funcionarioId: string;
  postoDeTrabalhoId: string;
  data: string;                      // formato "yyyy-MM-dd"
  statusAlocacao: StatusAlocacao;
  tipoAlocacao: TipoAlocacao;
  funcionario?: Funcionario;         // Pode vir populado
  postoDeTrabalho?: PostoDeTrabalho; // Pode vir populado
}

export interface CreateAlocacaoDto {
  funcionarioId: string;
  postoDeTrabalhoId: string;
  data: string;                      // formato "yyyy-MM-dd"
  statusAlocacao: StatusAlocacao;
  tipoAlocacao: TipoAlocacao;
}

export interface UpdateAlocacaoDto {
  statusAlocacao: StatusAlocacao;
  tipoAlocacao: TipoAlocacao;
}

// Cálculo de Contrato
export * from './contrato-calculo.models';

