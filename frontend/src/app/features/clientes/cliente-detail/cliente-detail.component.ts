import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { DiariaService } from '../../../services/diaria.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Cliente,
  Funcionario,
  Posto,
  Alocacao,
  Diaria,
  Contrato,
  StatusDiaria,
  StatusFuncionario,
  StatusContrato,
  TipoDiaria,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';
import { forkJoin } from 'rxjs';
import { DiariaListComponent } from '../../diarias/diaria-list/diaria-list.component';

type PeriodoAnalise = 'mensal' | 'trimestral' | 'semestral' | 'anual';

interface MetricaPeriodo {
  titulo: string;
  valor: number;
  unidade?: string;
  variacao?: number; // % em relação ao período anterior
  icone: string;
}

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DiariaListComponent],
  templateUrl: './cliente-detail.component.html',
  styleUrl: './cliente-detail.component.scss',
})
export class ClienteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private diariaService = inject(DiariaService);
  private contratoService = inject(ContratoService);
  private alocacaoService = inject(AlocacaoService);

  cliente = signal<Cliente | null>(null);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<Posto[]>([]);
  diarias = signal<Diaria[]>([]);
  contratos = signal<Contrato[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtro de período
  periodoSelecionado = signal<PeriodoAnalise>('mensal');
  dataInicio = signal<Date>(this.calcularDataInicio('mensal'));
  dataFim = signal<Date>(new Date());

  // Dados filtrados por período
  diariasPeriodo = computed(() => {
    const inicio = this.dataInicio();
    const fim = this.dataFim();
    return this.diarias().filter((a) => {
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
        titulo: 'Diárias',
        valor: this.diariasPeriodo().length,
        unidade: 'total',
        icone: 'calendar-days',
      },
      {
        titulo: 'Taxa de Faltas',
        valor: this.taxaFaltasPeriodo(),
        unidade: '%',
        icone: 'exclamation-triangle',
      },
      {
        titulo: 'Dobras Realizadas',
        valor: this.dobrasRealizadas(),
        unidade: 'total',
        icone: 'arrow-path',
      },
      {
        titulo: 'Custo por Funcionário',
        valor: this.custoMedioPorFuncionario(),
        unidade: 'BRL',
        icone: 'user',
      },
    ];
  });

  // Cálculos financeiros
  receitaPeriodo = computed(() => {
    const multiplicador = this.getMultiplicadorPeriodo();
    return this.contratosPeriodo().reduce(
      (sum, c) => sum + (c.valorTotalMensal || 0) * multiplicador,
      0,
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
    const custoMensal = contrato.valorTotalMensal * (1 - contrato.margemLucroPercentual / 100);
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
    const total = this.diariasPeriodo().length;
    if (total === 0) return 0;
    const faltas = this.diariasPeriodo().filter(
      (a) => a.statusDiaria === StatusDiaria.FALTA_REGISTRADA,
    ).length;
    return (faltas / total) * 100;
  });

  dobrasRealizadas = computed(() => {
    return this.diariasPeriodo().filter((a) => a.tipoDiaria === TipoDiaria.DOBRA_PROGRAMADA)
      .length;
  });

  substituicoesRealizadas = computed(() => {
    return this.diariasPeriodo().filter((a) => a.tipoDiaria === TipoDiaria.SUBSTITUICAO)
      .length;
  });

  custoMedioPorFuncionario = computed(() => {
    const total = this.funcionariosPeriodo().length;
    const contrato = this.contratoAtual();

    if (total === 0 || !contrato) return 0;

    // Custo mensal dividido pela quantidade de funcionários
    const custoMensal = contrato.valorTotalMensal * (1 - contrato.margemLucroPercentual / 100);
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

    this.diariasPeriodo()
      .filter(
        (a) =>
          a.statusDiaria === StatusDiaria.FALTA_REGISTRADA ||
          a.statusDiaria === StatusDiaria.CANCELADA,
      )
      .forEach((a) => {
        const aloc = this.alocacoes().find(al => al.id === a.alocacaoId);
        if (aloc) {
          const count = faltasPorPosto.get(aloc.postoId) || 0;
          faltasPorPosto.set(aloc.postoId, count + 1);
        }
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
      this.loadCliente(id);
    }
  }

  loadCliente(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.clienteService.getById(id).subscribe({
      next: (cliente) => {
        this.cliente.set(cliente);

        // Carregar dados relacionados em paralelo (com tratamento de erro individual)
        this.loadRelatedData(id);
      },
      error: (err) => {
        this.error.set('Erro ao carregar dados do cliente');
        this.loading.set(false);
        console.error('Erro ao carregar cliente:', err);
      },
    });
  }

  private loadRelatedData(id: string): void {
    // Carregar funcionários
    this.funcionarioService.getByClienteId(id).subscribe({
      next: (funcionarios) => {
        this.funcionarios.set(funcionarios);
      },
      error: (err) => console.warn('Erro ao carregar funcionários:', err),
    });

    // Carregar postos
    this.postoService.getByClienteId(id).subscribe({
      next: (postos) => {
        this.postos.set(postos);

        // Carregar alocações para este cliente (via postos)
        this.alocacaoService.getAll().subscribe({
          next: (alocacoes) => {
            const postoIds = postos.map((p) => p.id);
            const filteredAlocs = alocacoes.filter(al => postoIds.includes(al.postoId));
            this.alocacoes.set(filteredAlocs);
            
            const alocIds = filteredAlocs.map(al => al.id);
            // Carregar diárias
            this.diariaService.getAll().subscribe({
              next: (diarias) => {
                this.diarias.set(diarias.filter((a) => alocIds.includes(a.alocacaoId)));
              },
              error: (err) => console.warn('Erro ao carregar diárias:', err),
            });
          },
          error: (err) => console.warn('Erro ao carregar alocações:', err),
        });
      },
      error: (err) => console.warn('Erro ao carregar postos:', err),
    });

    // Carregar contratos
    this.contratoService.getAll().subscribe({
      next: (contratos) => {
        this.contratos.set(contratos.filter((c) => c.clienteId === id));
      },
      error: (err) => console.warn('Erro ao carregar contratos:', err),
    });

    // Dados carregados
    this.loading.set(false);
  }

  getStatusLabel(status: StatusDiaria): string {
    const labels = {
      [StatusDiaria.CONFIRMADA]: 'Confirmada',
      [StatusDiaria.CANCELADA]: 'Cancelada',
      [StatusDiaria.FALTA_REGISTRADA]: 'Falta Registrada',
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

  getPostoNome(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'Desconhecido';
    return `${posto.nome} - ${posto.cidade}`;
  }

  getStatusBadgeClass(status: StatusDiaria): string {
    const classes = {
      [StatusDiaria.CONFIRMADA]: 'badge-success',
      [StatusDiaria.CANCELADA]: 'badge-error',
      [StatusDiaria.FALTA_REGISTRADA]: 'badge-warning',
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
    return this.diarias().filter(
      (a) =>
        a.funcionarioId === funcionarioId &&
        (a.statusDiaria === StatusDiaria.FALTA_REGISTRADA ||
          a.statusDiaria === StatusDiaria.CANCELADA),
    ).length;
  }

  deleteFuncionario(id: string): void {
    if (confirm('Tem certeza que deseja apagar este funcionário?')) {
      this.funcionarioService.delete(id).subscribe({
        next: () => {
          const clienteId = this.cliente()?.id;
          if (clienteId) {
            this.loadCliente(clienteId);
          }
        },
        error: (err) => {
          this.error.set('Erro ao apagar funcionário');
          console.error('Erro:', err);
        },
      });
    }
  }

  // Computed map: funcionarioId → salário real do mês atual
  // Usa computed() para garantir reatividade correta quando contratos/diárias/postos carregam
  salariosPorFuncionario = computed(() => {
    const map = new Map<string, number>();
    const contratos = this.contratos();
    const diarias = this.diarias();
    const postos = this.postos();

    if (contratos.length === 0) return map; // aguarda contratos

    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    for (const func of this.funcionarios()) {
      const contrato = contratos.find((c) => c.id === func.contratoId);
      if (!contrato) {
        map.set(func.id, func.salarioTotal || 0);
        continue;
      }

      const diariasConfirmadas = diarias.filter((a) => {
        if (a.funcionarioId !== func.id) return false;
        if (a.statusDiaria !== StatusDiaria.CONFIRMADA) return false;
        const d = new Date(a.data + 'T12:00:00');
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      });

      let totalDiarias = 0;
      for (const aloc of diariasConfirmadas) {
        let valor = contrato.valorDiariaCobrada || 0;
        const diaSemana = new Date(aloc.data + 'T12:00:00').getDay();
        if (diaSemana === 0) valor *= 2.0;
        else if (diaSemana === 6) valor *= 1.5;

        const alocacao = this.alocacoes().find((al) => al.id === aloc.alocacaoId);
        if (alocacao) {
          const proporcaoNoturna = alocacao.temHorarioNoturno ? 1.0 : 0;
          if (proporcaoNoturna > 0) {
            valor *= 1 + proporcaoNoturna * (contrato.percentualAdicionalNoturno || 0);
          }
        }
        totalDiarias += valor;
      }

      const total = totalDiarias + (contrato.valorBeneficiosExtrasMensal || 0);
      console.log(
        `[salarios] ${func.nome}: ${diariasConfirmadas.length} alocs confirmadas → R$${total.toFixed(2)}`,
      );
      map.set(func.id, total);
    }

    console.log(
      `[salarios] contratos:${contratos.length} diarias:${diarias.length} postos:${postos.length}`,
    );
    return map;
  });

  private calcularProporcaoNoturna(alocacaoId: string): number {
    const aloc = this.alocacoes().find(a => a.id === alocacaoId);
    return aloc && aloc.temHorarioNoturno ? 1.0 : 0;
  }

  // Custo noturno adicional do período (embutido no custoPeriodo, exposto para exibição)
  custoNoturnoPeriodo = computed(() => {
    const contrato = this.contratoAtual();
    if (!contrato || !contrato.percentualAdicionalNoturno) return 0;

    const diariasConf = this.diariasPeriodo().filter(
      (a) => a.statusDiaria === StatusDiaria.CONFIRMADA,
    );

    let totalAdicional = 0;
    for (const aloc of diariasConf) {
      const baseValor = contrato.valorDiariaCobrada || 0;
      const proporcao = this.calcularProporcaoNoturna(aloc.alocacaoId);
      totalAdicional += baseValor * proporcao * (contrato.percentualAdicionalNoturno || 0);
    }
    return totalAdicional;
  });

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

  getTipoDiariaLabel(tipo: TipoDiaria): string {
    const labels = {
      [TipoDiaria.REGULAR]: 'Regular',
      [TipoDiaria.DOBRA_PROGRAMADA]: 'Dobra Programada',
      [TipoDiaria.SUBSTITUICAO]: 'Substituição',
    };
    return labels[tipo] || 'Desconhecido';
  }

  getTipoDiariaBadgeClass(tipo: TipoDiaria): string {
    const classes = {
      [TipoDiaria.REGULAR]: 'badge-info',
      [TipoDiaria.DOBRA_PROGRAMADA]: 'badge-warning',
      [TipoDiaria.SUBSTITUICAO]: 'badge-secondary',
    };
    return classes[tipo] || 'badge-info';
  }

  // Métodos auxiliares para template
  getContratoDescricao(contratoId: string): string {
    const contrato = this.contratos().find((c) => c.id === contratoId);
    return contrato?.descricao || 'Sem contrato';
  }

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

  // Contadores para diárias (evitar filtros no template)
  diariasConfirmadas = computed(() => {
    return this.diariasPeriodo().filter((a) => a.statusDiaria === StatusDiaria.CONFIRMADA)
      .length;
  });

  diariasFaltas = computed(() => {
    return this.diariasPeriodo().filter(
      (a) => a.statusDiaria === StatusDiaria.FALTA_REGISTRADA,
    ).length;
  });

  diariasCancelamentos = computed(() => {
    return this.diariasPeriodo().filter((a) => a.statusDiaria === StatusDiaria.CANCELADA)
      .length;
  });
}
