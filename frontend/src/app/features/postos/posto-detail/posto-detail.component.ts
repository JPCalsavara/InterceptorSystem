import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { CondominioService } from '../../../services/condominio.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import {
  PostoDeTrabalho,
  Alocacao,
  Condominio,
  Funcionario,
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

  posto = signal<PostoDeTrabalho | null>(null);
  alocacoes = signal<Alocacao[]>([]);
  condominio = signal<Condominio | null>(null);
  funcionarios = signal<Funcionario[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Computed properties
  totalAlocacoes = computed(() => this.alocacoes().length);

  alocacoesConfirmadas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA).length
  );

  faltas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA)
  );

  totalFaltas = computed(() => this.faltas().length);

  alocacoesCanceladas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CANCELADA).length
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
      { tipo: 'Regular', count: tipos.get(TipoAlocacao.REGULAR) || 0, icon: '📅' },
      { tipo: 'Dobra Programada', count: tipos.get(TipoAlocacao.DOBRA_PROGRAMADA) || 0, icon: '⏰' },
      { tipo: 'Substituição', count: tipos.get(TipoAlocacao.SUBSTITUICAO) || 0, icon: '🔄' },
    ];
  });

  // Ranking de funcionários por alocações
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
      .slice(0, 5); // Top 5
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

    // Carregar posto primeiro
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatHorario(inicio: string, fim: string): string {
    return `${inicio.substring(0, 5)} - ${fim.substring(0, 5)}`;
  }
}

