import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { CondominioService } from '../../../services/condominio.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Funcionario,
  Alocacao,
  Condominio,
  PostoDeTrabalho,
  Contrato,
  StatusAlocacao,
  TipoAlocacao,
  TipoEscala,
} from '../../../models/index';

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
  private alocacaoService = inject(AlocacaoService);
  private condominioService = inject(CondominioService);
  private postoService = inject(PostoDeTrabalhoService);
  private contratoService = inject(ContratoService);

  funcionario = signal<Funcionario | null>(null);
  alocacoes = signal<Alocacao[]>([]);
  condominio = signal<Condominio | null>(null);
  postos = signal<PostoDeTrabalho[]>([]);
  contrato = signal<Contrato | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Month selector for allocation history
  selectedMonth = signal({ month: new Date().getMonth(), year: new Date().getFullYear() });

  // Computeds
  totalAlocacoes = computed(() => this.alocacoes().length);

  alocacoesConfirmadas = computed(
    () => this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA).length,
  );

  faltas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA),
  );

  totalFaltas = computed(() => this.faltas().length);

  prejuizoPorFaltas = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;

    const valorDiaria = contrato.valorDiariaCobrada || 0;
    return this.totalFaltas() * valorDiaria;
  });

  alocacoesCanceladas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CANCELADA),
  );

  totalCanceladas = computed(() => this.alocacoesCanceladas().length);

  multaPorCancelamentos = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;
    return this.totalCanceladas() * (contrato.valorDiariaCobrada || 0);
  });

  // Alocações filtradas pelo mês selecionado
  alocacoesFiltradas = computed(() => {
    const { month, year } = this.selectedMonth();
    return this.alocacoes().filter(a => {
      const d = new Date(a.data + 'T12:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    });
  });

  salarioSimulado = computed(() => {
    const contrato = this.contrato();
    const func = this.funcionario();
    if (!contrato || !func) return 0;

    const alocacoesMes = this.alocacoesFiltradas().filter(
      a => a.statusAlocacao === StatusAlocacao.CONFIRMADA
    );

    // Fallback: sem alocações no mês usa média por tipo de escala
    if (alocacoesMes.length === 0) {
      const diasMedio = func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS ? 15 : 22;
      return (
        diasMedio * (contrato.valorDiariaCobrada || 0) + (contrato.valorBeneficiosExtrasMensal || 0)
      );
    }

    let total = 0;
    for (const aloc of alocacoesMes) {
      total += this.calcularValorAlocacao(aloc);
    }

    return total + (contrato.valorBeneficiosExtrasMensal || 0);
  });

  // Total ganho no mês selecionado (apenas confirmadas)
  totalGanhoMes = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;

    return this.alocacoesFiltradas()
      .filter(a => a.statusAlocacao === StatusAlocacao.CONFIRMADA)
      .reduce((sum, a) => sum + this.calcularValorAlocacao(a), 0);
  });

  salarioMesCompleto = computed(() => {
    const contrato = this.contrato();
    const func = this.funcionario();
    if (!contrato || !func) return 0;
    const diasMedio = func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS ? 15 : 22;
    return (
      diasMedio * (contrato.valorDiariaCobrada || 0) + (contrato.valorBeneficiosExtrasMensal || 0)
    );
  });

  taxaPresenca = computed(() => {
    const total = this.totalAlocacoes();
    if (total === 0) return 100;

    const confirmadas = this.alocacoesConfirmadas();
    return (confirmadas / total) * 100;
  });

  // Alocações por posto
  alocacoesPorPosto = computed(() => {
    const postoMap = new Map<string, number>();

    this.alocacoes().forEach((a) => {
      const count = postoMap.get(a.postoDeTrabalhoId) || 0;
      postoMap.set(a.postoDeTrabalhoId, count + 1);
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
    // Carregar condomínio
    this.condominioService.getById(funcionario.condominioId).subscribe({
      next: (condominio) => this.condominio.set(condominio),
      error: (err) => console.warn('Erro ao carregar condomínio:', err),
    });

    // Carregar contrato
    this.contratoService.getById(funcionario.contratoId).subscribe({
      next: (contrato) => this.contrato.set(contrato),
      error: (err) => console.warn('Erro ao carregar contrato:', err),
    });

    // Carregar alocações
    this.alocacaoService.getAll().subscribe({
      next: (alocacoes) => {
        this.alocacoes.set(alocacoes.filter((a) => a.funcionarioId === funcionario.id));
      },
      error: (err) => console.warn('Erro ao carregar alocações:', err),
    });

    // Carregar postos
    this.postoService.getByCondominioId(funcionario.condominioId).subscribe({
      next: (postos) => this.postos.set(postos),
      error: (err) => console.warn('Erro ao carregar postos:', err),
    });

    this.loading.set(false);
  }

  getPostoNome(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'Posto desconhecido';

    return `${posto.horarioInicio.substring(0, 5)} - ${posto.horarioFim.substring(0, 5)}`;
  }

  getStatusBadgeClass(status: StatusAlocacao): string {
    const classes = {
      [StatusAlocacao.CONFIRMADA]: 'badge-success',
      [StatusAlocacao.CANCELADA]: 'badge-secondary',
      [StatusAlocacao.FALTA_REGISTRADA]: 'badge-danger',
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: StatusAlocacao): string {
    const labels = {
      [StatusAlocacao.CONFIRMADA]: 'Confirmada',
      [StatusAlocacao.CANCELADA]: 'Cancelada',
      [StatusAlocacao.FALTA_REGISTRADA]: 'Falta',
    };
    return labels[status] || 'Desconhecido';
  }

  getTipoLabel(tipo: TipoAlocacao): string {
    const labels = {
      [TipoAlocacao.REGULAR]: 'Regular',
      [TipoAlocacao.DOBRA_PROGRAMADA]: 'Dobra Programada',
      [TipoAlocacao.SUBSTITUICAO]: 'Substituição',
    };
    return labels[tipo] || tipo;
  }

  private isNightShift(posto: PostoDeTrabalho): boolean {
    const hora = parseInt(posto.horarioInicio.substring(0, 2), 10);
    return hora >= 22 || hora < 5;
  }

  // Calcula o valor de uma única alocação (com bônus FDS e noturno)
  calcularValorAlocacao(alocacao: Alocacao): number {
    const contrato = this.contrato();
    if (!contrato) return 0;

    let valor = contrato.valorDiariaCobrada || 0;
    const data = new Date(alocacao.data + 'T12:00:00');
    const diaSemana = data.getDay();

    if (diaSemana === 0) valor *= 2.0;       // +100% domingo
    else if (diaSemana === 6) valor *= 1.5;  // +50% sábado

    const posto = this.postos().find(p => p.id === alocacao.postoDeTrabalhoId);
    if (posto && this.isNightShift(posto)) {
      valor *= 1 + (contrato.percentualAdicionalNoturno || 0) / 100;
    }

    return valor;
  }

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
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
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
