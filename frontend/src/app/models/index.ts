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
  cnpj: string;
  cidade: string;
  estado: string; // UF, e.g. "SP"
  ativo: boolean;
  emailGestor?: string;
  telefoneEmergencia?: string;
  quantidadeIdealPorTurno?: number;
  horarioTrocaTurno?: string;
  empresaId?: string;
  dataCriacao?: Date;
}

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

export interface Tag {
  id: string;
  nome: string;
  valor: number;
  descricao?: string;
}

export interface ContratoTagRate {
  tagId: string;
  tagNome: string;
  valorDiaria: number;
}

export interface ContratoTagInput {
  tagId: string;
  valorDiaria: number;
}

// Contrato
export interface Contrato {
  id: string;
  clienteId: string;
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  percentualAdicionalFimSemana: number;
  valorBeneficiosExtrasMensal: number;
  percentualEncargosProvisoes: number;
  quantidadeFuncionarios: number;
  numeroDePostos: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
  tags: ContratoTagRate[];
  valorDiariaVigilante?: number;
  // Campos calculados pelo backend
  custoRealMensal?: number;
  lucroRealMensal?: number;
}

export interface CreateContratoDto {
  clienteId: string;
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  percentualAdicionalFimSemana: number;
  valorBeneficiosExtrasMensal: number;
  percentualEncargosProvisoes: number;
  numeroDePostos: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
  tags?: ContratoTagInput[];
  valorDiariaVigilante?: number | null;
}

export interface UpdateContratoDto {
  descricao: string;
  valorTotalMensal: number;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  percentualAdicionalFimSemana: number;
  valorBeneficiosExtrasMensal: number;
  percentualEncargosProvisoes: number;
  numeroDePostos: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;
  status: StatusContrato;
  tags?: ContratoTagInput[];
  valorDiariaVigilante?: number | null;
}

// Funcionario
export interface Funcionario {
  id: string;
  clienteId: string;
  contratoId: string;
  nome: string;
  cpf: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
  ativo: boolean;
  tags?: Tag[];
  custoMensalReal?: number;
  custoMensalEstimado?: number;
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
  tagIds?: string[]; // Phase 4: Tag assignment
}

export interface UpdateFuncionarioDto {
  nome: string;
  celular: string;
  statusFuncionario: StatusFuncionario;
  tipoEscala: TipoEscala;
  tipoFuncionario: TipoFuncionario;
  tagIds?: string[]; // Phase 4: Tag assignment
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
  quantidadeFuncionarios: number;
  temHorarioNoturno: boolean;
}

export interface CreateAlocacaoDto {
  postoId: string;
  contratoId: string;
  horarioInicio: string;
  horarioFim: string;
  tipoEscala: TipoEscala;
  permiteDobrarEscala: boolean;
  quantidadeFuncionarios?: number;
}

export interface UpdateAlocacaoDto {
  horarioInicio: string;
  horarioFim: string;
  tipoEscala: TipoEscala;
  permiteDobrarEscala: boolean;
  quantidadeFuncionarios?: number;
}

// Posto - FASE 2B
export interface Posto {
  id: string;
  clienteId: string;
  nome: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  cidade: string;
  estado: string;
  ativo: boolean;
  cliente?: Cliente;
}

export interface CreatePostoDto {
  clienteId: string;
  nome: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  cidade: string;
  estado: string;
}

export interface UpdatePostoDto {
  nome: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
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
  tagId?: string | null;
  statusDiaria: StatusDiaria;
  tipoDiaria: TipoDiaria;
  funcionario?: Funcionario;
  alocacao?: Alocacao;
}

export interface DiariaTagResumo {
  tagId: string | null;
  tagNome: string;
  quantidadeDiarias: number;
  totalValor: number;
}

export interface DiariasContratoResumo {
  contratoId: string;
  ano: number;
  mes: number;
  totalDiarias: number;
  totalValorDiarias: number;
  totalConfirmadas: number;
  totalFaltas: number;
  totalCanceladas: number;
  resumoByTag: DiariaTagResumo[];
}

export interface ContratoResumoFinanceiroPosto {
  postoId: string;
  postoNome: string;
  totalDiarias: number;
  custoTotal: number;
  diariasNormais: number;
  diariasExtras: number;
}

export interface ContratoResumoFinanceiroAlocacao {
  alocacaoId: string;
  tipoEscala: TipoEscala;
  temHorarioNoturno: boolean;
  totalDiarias: number;
  custoTotal: number;
  diariasNormais: number;
  diariasExtras: number;
}

export interface ContratoResumoFinanceiroFuncionario {
  funcionarioId: string;
  funcionarioNome: string;
  totalDiarias: number;
  custoTotal: number;
  diariasNormais: number;
  diariasExtras: number;
}

export interface ContratoResumoFinanceiro {
  contratoId: string;
  ano: number;
  mes: number;
  custoRealDiariasNormais: number;
  custoRealDiariasExtras: number;
  custoRealTotal: number;
  totalDiariasNormais: number;
  totalDiariasExtras: number;
  projecaoCustoPorPosto: ContratoResumoFinanceiroPosto[];
  projecaoCustoPorAlocacao: ContratoResumoFinanceiroAlocacao[];
  projecaoCustoPorFuncionario: ContratoResumoFinanceiroFuncionario[];
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
