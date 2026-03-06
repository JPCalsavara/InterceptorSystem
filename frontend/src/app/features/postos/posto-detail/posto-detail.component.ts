import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { CondominioService } from '../../../services/condominio.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  PostoDeTrabalho,
  Alocacao,
  Condominio,
  Funcionario,
  Contrato,
  StatusAlocacao,
  TipoAlocacao,
} from '../../../models/index';

@Component({
  selector: 'app-posto-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './posto-detail.component.html',
  styleUrl: './posto-detail.component.scss',
})
export class PostoDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postoService = inject(PostoDeTrabalhoService);
  private alocacaoService = inject(AlocacaoService);
  private condominioService = inject(CondominioService);
  private funcionarioService = inject(FuncionarioService);
  private contratoService = inject(ContratoService);

  posto = signal<PostoDeTrabalho | null>(null);
  alocacoes = signal<Alocacao[]>([]);
  condominio = signal<Condominio | null>(null);
  funcionarios = signal<Funcionario[]>([]);
  contrato = signal<Contrato | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Month selector for allocation history
  selectedMonth = signal({ month: new Date().getMonth(), year: new Date().getFullYear() });

  // Computed properties
  totalAlocacoes = computed(() => this.alocacoes().length);

  alocacoesConfirmadas = computed(
    () => this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA).length,
  );

  faltas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA),
  );

  totalFaltas = computed(() => this.faltas().length);

  alocacoesCanceladas = computed(
    () => this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CANCELADA).length,
  );

  // Funcionários únicos que trabalharam neste posto
  funcionariosParticipantes = computed(() => {
    const funcionarioIds = new Set(this.alocacoes().map((a) => a.funcionarioId));
    return this.funcionarios().filter((f) => funcionarioIds.has(f.id));
  });

  totalFuncionarios = computed(() => this.funcionariosParticipantes().length);

  // Taxa de presença
  taxaPresenca = computed(() => {
    const total = this.totalAlocacoes();
    if (total === 0) return 100;
    const confirmadas = this.alocacoesConfirmadas();
    return (confirmadas / total) * 100;
  });

  // Alocações por tipo
  alocacoesPorTipo = computed(() => {
    const tipos = new Map<TipoAlocacao, number>();

    this.alocacoes().forEach((a) => {
      const count = tipos.get(a.tipoAlocacao) || 0;
      tipos.set(a.tipoAlocacao, count + 1);
    });

    return [
      { tipo: 'Regular', count: tipos.get(TipoAlocacao.REGULAR) || 0, icon: 'R' },
      { tipo: 'Dobra Programada', count: tipos.get(TipoAlocacao.DOBRA_PROGRAMADA) || 0, icon: 'D' },
      { tipo: 'Substituição', count: tipos.get(TipoAlocacao.SUBSTITUICAO) || 0, icon: 'S' },
    ];
  });

  // Ranking de funcionários por alocações confirmadas
  rankingFuncionarios = computed(() => {
    const alocacoesPorFunc = new Map<string, number>();

    this.alocacoes()
      .filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA)
      .forEach((a) => {
        const count = alocacoesPorFunc.get(a.funcionarioId) || 0;
        alocacoesPorFunc.set(a.funcionarioId, count + 1);
      });

    return this.funcionarios()
      .map((f) => ({
        funcionario: f,
        total: alocacoesPorFunc.get(f.id) || 0,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  });

  // Alocações filtradas pelo mês selecionado
  alocacoesFiltradas = computed(() => {
    const { month, year } = this.selectedMonth();
    return this.alocacoes().filter((a) => {
      const d = new Date(a.data + 'T12:00:00');
      return d.getMonth() === month && d.getFullYear() === year;
    });
  });

  // Se este posto recebe bônus noturno
  recebeBonus = computed(() => {
    const p = this.posto();
    const c = this.contrato();
    if (!p || !c) return false;
    return this.calcularProporcaoNoturna(p) > 0 && (c.percentualAdicionalNoturno || 0) > 0;
  });

  // Total ganho no mês selecionado (apenas confirmadas)
  totalGanhoMes = computed(() => {
    if (!this.contrato()) return 0;
    return this.alocacoesFiltradas()
      .filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA)
      .reduce((sum, a) => sum + this.calcularValorAlocacao(a), 0);
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

  private loadRelatedData(posto: PostoDeTrabalho): void {
    // Carregar condomínio
    this.condominioService.getById(posto.condominioId).subscribe({
      next: (condominio) => this.condominio.set(condominio),
      error: (err) => console.warn('Erro ao carregar condomínio:', err),
    });

    // Carregar contrato
    this.contratoService.getById(posto.contratoId).subscribe({
      next: (contrato) => this.contrato.set(contrato),
      error: (err) => console.warn('Erro ao carregar contrato:', err),
    });

    // Carregar alocações
    this.alocacaoService.getAll().subscribe({
      next: (alocacoes) => {
        this.alocacoes.set(alocacoes.filter((a) => a.postoDeTrabalhoId === posto.id));

        // Carregar funcionários das alocações
        const funcionarioIds = [...new Set(alocacoes.map((a) => a.funcionarioId))];
        this.loadFuncionarios(funcionarioIds);
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

  // Proporção de horas noturnas do turno (CLT Art. 73: 22h–05h) — 0.0 a 1.0
  private calcularProporcaoNoturna(posto: PostoDeTrabalho): number {
    const inicio = parseInt(posto.horarioInicio.substring(0, 2), 10);
    const fim = parseInt(posto.horarioFim.substring(0, 2), 10);
    const duracao = inicio > fim ? 24 - inicio + fim : fim - inicio;
    if (duracao === 0) return 0;
    let horasNoturnas = 0;
    for (let i = 0; i < duracao; i++) {
      const hora = (inicio + i) % 24;
      if (hora >= 22 || hora < 5) horasNoturnas++;
    }
    return horasNoturnas / duracao;
  }

  // Calcula o valor de uma alocação (multiplicador FDS + adicional noturno proporcional)
  calcularValorAlocacao(alocacao: Alocacao): number {
    const contrato = this.contrato();
    const posto = this.posto();
    if (!contrato) return 0;

    let valor = contrato.valorDiariaCobrada || 0;
    const data = new Date(alocacao.data + 'T12:00:00');
    const diaSemana = data.getDay();

    if (diaSemana === 0) valor *= 2.0;       // +100% domingo
    else if (diaSemana === 6) valor *= 1.5;  // +50% sábado

    if (posto) {
      const proporcaoNoturna = this.calcularProporcaoNoturna(posto);
      if (proporcaoNoturna > 0) {
        valor *= 1 + proporcaoNoturna * (contrato.percentualAdicionalNoturno || 0);
      }
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

  formatHorario(inicio: string, fim: string): string {
    return `${inicio.substring(0, 5)} - ${fim.substring(0, 5)}`;
  }
}
