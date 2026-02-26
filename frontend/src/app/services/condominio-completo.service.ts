import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Condominio, Contrato, PostoDeTrabalho, StatusContrato } from '../models/index';

// Espelha: CreateCondominioCompletoDtoInput (backend)
export interface CriarCondominioCompletoInput {
  condominio: {
    nome: string;
    cnpj: string;
    endereco: string;
    quantidadeIdealPorTurno: number; // Funcionários ideais por turno
    horarioTrocaTurno: string; // formato "HH:mm:ss"
    emailGestor?: string;
    telefoneEmergencia?: string;
  };
  // Espelha: CreateContratoCompletoDtoInput — sem condominioId (preenchido automaticamente)
  contrato: {
    descricao: string;
    valorTotalMensal: number;
    valorDiariaCobrada: number;
    percentualAdicionalNoturno: number; // 0-1 (ex: 0.20 = 20%)
    valorBeneficiosExtrasMensal: number;
    percentualImpostos: number; // 0-1 (ex: 0.15 = 15%)
    margemLucroPercentual: number; // 0-1 (ex: 0.15 = 15%)
    margemCoberturaFaltasPercentual: number; // 0-1 (ex: 0.10 = 10%)
    dataInicio: string; // formato "yyyy-MM-dd"
    dataFim: string; // formato "yyyy-MM-dd"
    status: StatusContrato;
  };
  criarPostosAutomaticamente?: boolean; // padrão: true
  numeroDePostos?: number; // padrão: 2 (diurno + noturno)
}

// Espelha: CondominioCompletoDtoOutput (backend)
export interface CriarCondominioCompletoOutput {
  condominio: Condominio;
  contrato: Contrato;
  postos: PostoDeTrabalho[];
}

@Injectable({
  providedIn: 'root',
})
export class CondominioCompletoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/condominios-completos`;

  /**
   * Cria Condomínio + Contrato + Postos de Trabalho em uma única operação atômica.
   * Endpoint: POST /api/condominios-completos
   */
  criar(input: CriarCondominioCompletoInput): Observable<CriarCondominioCompletoOutput> {
    return this.http.post<CriarCondominioCompletoOutput>(this.apiUrl, input);
  }
}
