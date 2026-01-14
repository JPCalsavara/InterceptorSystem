import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CondominioService } from '../../services/condominio.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../services/alocacao.service';
import { ContratoService } from '../../services/contrato.service';
import {
  Condominio,
  Funcionario,
  PostoDeTrabalho,
  Alocacao,
  Contrato,
  StatusContrato,
  StatusAlocacao,
  StatusFuncionario,
} from '../../models/index';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  stats: {
    label: string;
    value: number | string;
  };
  loading?: boolean;
}

interface MetricaFinanceira {
  titulo: string;
  valor: number;
  subtitulo: string;
  icone: string;
  cor: string;
  tendencia?: 'up' | 'down' | 'neutral';
}

interface ContratoProximoVencimento {
  id: string;
  condominioNome: string;
  dataFim: string;
  diasRestantes: number;
  valorTotalMensal: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private condominioService = inject(CondominioService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private alocacaoService = inject(AlocacaoService);
  private contratoService = inject(ContratoService);

  condominios = signal<Condominio[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  contratos = signal<Contrato[]>([]);

  loading = signal(true);

  // Cards com dados dinâmicos
  cards = computed<DashboardCard[]>(() => [
    {
      title: 'Condomínios',
      description: 'Gerenciar condomínios cadastrados',
      icon: '🏢',
      route: '/condominios',
      color: '#2196F3',
      stats: {
        label: 'Ativos',
        value: this.condominios().filter((c) => c.ativo).length,
      },
    },
    {
      title: 'Funcionários',
      description: 'Gerenciar vigilantes e porteiros',
      icon: '👥',
      route: '/funcionarios',
      color: '#4CAF50',
      stats: {
        label: 'Ativos',
        value: this.funcionarios().filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO).length,
      },
    },
    {
      title: 'Postos de Trabalho',
      description: 'Gerenciar postos e turnos',
      icon: '📍',
      route: '/postos',
      color: '#FF9800',
      stats: {
        label: 'Cadastrados',
        value: this.postos().length,
      },
    },
    {
      title: 'Alocações',
      description: 'Escala semanal e mensal',
      icon: '📅',
      route: '/alocacoes',
      color: '#9C27B0',
      stats: {
        label: 'Confirmadas',
        value: this.alocacoes().filter((a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA)
          .length,
      },
    },
    {
      title: 'Contratos',
      description: 'Gerenciar contratos ativos',
      icon: '📄',
      route: '/contratos',
      color: '#F44336',
      stats: {
        label: 'Vigentes',
        value: this.contratos().filter((c) => c.status === StatusContrato.ATIVO).length,
      },
    },
  ]);

  // Métricas financeiras
  metricasFinanceiras = computed<MetricaFinanceira[]>(() => {
    const contratosVigentes = this.contratos().filter((c) => c.status === StatusContrato.ATIVO);

    const receitaMensal = contratosVigentes.reduce(
      (sum, c) => sum + c.valorTotalMensal,
      0
    );

    const totalFuncionarios = this.funcionarios().filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO).length;
    const totalCondominios = this.condominios().filter((c) => c.ativo).length;

    return [
      {
        titulo: 'Receita Mensal',
        valor: receitaMensal,
        subtitulo: `${contratosVigentes.length} contratos ativos`,
        icone: '💰',
        cor: '#4CAF50',
        tendencia: 'up',
      },
      {
        titulo: 'Funcionários Ativos',
        valor: totalFuncionarios,
        subtitulo: 'Porteiros e vigilantes',
        icone: '👥',
        cor: '#2196F3',
      },
      {
        titulo: 'Condomínios Ativos',
        valor: totalCondominios,
        subtitulo: 'Em operação',
        icone: '🏢',
        cor: '#FF9800',
      },
      {
        titulo: 'Postos Cadastrados',
        valor: this.postos().length,
        subtitulo: 'Turnos disponíveis',
        icone: '📍',
        cor: '#9C27B0',
      },
    ];
  });

  // Contratos próximos ao vencimento
  contratosProximosVencimento = computed<ContratoProximoVencimento[]>(() => {
    const hoje = new Date();
    const em30Dias = new Date();
    em30Dias.setDate(hoje.getDate() + 30);

    return this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO)
      .map((c) => {
        const dataFim = new Date(c.dataFim);
        const diasRestantes = Math.ceil(
          (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
        );

        const condominio = this.condominios().find((cond) => cond.id === c.condominioId);

        return {
          id: c.id,
          condominioNome: condominio?.nome || 'Desconhecido',
          dataFim: c.dataFim,
          diasRestantes,
          valorTotalMensal: c.valorTotalMensal,
        };
      })
      .filter((c) => c.diasRestantes <= 30 && c.diasRestantes > 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);

    Promise.all([
      this.loadCondominios(),
      this.loadFuncionarios(),
      this.loadPostos(),
      this.loadAlocacoes(),
      this.loadContratos(),
    ]).finally(() => this.loading.set(false));
  }

  loadCondominios(): Promise<void> {
    return new Promise((resolve) => {
      this.condominioService.getAll().subscribe({
        next: (data) => {
          this.condominios.set(data);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadFuncionarios(): Promise<void> {
    return new Promise((resolve) => {
      this.funcionarioService.getAll().subscribe({
        next: (data) => {
          this.funcionarios.set(data);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadPostos(): Promise<void> {
    return new Promise((resolve) => {
      this.postoService.getAll().subscribe({
        next: (data) => {
          this.postos.set(data);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadAlocacoes(): Promise<void> {
    return new Promise((resolve) => {
      this.alocacaoService.getAll().subscribe({
        next: (data) => {
          this.alocacoes.set(data);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadContratos(): Promise<void> {
    return new Promise((resolve) => {
      this.contratoService.getAll().subscribe({
        next: (data) => {
          this.contratos.set(data);
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }

  getUrgenciaClass(diasRestantes: number): string {
    if (diasRestantes <= 7) return 'urgencia-alta';
    if (diasRestantes <= 15) return 'urgencia-media';
    return 'urgencia-baixa';
  }
}
