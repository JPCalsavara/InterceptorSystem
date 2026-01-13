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

  // Computeds
  totalAlocacoes = computed(() => this.alocacoes().length);

  alocacoesConfirmadas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA).length
  );

  faltas = computed(() =>
    this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA)
  );

  totalFaltas = computed(() => this.faltas().length);

  prejuizoPorFaltas = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;

    const valorDiaria = contrato.valorDiariaCobrada || 0;
    return this.totalFaltas() * valorDiaria;
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

