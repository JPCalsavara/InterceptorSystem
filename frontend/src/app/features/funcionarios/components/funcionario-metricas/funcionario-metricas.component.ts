import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-funcionario-metricas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funcionario-metricas.component.html',
  styleUrl: './funcionario-metricas.component.scss'
})
export class FuncionarioMetricasComponent {
  totalDiarias = input<number>(0);
  diariasConfirmadas = input<number>(0);
  totalFaltas = input<number>(0);
  taxaPresenca = input<number>(0);
  prejuizoPorFaltas = input<number>(0);
  temContrato = input<boolean>(false);
  salarioSimulado = input<number>(0);
  salarioMesCompleto = input<number>(0);
  totalCanceladas = input<number>(0);
  multaPorCancelamentos = input<number>(0);

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
