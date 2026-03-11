import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';
import { DiariaService } from '../../../services/diaria.service';
import { ClienteService } from '../../../services/cliente.service';
import { PostoService } from '../../../services/posto.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Funcionario,
  Diaria,
  Cliente,
  Posto,
  Alocacao,
  Contrato,
  StatusDiaria,
  TipoDiaria,
  TipoEscala,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';

@Component({
  selector: 'app-funcionario-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './funcionario-detail.component.html',
  styleUrl: './funcionario-detail.component.scss',
})
export class FuncionarioDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private funcionarioService = inject(FuncionarioService);
  private diariaService = inject(DiariaService);
  private clienteService = inject(ClienteService);
  private postoService = inject(PostoService);
  private contratoService = inject(ContratoService);
  private alocacaoService = inject(AlocacaoService);

  funcionario = signal<Funcionario | null>(null);
  diarias = signal<Diaria[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  cliente = signal<Cliente | null>(null);
  postos = signal<Posto[]>([]);
  contrato = signal<Contrato | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Month selector for allocation history
  selectedMonth = signal({ month: new Date().getMonth(), year: new Date().getFullYear() });

  // Computeds
  totalDiarias = computed(() => this.diarias().length);

  diariasConfirmadas = computed(
    () => this.diarias().filter((a) => a.statusDiaria === StatusDiaria.CONFIRMADA).length,
  );

  faltas = computed(() =>
    this.diarias().filter((a) => a.statusDiaria === StatusDiaria.FALTA_REGISTRADA),
  );

  totalFaltas = computed(() => this.faltas().length);

  prejuizoPorFaltas = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;

    const valorDiaria = contrato.valorDiariaCobrada || 0;
    return this.totalFaltas() * valorDiaria;
  });

  diariasCanceladas = computed(() =>
    this.diarias().filter((a) => a.statusDiaria === StatusDiaria.CANCELADA),
  );

  totalCanceladas = computed(() => this.diariasCanceladas().length);

  multaPorCancelamentos = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;
    return this.totalCanceladas() * (contrato.valorDiariaCobrada || 0);
  });

  // Diárias filtradas pelo mês selecionado
  diariasFiltradas = computed(() => {
    const { month, year } = this.selectedMonth();
    return this.diarias().filter((a) => {
      const d = new Date(a.data + 'T12:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    });
  });

  salarioSimulado = computed(() => {
    const contrato = this.contrato();
    const func = this.funcionario();
    if (!contrato || !func) return 0;

    const diariasMes = this.diariasFiltradas().filter(
      (a) => a.statusDiaria === StatusDiaria.CONFIRMADA,
    );

    // Fallback: sem diárias no mês usa média por tipo de escala
    if (diariasMes.length === 0) {
      let diasMedio = 22;
      if (func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) diasMedio = 15;
      else if (func.tipoEscala === TipoEscala.FOLGUISTA) diasMedio = 8;
      else if (func.tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS) diasMedio = 26;
      return (
        diasMedio * (contrato.valorDiariaCobrada || 0) + (contrato.valorBeneficiosExtrasMensal || 0)
      );
    }

    let total = 0;
    for (const aloc of diariasMes) {
      total += this.calcularValorDiaria(aloc);
    }

    return total + (contrato.valorBeneficiosExtrasMensal || 0);
  });

  // Total ganho no mês selecionado (apenas confirmadas)
  totalGanhoMes = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;

    return this.diariasFiltradas()
      .filter((a) => a.statusDiaria === StatusDiaria.CONFIRMADA)
      .reduce((sum, a) => sum + this.calcularValorDiaria(a), 0);
  });

  salarioMesCompleto = computed(() => {
    const contrato = this.contrato();
    const func = this.funcionario();
    if (!contrato || !func) return 0;
    let diasMedio = 22;
    if (func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) diasMedio = 15;
    else if (func.tipoEscala === TipoEscala.FOLGUISTA) diasMedio = 8;
    else if (func.tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS) diasMedio = 26;
    return (
      diasMedio * (contrato.valorDiariaCobrada || 0) + (contrato.valorBeneficiosExtrasMensal || 0)
    );
  });

  taxaPresenca = computed(() => {
    const total = this.totalDiarias();
    if (total === 0) return 100;

    const confirmadas = this.diariasConfirmadas();
    return (confirmadas / total) * 100;
  });

  // Diárias por posto
  diariasPorPosto = computed(() => {
    const postoMap = new Map<string, number>();

    this.diarias().forEach((a) => {
      const aloc = this.alocacoes().find(al => al.id === a.alocacaoId);
      if (aloc) {
        const count = postoMap.get(aloc.postoId) || 0;
        postoMap.set(aloc.postoId, count + 1);
      }
    });

    return this.postos()
      .map((p) => ({
        posto: p,
        total: postoMap.get(p.id) || 0,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFuncionarioData(id);
    }
  }

  loadFuncionarioData(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    // Carregar funcionário primeiro
    this.funcionarioService.getById(id).subscribe({
      next: (funcionario) => {
        this.funcionario.set(funcionario);
        this.loadRelatedData(funcionario);
      },
      error: (err) => {
        this.error.set('Erro ao carregar dados do funcionário');
        this.loading.set(false);
        console.error('Erro ao carregar funcionário:', err);
      },
    });
  }

  private loadRelatedData(funcionario: Funcionario): void {
    // Carregar cliente
    this.clienteService.getById(funcionario.clienteId).subscribe({
      next: (cliente) => this.cliente.set(cliente),
      error: (err) => console.warn('Erro ao carregar cliente:', err),
    });

    // Carregar contrato
    this.contratoService.getById(funcionario.contratoId).subscribe({
      next: (contrato) => this.contrato.set(contrato),
      error: (err) => console.warn('Erro ao carregar contrato:', err),
    });

    // Carregar diárias
    this.diariaService.getAll().subscribe({
      next: (diarias) => {
        const diariasFunc = diarias.filter((a) => a.funcionarioId === funcionario.id);
        this.diarias.set(diariasFunc);

        // Carregar alocações usadas nestas diárias
        const alocIds = [...new Set(diariasFunc.map((a) => a.alocacaoId))];
        this.alocacaoService.getAll().subscribe({
          next: (alocs) => {
            const alocsFunc = alocs.filter((a) => alocIds.includes(a.id));
            this.alocacoes.set(alocsFunc);

            // Carregar postos destas alocações
            const pIds = [...new Set(alocsFunc.map((a) => a.postoId))];
            this.postoService.getAll().subscribe({
              next: (postos) => this.postos.set(postos.filter((p) => pIds.includes(p.id))),
              error: () => {},
            });
          },
          error: () => {},
        });
      },
      error: (err) => console.warn('Erro ao carregar diárias:', err),
    });

    this.loading.set(false);
  }

  getPostoNome(alocacaoId: string): string {
    const aloc = this.alocacoes().find((a) => a.id === alocacaoId);
    if (!aloc) return 'Desconhecido';
    const posto = this.postos().find((p) => p.id === aloc.postoId);
    if (!posto) return 'Posto desconhecido';

    return `${posto.nome} - ${posto.cidade}`;
  }

  getStatusBadgeClass(status: StatusDiaria): string {
    const classes = {
      [StatusDiaria.CONFIRMADA]: 'badge-success',
      [StatusDiaria.CANCELADA]: 'badge-secondary',
      [StatusDiaria.FALTA_REGISTRADA]: 'badge-danger',
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: StatusDiaria): string {
    const labels = {
      [StatusDiaria.CONFIRMADA]: 'Confirmada',
      [StatusDiaria.CANCELADA]: 'Cancelada',
      [StatusDiaria.FALTA_REGISTRADA]: 'Falta',
    };
    return labels[status] || 'Desconhecido';
  }

  getTipoLabel(tipo: TipoDiaria): string {
    const labels = {
      [TipoDiaria.REGULAR]: 'Regular',
      [TipoDiaria.DOBRA_PROGRAMADA]: 'Dobra Programada',
      [TipoDiaria.SUBSTITUICAO]: 'Substituição',
    };
    return labels[tipo] || tipo;
  }

  private calcularProporcaoNoturna(alocacaoId: string): number {
    const aloc = this.alocacoes().find(a => a.id === alocacaoId);
    if (!aloc) return 0;
    return aloc.temHorarioNoturno ? 1.0 : 0; // Simplificado: se tem horário noturno, aplica bônus total ou proporcional?
    // O backend agora tem a lógica real, no frontend podemos simplificar ou ler do backend.
  }

  // Calcula o valor de uma única diária (bônus FDS + adicional noturno proporcional)
  calcularValorDiaria(diaria: Diaria): number {
    const contrato = this.contrato();
    if (!contrato) return 0;

    let valor = contrato.valorDiariaCobrada || 0;
    const data = new Date(diaria.data + 'T12:00:00');
    const diaSemana = data.getDay();

    if (diaSemana === 0)
      valor *= 2.0; // +100% domingo
    else if (diaSemana === 6) valor *= 1.5; // +50% sábado

    const proporcaoNoturna = this.calcularProporcaoNoturna(diaria.alocacaoId);
    if (proporcaoNoturna > 0) {
      // Adicional proporcional às horas noturnas reais (CLT Art. 73)
      valor *= 1 + proporcaoNoturna * (contrato.percentualAdicionalNoturno || 0);
    }

    return valor;
  }

  // Breakdown noturno do mês selecionado (apenas diárias confirmadas)
  nocturnoBreakdown = computed(() => {
    const contrato = this.contrato();
    if (!contrato || this.postos().length === 0) return null;

    const confirmadas = this.diariasFiltradas().filter(
      (a) => a.statusDiaria === StatusDiaria.CONFIRMADA,
    );
    if (confirmadas.length === 0) return null;

    let totalBase = 0;
    let totalAdicional = 0;
    let countNoturnas = 0;
    let countDiurnas = 0;

    for (const aloc of confirmadas) {
      // Base com multiplicadores de fim de semana
      let base = contrato.valorDiariaCobrada || 0;
      const data = new Date(aloc.data + 'T12:00:00');
      const diaSemana = data.getDay();
      if (diaSemana === 0) base *= 2.0;
      else if (diaSemana === 6) base *= 1.5;

      totalBase += base;

      const proporcao = this.calcularProporcaoNoturna(aloc.alocacaoId);
      const adicional = base * proporcao * (contrato.percentualAdicionalNoturno || 0);
      totalAdicional += adicional;

      if (proporcao > 0) countNoturnas++;
      else countDiurnas++;
    }

    return {
      totalBase,
      totalAdicional,
      totalComAdicional: totalBase + totalAdicional,
      countNoturnas,
      countDiurnas,
      total: confirmadas.length,
      percentualNoturno: (contrato.percentualAdicionalNoturno || 0) * 100,
    };
  });

  // ── Month navigation ──
  previousMonth(): void {
    const { month, year } = this.selectedMonth();
    if (month === 0) this.selectedMonth.set({ month: 11, year: year - 1 });
    else this.selectedMonth.set({ month: month - 1, year });
  }

  nextMonth(): void {
    const { month, year } = this.selectedMonth();
    if (month === 11) this.selectedMonth.set({ month: 0, year: year + 1 });
    else this.selectedMonth.set({ month: month + 1, year });
  }

  currentMonth(): void {
    this.selectedMonth.set({ month: new Date().getMonth(), year: new Date().getFullYear() });
  }

  getSelectedMonthLabel(): string {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const { month, year } = this.selectedMonth();
    return `${months[month]} ${year}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
