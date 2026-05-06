import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CalculoValorTotalInput,
  CalculoValorTotalOutput,
  SimulacaoFinanceiraMensalInput,
  SimulacaoFinanceiraMensalOutput,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ContratoCalculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/contratos/calculos`;

  /**
   * Calcula o valor total do contrato usando o backend
   *
   * Endpoint validado com 7 testes passando ✅
   *
   * Fórmula (no backend):
   * 1. Custo Base = diárias reais × valor diária + adicionais + benefícios
   * 2. Soma Margens = encargos + lucro + faltas
   * 3. Valor Total = custo direto com margens aplicadas pelo serviço
   *
   * @param input Dados para cálculo
   * @returns Observable com breakdown completo de custos
   */
  calcularValorTotal(input: CalculoValorTotalInput): Observable<CalculoValorTotalOutput> {
    return this.http.post<CalculoValorTotalOutput>(`${this.apiUrl}/calcular-valor-total`, input);
  }

  simularSemAlocacoes(
    input: SimulacaoFinanceiraMensalInput,
  ): Observable<SimulacaoFinanceiraMensalOutput> {
    return this.http.post<SimulacaoFinanceiraMensalOutput>(
      `${this.apiUrl}/simular-sem-alocacoes`,
      input,
    );
  }
}
