import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CalculoValorTotalInput, CalculoValorTotalOutput } from '../models';

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
   * 1. Custo Base = (ValorDiaria × 30 dias × QtdFuncionarios) + Benefícios
   * 2. Soma Margens = Impostos% + Lucro% + Faltas%
   * 3. Valor Total = Custo Base / (1 - Soma Margens)
   *
   * @param input Dados para cálculo
   * @returns Observable com breakdown completo de custos
   */
  calcularValorTotal(input: CalculoValorTotalInput): Observable<CalculoValorTotalOutput> {
    return this.http.post<CalculoValorTotalOutput>(
      `${this.apiUrl}/calcular-valor-total`,
      input
    );
  }
}

