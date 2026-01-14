import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CriarCondominioCompletoInput {
  // Dados do Condomínio
  nome: string;
  cnpj: string;
  endereco: string;
  quantidadeFuncionariosIdeal: number;
  horarioTrocaTurno: string;
  emailGestor?: string;
  telefoneEmergencia?: string;

  // Dados do Contrato
  contratoDescricao: string;
  valorDiariaCobrada: number;
  percentualAdicionalNoturno: number;
  valorBeneficiosExtrasMensal: number;
  percentualImpostos: number;
  margemLucroPercentual: number;
  margemCoberturaFaltasPercentual: number;
  dataInicio: string;
  dataFim: string;

  // Configuração de Postos
  criarPostosAutomaticamente: boolean;
  numeroPostos?: number;
}

export interface CriarCondominioCompletoOutput {
  condominioId: string;
  contratoId: string;
  postoIds: string[];
  valorTotalMensalCalculado: number;
  mensagem: string;
}

export interface ValidarCriacaoCondominioCompletoOutput {
  valido: boolean;
  erros: string[];
  avisos: string[];
  preview: {
    condominioNome: string;
    valorTotalMensal: number;
    numeroPostos: number;
    postos: Array<{
      horarioInicio: string;
      horarioFim: string;
      quantidadeIdealFuncionarios: number;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CondominioCompletoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/condominios-completos`;

  /**
   * Valida os dados antes de criar (dry-run)
   */
  validar(input: CriarCondominioCompletoInput): Observable<ValidarCriacaoCondominioCompletoOutput> {
    return this.http.post<ValidarCriacaoCondominioCompletoOutput>(
      `${this.apiUrl}/validar`,
      input
    );
  }

  /**
   * Cria Condomínio + Contrato + Postos de Trabalho em uma única operação
   */
  criar(input: CriarCondominioCompletoInput): Observable<CriarCondominioCompletoOutput> {
    return this.http.post<CriarCondominioCompletoOutput>(
      this.apiUrl,
      input
    );
  }
}

