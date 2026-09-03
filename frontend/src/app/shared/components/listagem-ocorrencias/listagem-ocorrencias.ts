import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OcorrenciaItem } from './t_ocorrencia';

@Component({
  selector: 'app-listagem-ocorrencias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listagem-ocorrencias.html',
  styleUrl: './listagem-ocorrencias.scss'
})
export class ListagemOcorrenciasComponent {
  @Input({ required: true }) titulo!: string;
  @Input({ required: true }) resumoTitulo!: string;
  @Input({ required: true }) labelQuantidade!: string;
  @Input({ required: true }) quantidade!: number;
  
  // Financeiro (opcional)
  @Input() mostrarFinanceiro = false;
  @Input() labelPenalidade = '';
  @Input() valorPenalidade: number = 0;
  @Input() valorDiaria: number = 0;
  
  // Estatísticas extras (opcional)
  @Input() extraItemLabel?: string;
  @Input() extraItemValue?: string;
  
  // Histórico
  @Input({ required: true }) historicoTitulo!: string;
  @Input({ required: true }) itens: OcorrenciaItem[] = [];

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
