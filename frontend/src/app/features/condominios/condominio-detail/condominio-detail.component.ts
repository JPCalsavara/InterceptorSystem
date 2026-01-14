import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CondominioService } from '../../../services/condominio.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Condominio,
  Funcionario,
  PostoDeTrabalho,
  Alocacao,
  Contrato,
  StatusAlocacao,
  StatusFuncionario,
  StatusContrato,
  TipoAlocacao,
} from '../../../models/index';
import { forkJoin } from 'rxjs';

type PeriodoAnalise = 'mensal' | 'trimestral' | 'semestral' | 'anual';

interface MetricaPeriodo {
  titulo: string;
  valor: number;
  unidade?: string;
  variacao?: number; // % em relação ao período anterior
  icone: string;
}

@Component({
  selector: 'app-condominio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './condominio-detail.component.html',
  styleUrl: './condominio-detail.component.scss',
})
export class CondominioDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private condominioService = inject(CondominioService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private alocacaoService = inject(AlocacaoService);
  private contratoService = inject(ContratoService);

  condominio = signal<Condominio | null>(null);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  contratos = signal<Contrato[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtro de período
  periodoSelecionado = signal<PeriodoAnalise>('mensal');
  dataInicio = signal<Date>(this.calcularDataInicio('mensal'));
  dataFim = signal<Date>(new Date());

  // Dados filtrados por período
  alocacoesPeriodo = computed(() => {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    return this.alocacoes().filter((a) => {
      const data = new Date(a.data);
      return data >= inicio && data <= fim;
    });
  });

  funcionariosPeriodo = computed(() => {
    // Funcionários ativos no período
    return this.funcionarios().filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO);
  });

  contratosPeriodo = computed(() => {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    return this.contratos().filter((c) => {
      const dataInicio = new Date(c.dataInicio);
      const dataFim = new Date(c.dataFim);
      // Contrato vigente no período se houver sobreposição
      return dataInicio <= fim && dataFim >= inicio;
    });
  });

  // Métricas computadas do período
  metricasPeriodo = computed<MetricaPeriodo[]>(() => {

    return [
      {
        titulo: 'Receita Total',
        valor: this.receitaPeriodo(),
        unidade: 'BRL',
        icone: '💰',
      },
      {
        titulo: 'Custo Operacional',
        valor: this.custoPeriodo(),
        unidade: 'BRL',
        icone: '💸',
      },
      {
        titulo: 'Lucro Estimado',
        valor: this.lucroPeriodo(),
        unidade: 'BRL',
        icone: '📈',
      },
      {
        titulo: 'Margem de Lucro',
        valor: this.margemLucroPeriodo(),
        unidade: '%',
        icone: '📊',
      },
      {
        titulo: 'Alocações',
        valor: this.alocacoesPeriodo().length,
        unidade: 'total',
        icone: '📅',
      },
      {
        titulo: 'Taxa de Faltas',
        valor: this.taxaFaltasPeriodo(),
        unidade: '%',
        icone: '⚠️',
      },
      {
        titulo: 'Dobras Realizadas',
        valor: this.dobrasRealizadas(),
        unidade: 'total',
        icone: '🔄',
      },
      {
        titulo: 'Custo por Funcionário',
        valor: this.custoMedioPorFuncionario(),
        unidade: 'BRL',
        icone: '👤',
      },
    ];
  });

  // Cálculos financeiros
  receitaPeriodo = computed(() => {
    const multiplicador = this.getMultiplicadorPeriodo();
    return this.contratosPeriodo().reduce(
      (sum, c) => sum + (c.valorTotalMensal || 0) * multiplicador,
      0
    );
  });

  custoPeriodo = computed(() => {
    // Calcula custo baseado no contrato, não nos funcionários individuais
    const multiplicador = this.getMultiplicadorPeriodo();
    const contrato = this.contratoAtual();

    if (!contrato) {
      return 0;
    }

    // Custo = valorTotalMensal - margem de lucro
    const custoMensal = contrato.valorTotalMensal * (1 - (contrato.margemLucroPercentual / 100));
    return custoMensal * multiplicador;
  });

  lucroPeriodo = computed(() => {
    return this.receitaPeriodo() - this.custoPeriodo();
  });

  margemLucroPeriodo = computed(() => {
    const receita = this.receitaPeriodo();
    if (receita === 0) return 0;
    return (this.lucroPeriodo() / receita) * 100;
  });

  taxaFaltasPeriodo = computed(() => {
    const total = this.alocacoesPeriodo().length;
    if (total === 0) return 0;
    const faltas = this.alocacoesPeriodo().filter(
      (a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA
    ).length;
    return (faltas / total) * 100;
  });

  dobrasRealizadas = computed(() => {
    return this.alocacoesPeriodo().filter(
      (a) => a.tipoAlocacao === TipoAlocacao.DOBRA_PROGRAMADA
    ).length;
  });

  substituicoesRealizadas = computed(() => {
    return this.alocacoesPeriodo().filter(
      (a) => a.tipoAlocacao === TipoAlocacao.SUBSTITUICAO
    ).length;
  });

  custoMedioPorFuncionario = computed(() => {
    const total = this.funcionariosPeriodo().length;
    const contrato = this.contratoAtual();

    if (total === 0 || !contrato) return 0;

    // Custo mensal dividido pela quantidade de funcionários
    const custoMensal = contrato.valorTotalMensal * (1 - (contrato.margemLucroPercentual / 100));
    return custoMensal / total;
  });

  // Métricas de contratos
  contratoAtual = computed(() => {
    const now = new Date();
    const ativos = this.contratos().filter((c) => {
      const dataFim = new Date(c.dataFim);
      return dataFim > now && c.status === StatusContrato.ATIVO;
    });
    return (
      ativos.sort((a, b) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime())[0] ||
      null
    );
  });

  diasParaVencimento = computed(() => {
    const contrato = this.contratoAtual();
    if (!contrato) return null;
    const now = new Date();
    const fim = new Date(contrato.dataFim);
    return Math.ceil((fim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  });

  // Métricas de postos
  postosMaisFaltas = computed(() => {
    const faltasPorPosto = new Map<string, number>();

    this.alocacoesPeriodo()
      .filter((a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA)
      .forEach((a) => {
        const count = faltasPorPosto.get(a.postoDeTrabalhoId) || 0;
        faltasPorPosto.set(a.postoDeTrabalhoId, count + 1);
      });

    return this.postos()
      .map((p) => ({
        posto: p,
        faltas: faltasPorPosto.get(p.id) || 0,
      }))
      .filter((item) => item.faltas > 0)
      .sort((a, b) => b.faltas - a.faltas)
      .slice(0, 5); // Top 5
  });

  // Métodos auxiliares
  calcularDataInicio(periodo: PeriodoAnalise): Date {
    const hoje = new Date();
    const data = new Date(hoje);

    switch (periodo) {
      case 'mensal':
        data.setMonth(hoje.getMonth() - 1);
        break;
      case 'trimestral':
        data.setMonth(hoje.getMonth() - 3);
        break;
      case 'semestral':
        data.setMonth(hoje.getMonth() - 6);
        break;
      case 'anual':
        data.setFullYear(hoje.getFullYear() - 1);
        break;
    }

    return data;
  }

  getMultiplicadorPeriodo(): number {
    switch (this.periodoSelecionado()) {
      case 'mensal':
        return 1;
      case 'trimestral':
        return 3;
      case 'semestral':
        return 6;
      case 'anual':
        return 12;
    }
  }

  getPeriodoLabel(): string {
    switch (this.periodoSelecionado()) {
      case 'mensal':
        return 'Último Mês';
      case 'trimestral':
        return 'Último Trimestre';
      case 'semestral':
        return 'Último Semestre';
      case 'anual':
        return 'Último Ano';
    }
  }

  mudarPeriodo(periodo: PeriodoAnalise): void {
    this.periodoSelecionado.set(periodo);
    this.dataInicio.set(this.calcularDataInicio(periodo));
    this.dataFim.set(new Date());
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCondominioData(id);
    }
  }

  loadCondominioData(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    // Carregar condomínio primeiro
    this.condominioService.getById(id).subscribe({
      next: (condominio) => {
        this.condominio.set(condominio);

        // Carregar dados relacionados em paralelo (com tratamento de erro individual)
        this.loadRelatedData(id);
      },
      error: (err) => {
        this.error.set('Erro ao carregar dados do condomínio');
        this.loading.set(false);
        console.error('Erro ao carregar condomínio:', err);
      },
    });
  }

  private loadRelatedData(id: string): void {
    // Carregar funcionários
    this.funcionarioService.getAll().subscribe({
      next: (funcionarios) => {
        this.funcionarios.set(funcionarios.filter((f) => f.condominioId === id));
      },
      error: (err) => console.warn('Erro ao carregar funcionários:', err),
    });

    // Carregar postos
    this.postoService.getByCondominioId(id).subscribe({
      next: (postos) => {
        this.postos.set(postos);

        // Carregar alocações dos postos
        this.alocacaoService.getAll().subscribe({
          next: (alocacoes) => {
            const postoIds = postos.map((p) => p.id);
            this.alocacoes.set(alocacoes.filter((a) => postoIds.includes(a.postoDeTrabalhoId)));
          },
          error: (err) => console.warn('Erro ao carregar alocações:', err),
        });
      },
      error: (err) => console.warn('Erro ao carregar postos:', err),
    });

    // Carregar contratos
    this.contratoService.getAll().subscribe({
      next: (contratos) => {
        this.contratos.set(contratos.filter((c) => c.condominioId === id));
      },
      error: (err) => console.warn('Erro ao carregar contratos:', err),
    });

    // Dados carregados
    this.loading.set(false);
  }

  getStatusLabel(status: StatusAlocacao): string {
    const labels = {
      [StatusAlocacao.CONFIRMADA]: 'Confirmada',
      [StatusAlocacao.CANCELADA]: 'Cancelada',
      [StatusAlocacao.FALTA_REGISTRADA]: 'Falta Registrada',
    };
    return labels[status] || 'Desconhecido';
  }

  getFuncionarioNome(funcionarioId: string): string {
    const func = this.funcionarios().find((f) => f.id === funcionarioId);
    return func?.nome || 'Desconhecido';
  }

  formatHorario(inicio: string, fim: string): string {
    // Remove segundos para exibição (HH:mm)
    const inicioFormatado = inicio.substring(0, 5);
    const fimFormatado = fim.substring(0, 5);
    return `${inicioFormatado} às ${fimFormatado}`;
  }

  getPostoHorario(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'Desconhecido';
    return this.formatHorario(posto.horarioInicio, posto.horarioFim);
  }


  getStatusBadgeClass(status: StatusAlocacao): string {
    const classes = {
      [StatusAlocacao.CONFIRMADA]: 'badge-success',
      [StatusAlocacao.CANCELADA]: 'badge-error',
      [StatusAlocacao.FALTA_REGISTRADA]: 'badge-warning',
    };
    return classes[status] || '';
  }

  getTipoFuncionarioLabel(tipo: string): string {
    const labels: Record<string, string> = {
      CLT: 'CLT',
      FREELANCER: 'Freelancer',
      TERCEIRIZADO: 'Terceirizado',
    };
    return labels[tipo] || tipo;
  }

  getStatusFuncionarioLabel(status: string): string {
    const labels: Record<string, string> = {
      ATIVO: 'Ativo',
      FERIAS: 'Férias',
      AFASTADO: 'Afastado',
      DEMITIDO: 'Demitido',
    };
    return labels[status] || status;
  }

  getStatusFuncionarioBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      ATIVO: 'badge-success',
      FERIAS: 'badge-warning',
      AFASTADO: 'badge-warning',
      DEMITIDO: 'badge-error',
    };
    return classes[status] || 'badge-info';
  }

  getFaltasByFuncionario(funcionarioId: string): number {
    return this.alocacoes().filter(
      (a) =>
        a.funcionarioId === funcionarioId && a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA
    ).length;
  }

  deleteFuncionario(id: string): void {
    if (confirm('Tem certeza que deseja apagar este funcionário?')) {
      this.funcionarioService.delete(id).subscribe({
        next: () => {
          const condominioId = this.condominio()?.id;
          if (condominioId) {
            this.loadCondominioData(condominioId);
          }
        },
        error: (err) => {
          this.error.set('Erro ao apagar funcionário');
          console.error('Erro:', err);
        },
      });
    }
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

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  getUrgenciaClass(dias: number | null): string {
    if (dias === null) return 'urgencia-info';
    if (dias <= 14) return 'urgencia-alta'; // 2 semanas
    if (dias <= 90) return 'urgencia-media'; // 3 meses
    return 'urgencia-baixa';
  }

  getTipoAlocacaoLabel(tipo: TipoAlocacao): string {
    const labels = {
      [TipoAlocacao.REGULAR]: 'Regular',
      [TipoAlocacao.DOBRA_PROGRAMADA]: 'Dobra Programada',
      [TipoAlocacao.SUBSTITUICAO]: 'Substituição',
    };
    return labels[tipo] || 'Desconhecido';
  }

  getTipoAlocacaoBadgeClass(tipo: TipoAlocacao): string {
    const classes = {
      [TipoAlocacao.REGULAR]: 'badge-info',
      [TipoAlocacao.DOBRA_PROGRAMADA]: 'badge-warning',
      [TipoAlocacao.SUBSTITUICAO]: 'badge-secondary',
    };
    return classes[tipo] || 'badge-info';
  }

  // Métodos auxiliares para template
  abs(value: number): number {
    return Math.abs(value);
  }

  formatarTelefone(telefone: string | null | undefined): string {
    if (!telefone) return 'Não informado';

    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '');

    // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numeros.length === 11) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }

    return telefone;
  }

  // Contadores para alocações (evitar filtros no template)
  alocacoesConfirmadas = computed(() => {
    return this.alocacoesPeriodo().filter(
      (a) => a.statusAlocacao === StatusAlocacao.CONFIRMADA
    ).length;
  });

  alocacoesFaltas = computed(() => {
    return this.alocacoesPeriodo().filter(
      (a) => a.statusAlocacao === StatusAlocacao.FALTA_REGISTRADA
    ).length;
  });
}
