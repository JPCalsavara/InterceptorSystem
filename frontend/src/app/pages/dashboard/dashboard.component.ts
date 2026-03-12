import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { PostoService } from '../../services/posto.service';
import { DiariaService } from '../../services/diaria.service';
import { ContratoService } from '../../services/contrato.service';
import {
  Cliente,
  Funcionario,
  Posto,
  Diaria,
  Contrato,
  StatusContrato,
  StatusDiaria,
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

  clientes = signal<Cliente[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<Posto[]>([]);
  diarias = signal<Diaria[]>([]);
  contratos = signal<Contrato[]>([]);

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

    const faturamentoBruto = contratosVigentes.reduce((sum, c) => sum + c.valorTotalMensal, 0);

    const lucroProjetado = contratosVigentes.reduce(
      (sum, c) => sum + c.valorTotalMensal * c.margemLucroPercentual,
      0,
    );

    const custoOperacional = contratosVigentes.reduce(
      (sum, c) =>
        sum +
        c.valorTotalMensal * (1 - c.margemLucroPercentual - c.margemCoberturaFaltasPercentual),
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
        const custoEstimado = contrato
          ? contrato.valorTotalMensal *
            (1 - contrato.margemLucroPercentual - contrato.margemCoberturaFaltasPercentual)
          : 0;

        const lucroEstimado = contrato
          ? contrato.valorTotalMensal * contrato.margemLucroPercentual
          : 0;

        // margemLucroPercentual vem em 0-1 do backend; getLucroClass() espera 0-100
        const margemLucro = contrato ? contrato.margemLucroPercentual * 100 : 0;

        return {
          id: cond.id,
          nome: cond.nome,
          cidade: cond.cidade,
          estado: cond.estado,
          ativo: cond.ativo,
          faturamentoMensal: contrato?.valorTotalMensal ?? 0,
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
          (a) => a.statusDiaria === StatusDiaria.FALTA_REGISTRADA,
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
          valorTotalMensal: c.valorTotalMensal,
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

      const faturamento = contratosVigentes.reduce((sum, c) => sum + c.valorTotalMensal, 0);
      const custoOperacional = contratosVigentes.reduce(
        (sum, c) =>
          sum +
          c.valorTotalMensal * (1 - c.margemLucroPercentual - c.margemCoberturaFaltasPercentual),
        0,
      );
      const lucro = contratosVigentes.reduce(
        (sum, c) => sum + c.valorTotalMensal * c.margemLucroPercentual,
        0,
      );

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
    ]).finally(() => this.loading.set(false));
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
          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  getTendenciaIcon(tendencia: string): string {
    if (tendencia === 'up') return '↗';
    if (tendencia === 'down') return '↘';
    return '→';
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
