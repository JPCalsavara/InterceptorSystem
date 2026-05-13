import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, Contrato, Posto, StatusContrato } from '../models/index';

// Espelha: CreateClienteCompletoDtoInput (backend)
export interface CriarClienteCompletoInput {
  cliente: {
    nome: string;
    cnpj: string;
    cidade: string;
    estado: string;
    quantidadeIdealPorTurno: number; // Funcionários ideais por turno
    horarioTrocaTurno: string; // formato "HH:mm:ss"
    emailGestor?: string;
    telefoneEmergencia?: string;
  };
  // Espelha: CreateContratoCompletoDtoInput — sem clienteId (preenchido automaticamente)
  contrato: {
    descricao: string;
    valorTotalMensal: number;
    valorDiariaCobrada: number;
    percentualAdicionalNoturno: number; // 0-1 (ex: 0.20 = 20%)
    percentualAdicionalFimSemana: number; // 0-1
    valorBeneficiosExtrasMensal: number;
    percentualEncargosProvisoes: number; // 0-1 (ex: 0.15 = 15%)
    margemLucroPercentual: number; // 0-1 (ex: 0.15 = 15%)
    margemCoberturaFaltasPercentual: number; // 0-1 (ex: 0.10 = 10%)
    dataInicio: string; // formato "yyyy-MM-dd"
    dataFim: string; // formato "yyyy-MM-dd"
    status: StatusContrato;
  };
  criarPostosAutomaticamente?: boolean; // padrão: true
  numeroDePostos?: number; // padrão: 2 (diurno + noturno)
  postoConfigs?: Array<{
    tipoPosto: string;
    quantidadeAlocacoes: number;
    quantidadeFuncionariosPorAlocacao: number;
    alocacoesNoturnas: number;
    valorDiariaCobrada: number;
    valorBeneficiosExtrasMensal: number;
  }>;
}

// Espelha: ClienteCompletoDtoOutput (backend)
export interface CriarClienteCompletoOutput {
  cliente: Cliente;
  contrato: Contrato;
  postos: Posto[];
}

@Injectable({
  providedIn: 'root',
})
export class ClienteCompletoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/clientes-completos`;

  /**
   * Cria Cliente + Contrato + Postos de Trabalho em uma única operação atômica.
   * Endpoint: POST /api/clientes-completos
   */
  criar(input: CriarClienteCompletoInput): Observable<CriarClienteCompletoOutput> {
    return this.http.post<CriarClienteCompletoOutput>(this.apiUrl, input);
  }
}
