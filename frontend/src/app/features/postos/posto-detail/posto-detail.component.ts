import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostoService } from '../../../services/posto.service';
import { DiariaService } from '../../../services/diaria.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ContratoService } from '../../../services/contrato.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import {
  Posto,
  Diaria,
  Cliente,
  Funcionario,
  Contrato,
  Alocacao,
  StatusDiaria,
  TipoDiaria,
} from '../../../models/index';
import { PostoAlocacoesComponent } from '../components/posto-alocacoes/posto-alocacoes.component';
import { PostoMetricasComponent } from '../components/posto-metricas/posto-metricas.component';
import { PostoTiposComponent } from '../components/posto-tipos/posto-tipos.component';

@Component({
  selector: 'app-posto-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PostoAlocacoesComponent, PostoMetricasComponent, PostoTiposComponent],
  templateUrl: './posto-detail.component.html',
  styleUrl: './posto-detail.component.scss',
})
export class PostoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postoService = inject(PostoService);
  private diariaService = inject(DiariaService);
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private contratoService = inject(ContratoService);
  private alocacaoService = inject(AlocacaoService);

  posto = signal<Posto | null>(null);
  diarias = signal<Diaria[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  cliente = signal<Cliente | null>(null);
  funcionarios = signal<Funcionario[]>([]);
  contrato = signal<Contrato | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Month selector for allocation history
  selectedMonth = signal({ month: new Date().getMonth(), year: new Date().getFullYear() });

  // Computed properties
  totalDiarias = computed(() => this.diarias().length);

  diariasConfirmadas = computed(
    () => this.diarias().filter((a) => a.statusDiaria === StatusDiaria.CONFIRMADA).length,
  );

  faltas = computed(() =>
    this.diarias().filter((a) => a.statusDiaria === StatusDiaria.FALTA_INJUSTIFICADA),
  );

  totalFaltas = computed(() => this.faltas().length);

  diariasCanceladas = computed(
    () => this.diarias().filter((a) => a.statusDiaria === StatusDiaria.CANCELADA).length,
  );

  // Funcionários únicos que trabalharam neste posto
  funcionariosParticipantes = computed(() => {
    const funcionarioIds = new Set(this.diarias().map((a) => a.funcionarioId));
    return this.funcionarios().filter((f) => funcionarioIds.has(f.id));
  });

  totalFuncionarios = computed(() => this.funcionariosParticipantes().length);

  // Taxa de presença
  taxaPresenca = computed(() => {
    const total = this.totalDiarias();
    if (total === 0) return 100;
    const confirmadas = this.diariasConfirmadas();
    return (confirmadas / total) * 100;
  });

  // Diárias por tipo
  diariasPorTipo = computed(() => {
    const tipos = new Map<TipoDiaria, number>();

    this.diarias().forEach((a) => {
      const count = tipos.get(a.tipoDiaria) || 0;
      tipos.set(a.tipoDiaria, count + 1);
    });

    return [
      { tipo: 'Regular', count: tipos.get(TipoDiaria.REGULAR) || 0, icon: 'R' },
      { tipo: 'Dobra Programada', count: tipos.get(TipoDiaria.DOBRA_PROGRAMADA) || 0, icon: 'D' },
      { tipo: 'Substituição', count: tipos.get(TipoDiaria.SUBSTITUICAO) || 0, icon: 'S' },
    ];
  });

  // Ranking de funcionários por diárias confirmadas
  rankingFuncionarios = computed(() => {
    const diariasPorFunc = new Map<string, number>();

    this.diarias()
      .filter((a) => a.statusDiaria === StatusDiaria.CONFIRMADA)
      .forEach((a) => {
        const count = diariasPorFunc.get(a.funcionarioId) || 0;
        diariasPorFunc.set(a.funcionarioId, count + 1);
      });

    return this.funcionarios()
      .map((f) => ({
        funcionario: f,
        total: diariasPorFunc.get(f.id) || 0,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  });

  // Diárias filtradas pelo mês selecionado
  diariasFiltradas = computed(() => {
    const { month, year } = this.selectedMonth();
    return this.diarias().filter((a) => {
      const d = new Date(a.data + 'T12:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    });
  });

  // Se este posto tem configurações de contrato para bônus
  recebeBonusContrato = computed(() => {
    const c = this.contrato();
    if (!c) return false;
    return (c.percentualAdicionalNoturno || 0) > 0;
  });

  // Total ganho no mês selecionado (apenas confirmadas)
  totalGanhoMes = computed(() => {
    if (!this.contrato()) return 0;
    return this.diariasFiltradas()
      .filter((a) => a.statusDiaria === StatusDiaria.CONFIRMADA)
      .reduce((sum, a) => sum + this.calcularValorDiaria(a), 0);
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPostoData(id);
    }
  }

  loadPostoData(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.postoService.getById(id).subscribe({
      next: (posto) => {
        this.posto.set(posto);
        this.loadRelatedData(posto);
      },
      error: (err) => {
        this.error.set('Erro ao carregar dados do posto');
        this.loading.set(false);
        console.error('Erro ao carregar posto:', err);
      },
    });
  }

  private loadRelatedData(posto: Posto): void {
    // Carregar cliente
    this.clienteService.getById(posto.clienteId).subscribe({
      next: (cliente) => this.cliente.set(cliente),
      error: (err) => console.warn('Erro ao carregar cliente:', err),
    });

    // Carregar contrato
    this.contratoService.getAll().subscribe({
      next: (contratos) => {
        const contrato = contratos.find((c) => c.clienteId === posto.clienteId && c.status === 'ATIVO');
        if (contrato) this.contrato.set(contrato);
      },
      error: (err) => console.warn('Erro ao carregar contrato:', err),
    });

    // Carregar alocações do posto
    this.alocacaoService.getByPostoId(posto.id).subscribe({
      next: (alocs) => {
        this.alocacoes.set(alocs);
        const alocIds = alocs.map((a) => a.id);

        // Carregar diárias das alocações deste posto
        this.diariaService.getAll().subscribe({
          next: (diarias) => {
            const diariasDoPosto = diarias.filter((d) => alocIds.includes(d.alocacaoId));
            this.diarias.set(diariasDoPosto);

            // Carregar funcionários das diárias
            const funcionarioIds = [...new Set(diariasDoPosto.map((a) => a.funcionarioId))];
            this.loadFuncionarios(funcionarioIds);
          },
          error: (err) => console.warn('Erro ao carregar diárias:', err),
        });
      },
      error: (err) => console.warn('Erro ao carregar alocações:', err),
    });

    this.loading.set(false);
  }

  private loadFuncionarios(ids: string[]): void {
    this.funcionarioService.getAll().subscribe({
      next: (funcionarios) => {
        this.funcionarios.set(funcionarios.filter((f) => ids.includes(f.id)));
      },
      error: (err) => console.warn('Erro ao carregar funcionários:', err),
    });
  }

  trackAloc(index: number, aloc: Alocacao): string {
    return aloc.id;
  }

  diariaRecebeBonus(diaria: Diaria): boolean {
    const alocacao = this.alocacoes().find(a => a.id === diaria.alocacaoId);
    return !!alocacao?.temHorarioNoturno && this.recebeBonusContrato();
  }

  // Calcula o valor de uma diária (multiplicador FDS + adicional noturno proporcional)
  calcularValorDiaria(diaria: Diaria): number {
    const contrato = this.contrato();
    if (!contrato) return 0;

    let valor = contrato.valorDiariaCobrada || 0;
    const data = new Date(diaria.data + 'T12:00:00');
    const diaSemana = data.getDay();

    if (diaSemana === 0) valor *= 2.0;       // +100% domingo
    else if (diaSemana === 6) valor *= 1.5;  // +50% sábado

    if (this.diariaRecebeBonus(diaria)) {
      valor *= 1 + (contrato.percentualAdicionalNoturno || 0);
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
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    const { month, year } = this.selectedMonth();
    return `${months[month]} ${year}`;
  }

  getFuncionarioNome(funcionarioId: string): string {
    const func = this.funcionarios().find((f) => f.id === funcionarioId);
    return func?.nome || 'Desconhecido';
  }

  getStatusBadgeClass(status: StatusDiaria): string {
    const classes = {
      [StatusDiaria.CONFIRMADA]: 'badge-success',
      [StatusDiaria.CANCELADA]: 'badge-secondary',
      [StatusDiaria.FALTA_INJUSTIFICADA]: 'badge-danger',
      [StatusDiaria.FALTA_JUSTIFICADA]: 'badge-warning',
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: StatusDiaria): string {
    const labels = {
      [StatusDiaria.CONFIRMADA]: 'Confirmada',
      [StatusDiaria.CANCELADA]: 'Cancelada',
      [StatusDiaria.FALTA_INJUSTIFICADA]: 'Falta Injustificada',
      [StatusDiaria.FALTA_JUSTIFICADA]: 'Falta Justificada',
    };
    return labels[status] || 'Desconhecido';
  }

  getTipoLabel(tipo: TipoDiaria): string {
    const labels = {
      [TipoDiaria.REGULAR]: 'Regular',
      [TipoDiaria.DOBRA_PROGRAMADA]: 'Dobra Programada',
      [TipoDiaria.SUBSTITUICAO]: 'Substituição',
    };
    return labels[tipo] || 'Desconhecido';
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

  formatNome(nome: string, cidade: string): string {
    return `${nome} - ${cidade}`;
  }
}
