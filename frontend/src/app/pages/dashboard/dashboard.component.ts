import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { switchMap, catchError, of, forkJoin } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import { ContratoFinanceiroUiService } from '../../services/contrato-financeiro-ui.service';
import {
  Cliente,
  Funcionario,
  Posto,
  Diaria,
  Contrato,
  StatusContrato,
  StatusDiaria,
  StatusFuncionario,
  ContratoResumoFinanceiro,
  CalculoValorTotalOutput,
  DiariaSubstituicaoDto,
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
  isCurrency?: boolean;
  tendencia?: 'up' | 'down' | 'neutral';
}

interface ContratoProximoVencimento {
  id: string;
  clienteNome: string;
  dataFim: string;
  diasRestantes: number;
  valorTotalMensal: number;
}

interface ClienteCard {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  ativo: boolean;
  faturamentoMensal: number;
  custoEstimado: number;
  lucroEstimado: number;
  margemLucro: number;
  quantidadeFuncionarios: number;
  numeroDePostos: number | null;
  dataFimContrato: string | null;
  diasParaVencimento: number | null;
  statusContrato: StatusContrato | null;
}

interface FuncionarioRanking {
  id: string;
  nome: string;
  clienteNome: string;
  tipoFuncionario: string;
  diariasNoMes: number;
  faltasNoMes: number;
  taxaPresenca: number;
  custoMensal?: number;
}

interface DadosMensais {
  mes: string;
  mesAbrev: string;
  custoOperacional: number;
  faturamento: number;
  lucro: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private diariaService = inject(DiariaService);
  private contratoService = inject(ContratoService);
  private financeiroUiService = inject(ContratoFinanceiroUiService);

  ultimasSubstituicoes = signal<DiariaSubstituicaoDto[]>([]);
  clientes = signal<Cliente[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<Posto[]>([]);
  diarias = signal<Diaria[]>([]);
  contratos = signal<Contrato[]>([]);
  calculosDetalhados = signal<Map<string, unknown>>(new Map());
  resumosFinanceiros = signal<Map<string, ContratoResumoFinanceiro>>(new Map());

  loading = signal(true);

  // Mês atual para filtrar diárias
  private get mesAtual(): { inicio: Date; fim: Date } {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    return { inicio, fim };
  }

  // Métricas financeiras
  metricasFinanceiras = computed(() => {
    const contratosVigentes = this.contratos().filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    const faturamentoBruto = contratosVigentes.reduce(
      (sum, c) => sum + this.getFaturamentoDetalhado(c),
      0,
    );

    const lucroProjetado = contratosVigentes.reduce((sum, c) => sum + this.getLucroDetalhado(c), 0);

    const custoOperacional = contratosVigentes.reduce(
      (sum, c) => sum + this.getCustoDetalhado(c),
      0,
    );

    const totalFuncionarios = this.funcionarios().filter(
      (f) => f.statusFuncionario === StatusFuncionario.ATIVO,
    ).length;

    return [
      {
        titulo: 'Faturamento Bruto',
        valor: faturamentoBruto,
        subtitulo: `${contratosVigentes.length} contrato${contratosVigentes.length !== 1 ? 's' : ''} vigente${contratosVigentes.length !== 1 ? 's' : ''}`,
        icone: 'currency-dollar',
        cor: '#4CAF50',
        isCurrency: true,
        tendencia: 'up' as const,
      },
      {
        titulo: 'Lucro Projetado',
        valor: lucroProjetado,
        subtitulo: 'Soma das margens de lucro',
        icone: 'arrow-trending-up',
        cor: '#2196F3',
        isCurrency: true,
        tendencia: 'up' as const,
      },
      {
        titulo: 'Custo Operacional',
        valor: custoOperacional,
        subtitulo: 'Folha + impostos + coberturas',
        icone: 'arrow-trending-down',
        cor: '#FF5722',
        isCurrency: true,
      },
    ];
  });

  // Cards de cliente com dados financeiros do contrato
  clienteCards = computed<ClienteCard[]>(() => {
    return this.clientes()
      .map((cond) => {
        const contrato = this.contratos().find(
          (c) =>
            c.clienteId === cond.id &&
            (c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE),
        );
        const funcionariosCond = this.funcionarios().filter(
          (f) => f.clienteId === cond.id && f.statusFuncionario === StatusFuncionario.ATIVO,
        );

        let diasParaVencimento: number | null = null;
        if (contrato) {
          const hoje = new Date();
          const dataFim = new Date(contrato.dataFim);
          diasParaVencimento = Math.ceil(
            (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
          );
        }

        // Custo e lucro derivados diretamente das margens do contrato (top-down)
        // Evita replicar a fórmula do backend; usa os percentuais já calculados
        const custoEstimado = contrato ? this.getCustoDetalhado(contrato) : 0;

        const lucroEstimado = contrato ? this.getLucroDetalhado(contrato) : 0;

        // margemLucroPercentual vem em 0-1 do backend; getLucroClass() espera 0-100
        const margemLucro = contrato ? contrato.margemLucroPercentual * 100 : 0;

        return {
          id: cond.id,
          nome: cond.nome,
          cidade: cond.cidade,
          estado: cond.estado,
          ativo: cond.ativo,
          faturamentoMensal: contrato ? this.getFaturamentoDetalhado(contrato) : 0,
          custoEstimado,
          lucroEstimado,
          margemLucro,
          quantidadeFuncionarios: funcionariosCond.length,
          numeroDePostos: contrato?.numeroDePostos ?? null,
          dataFimContrato: contrato?.dataFim ?? null,
          diasParaVencimento,
          statusContrato: contrato?.status ?? null,
        };
      })
      .sort((a, b) => b.faturamentoMensal - a.faturamentoMensal);
  });

  // Ranking de funcionários no mês atual
  funcionariosRanking = computed<FuncionarioRanking[]>(() => {
    const { inicio, fim } = this.mesAtual;

    const diariasMes = this.diarias().filter((a) => {
      const data = new Date(a.data);
      return data >= inicio && data <= fim;
    });

    return this.funcionarios()
      .filter((f) => f.statusFuncionario === StatusFuncionario.ATIVO)
      .map((func) => {
        const diariasFuncionario = diariasMes.filter((a) => a.funcionarioId === func.id);
        const confirmadas = diariasFuncionario.filter(
          (a) => a.statusDiaria === StatusDiaria.CONFIRMADA,
        ).length;
        const faltas = diariasFuncionario.filter(
          (a) => a.statusDiaria === StatusDiaria.FALTA_INJUSTIFICADA,
        ).length;
        const total = diariasFuncionario.length;
        const taxaPresenca = total > 0 ? Math.round((confirmadas / total) * 100) : 100;

        const cliente = this.clientes().find((c) => c.id === func.clienteId);

        return {
          id: func.id,
          nome: func.nome,
          clienteNome: cliente?.nome ?? 'Desconhecido',
          tipoFuncionario: func.tipoFuncionario,
          diariasNoMes: total,
          faltasNoMes: faltas,
          taxaPresenca,
          custoMensal: func.custoMensalReal ?? func.custoMensalEstimado,
        };
      })
      .filter((f) => f.diariasNoMes > 0)
      .sort((a, b) => b.diariasNoMes - a.diariasNoMes);
  });

  // Top 5 com mais trabalhos
  topTrabalhadores = computed(() => this.funcionariosRanking().slice(0, 5));

  // Top 5 com mais faltas
  topFaltas = computed(() =>
    [...this.funcionariosRanking()]
      .filter((f) => f.faltasNoMes > 0)
      .sort((a, b) => b.faltasNoMes - a.faltasNoMes)
      .slice(0, 5),
  );

  // Contratos próximos ao vencimento
  contratosProximosVencimento = computed(() => {
    const hoje = new Date();
    return this.contratos()
      .filter((c) => c.status === StatusContrato.ATIVO)
      .map((c) => {
        const dataFim = new Date(c.dataFim);
        const diasRestantes = Math.ceil(
          (dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
        );
        const cliente = this.clientes().find((cond) => cond.id === c.clienteId);
        return {
          id: c.id,
          clienteNome: cliente?.nome || 'Desconhecido',
          dataFim: c.dataFim,
          diasRestantes,
          valorTotalMensal: this.getFaturamentoDetalhado(c),
        };
      })
      .filter((c) => c.diasRestantes <= 30 && c.diasRestantes > 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  });

  // Dados dos últimos 6 meses
  dadosUltimos6Meses = computed<DadosMensais[]>(() => {
    const resultado: DadosMensais[] = [];
    const hoje = new Date();

    // Gera os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesNome = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(data);
      const mesAbrev = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data);

      // Para simplificar, vamos usar os valores atuais dos contratos ativos
      // Em um sistema real, você precisaria de dados históricos
      const contratosVigentes = this.contratos().filter(
        (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
      );

      const faturamento = contratosVigentes.reduce(
        (sum, c) => sum + this.getFaturamentoDetalhado(c),
        0,
      );
      const custoOperacional = contratosVigentes.reduce(
        (sum, c) => sum + this.getCustoDetalhado(c),
        0,
      );
      const lucro = contratosVigentes.reduce((sum, c) => sum + this.getLucroDetalhado(c), 0);

      resultado.push({
        mes: mesNome.charAt(0).toUpperCase() + mesNome.slice(1),
        mesAbrev: mesAbrev.charAt(0).toUpperCase() + mesAbrev.slice(1),
        custoOperacional,
        faturamento,
        lucro,
      });
    }

    return resultado;
  });

  // Valor máximo para normalizar o gráfico
  valorMaximoGrafico = computed(() => {
    const valores = this.dadosUltimos6Meses().flatMap((d) => [
      d.custoOperacional,
      d.faturamento,
      d.lucro,
    ]);
    return Math.max(...valores, 1);
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);
    Promise.all([
      this.loadClientes(),
      this.loadFuncionarios(),
      this.loadPostos(),
      this.loadDiarias(),
      this.loadContratos(),
      this.loadSubstituicoes(),
    ]).finally(() => this.loading.set(false));
  }

  loadSubstituicoes(): Promise<void> {
    return new Promise((resolve) => {
      this.diariaService.getSubstituicoes().subscribe({
        next: (subs) => {
          this.ultimasSubstituicoes.set(subs.slice(0, 5));
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadClientes(): Promise<void> {
    return new Promise((resolve) => {
      this.clienteService.getAll().subscribe({
        next: (data) => {
          this.clientes.set(data);
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

  loadDiarias(): Promise<void> {
    return new Promise((resolve) => {
      this.diariaService.getAll().subscribe({
        next: (data) => {
          this.diarias.set(data);
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
          this.loadResumosFinanceiros();
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  loadResumosFinanceiros(): void {
    const contratosVigentes = this.contratos().filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    if (contratosVigentes.length === 0) {
      this.resumosFinanceiros.set(new Map());
      this.loadCalculosDetalhados();
      return;
    }

    const { inicio, fim } = this.mesAtual;
    const ano = inicio.getFullYear();
    const mes = fim.getMonth() + 1;

    const requests = contratosVigentes.map((contrato) =>
      this.diariaService
        .getResumoFinanceiroByContrato(contrato.id, ano, mes)
        .pipe(catchError(() => of(null))),
    );

    forkJoin(requests).subscribe((resultados) => {
      const novoMapa = new Map<string, ContratoResumoFinanceiro>();
      resultados.forEach((resultado, index) => {
        if (resultado !== null) {
          novoMapa.set(contratosVigentes[index].id, resultado);
        }
      });
      this.resumosFinanceiros.set(novoMapa);
      this.loadCalculosDetalhados();
    });
  }

  loadCalculosDetalhados(): void {
    const contratosVigentes = this.contratos().filter(
      (c) => c.status === StatusContrato.ATIVO || c.status === StatusContrato.PENDENTE,
    );

    if (contratosVigentes.length === 0) {
      this.calculosDetalhados.set(new Map());
      return;
    }

    this.financeiroUiService
      .carregarCalculosDetalhados$(
        contratosVigentes,
        this.resumosFinanceiros(),
        this.getFuncionariosPorClienteMap(),
      )
      .subscribe({
        next: (mapa) => this.calculosDetalhados.set(mapa),
        error: () => this.calculosDetalhados.set(new Map()),
      });
  }

  private getFuncionariosPorClienteMap(): Map<string, number> {
    const mapa = new Map<string, number>();
    this.funcionarios().forEach((funcionario) => {
      mapa.set(funcionario.clienteId, (mapa.get(funcionario.clienteId) ?? 0) + 1);
    });
    return mapa;
  }

  getTendenciaIcon(tendencia: string): string {
    if (tendencia === 'up') return '↗';
    if (tendencia === 'down') return '↘';
    return '→';
  }

  private getFaturamentoDetalhado(contrato: Contrato): number {
    return this.financeiroUiService.getFaturamentoDetalhado(
      contrato,
      this.calculosDetalhados() as Map<string, any>,
    );
  }

  private getCustoDetalhado(contrato: Contrato): number {
    return this.financeiroUiService.getCustoDetalhado(
      contrato,
      this.calculosDetalhados() as Map<string, any>,
    );
  }

  private getLucroDetalhado(contrato: Contrato): number {
    return this.financeiroUiService.getLucroDetalhado(
      contrato,
      this.calculosDetalhados() as Map<string, any>,
    );
  }

  private normalizarPercentualContrato(valor: number | null | undefined): number {
    const safe = Number(valor ?? 0);
    if (!Number.isFinite(safe) || safe < 0) return 0;
    return safe > 1 ? safe / 100 : safe;
  }

  getMesAtualLabel(): string {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
  }

  getUrgenciaClass(diasRestantes: number): string {
    if (diasRestantes <= 7) return 'urgencia-alta';
    if (diasRestantes <= 15) return 'urgencia-media';
    return 'urgencia-baixa';
  }

  getVencimentoClass(dias: number | null): string {
    if (dias === null) return 'sem-contrato';
    if (dias < 0) return 'vencido';
    if (dias <= 7) return 'urgencia-alta';
    if (dias <= 30) return 'urgencia-media';
    return 'ok';
  }

  getPresencaClass(taxa: number): string {
    if (taxa >= 90) return 'presenca-alta';
    if (taxa >= 70) return 'presenca-media';
    return 'presenca-baixa';
  }

  getLucroClass(margem: number): string {
    if (margem >= 20) return 'lucro-bom';
    if (margem >= 10) return 'lucro-medio';
    if (margem >= 0) return 'lucro-baixo';
    return 'lucro-negativo';
  }

  getAlturaBarraGrafico(valor: number): number {
    const max = this.valorMaximoGrafico();
    return max > 0 ? (valor / max) * 100 : 0;
  }
}
