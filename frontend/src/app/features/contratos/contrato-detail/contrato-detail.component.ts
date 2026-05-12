import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import {
  Contrato,
  Posto,
  Alocacao,
  StatusContrato,
  ContratoResumoFinanceiro,
  CalculoValorTotalOutput,
  SimulacaoFinanceiraMensalInput,
  SimulacaoFinanceiraMensalOutput,
  TipoEscala,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';
import { DiariaService } from '../../../services/diaria.service';
import { buildCalculoValorTotalInput } from '../../../shared/helpers/contrato-calculo.helper';

@Component({
  selector: 'app-contrato-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contrato-detail.component.html',
  styleUrl: './contrato-detail.component.scss',
})
export class ContratoDetailComponent implements OnInit {
  private readonly DIARIAS_POR_FUNCIONARIO_MES_BASE = 15;

  private normalizarPercentualContrato(valor: number | null | undefined): number {
    const safe = Number(valor ?? 0);
    if (!Number.isFinite(safe) || safe < 0) return 0;

    // Compatibilidade: aceita tanto decimal (0.15) quanto inteiro legado (15)
    return safe > 1 ? safe / 100 : safe;
  }

  private getDiasMedio(tipoEscala: TipoEscala | string): number {
    let diasMedio = 22;
    if (tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) diasMedio = 15;
    else if (tipoEscala === TipoEscala.FOLGUISTA) diasMedio = 8;
    else if (tipoEscala === TipoEscala.OITO_HORAS_SEIS_POR_DOIS) diasMedio = 26;
    return diasMedio;
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private contratoService = inject(ContratoService);
  private calculoService = inject(ContratoCalculoService);
  private clienteService = inject(ClienteService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private alocacaoService = inject(AlocacaoService);
  private diariaService = inject(DiariaService);

  contrato = signal<Contrato | null>(null);
  alocacoes = signal<Alocacao[]>([]);
  postos = signal<Posto[]>([]);
  resumoFinanceiro = signal<ContratoResumoFinanceiro | null>(null);
  loadingResumoFinanceiro = signal(false);
  clienteNome = signal<string>('');
  funcionariosCliente = signal<number>(0);
  loading = signal(true);
  erro = signal<string | null>(null);
  funcionariosCarregados = signal(false);
  resumoFinanceiroCarregado = signal(false);
  calculoDisparado = signal(false);

  // API-cached breakdown (single source of truth for monetary calculations)
  breakdown = signal<CalculoValorTotalOutput | null>(null);
  simulacaoBreakdown = signal<SimulacaoFinanceiraMensalOutput | null>(null);
  simulacaoInputAtual = signal<SimulacaoFinanceiraMensalInput | null>(null);
  calculando = signal(false);
  erroCalculo = signal<string | null>(null);

  StatusContrato = StatusContrato;

  percentualEncargosPercent = computed(
    () => (this.contrato()?.percentualEncargosProvisoes ?? 0) * 100,
  );

  // Computed signals for UI display (sourced from API breakdown when available)
  // Financial metrics come directly from API response
  custoBaseDiarias = computed(() => this.breakdown()?.custoBaseMensal ?? 0);

  // When breakdown is not available, show 0 instead of computing locally
  custoDiariasNormaisReal = computed(() => this.breakdown()?.custoDiariasNormais ?? 0);
  adicionalNoturnoTotal = computed(() => this.breakdown()?.custoAdicionalNoturno ?? 0);
  adicionalFimSemanaTotal = computed(() => this.breakdown()?.custoDiariasFimSemana ?? 0);
  beneficiosTotais = computed(() => {
    const breakdown = this.breakdown();
    if (!breakdown) return 0;
    // Benefícios included in custoBaseMensal from API
    return breakdown.valorBeneficios ?? 0;
  });

  custoTotal = computed(() => this.breakdown()?.custoBaseMensal ?? 0);

  impostosMensal = computed(() => this.breakdown()?.valorImpostos ?? 0);

  custoTotalSemImpostoReal = computed(() => this.breakdown()?.custoDireto ?? 0);

  custoTotalComImpostoReal = computed(() => this.breakdown()?.custoBaseMensal ?? 0);

  lucro = computed(() => {
    const breakdown = this.breakdown();
    return breakdown ? breakdown.valorTotalMensal - breakdown.custoBaseMensal : 0;
  });

  faturamentoRealFechado = computed(() => this.faturamentoSimulado());

  margemLucroValor = computed(() => this.breakdown()?.valorMargemLucro ?? 0);
  riscoCoberturaValor = computed(() => this.breakdown()?.valorMargemFaltas ?? 0);
  lucroEsperadoMinimo = computed(() => this.margemLucroValor() + this.riscoCoberturaValor());

  // Divisor para a fórmula de margem real: (1 - somaMargens)
  // Ex: margemLucro=0.20, margemRisco=0.10 → divisor = 0.70 (70%)
  divisorMargemPercent = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 1;
    const lucro = this.normalizarPercentualContrato(contrato.margemLucroPercentual);
    const risco = this.normalizarPercentualContrato(contrato.margemCoberturaFaltasPercentual);
    return Math.max(0.01, 1 - lucro - risco);
  });

  custoBaseSimulado = computed(() => this.simulacaoBreakdown()?.custoBaseMensal ?? 0);
  adicionalNoturnoSimulado = computed(() => this.simulacaoBreakdown()?.custoAdicionalNoturno ?? 0);
  adicionalFimSemanaSimulado = computed(
    () => this.simulacaoBreakdown()?.custoDiariasFimSemana ?? 0,
  );

  valorDiariaAtual = computed(() => this.contrato()?.valorDiariaCobrada ?? 0);

  diasUteisMesSimulado = computed(() => this.simulacaoInputAtual()?.diasUteisMes ?? 22);

  diasFimSemanaMesSimulado = computed(() => this.simulacaoInputAtual()?.diasFimSemanaMes ?? 8);

  feriadosAnoSimulado = computed(() => this.simulacaoInputAtual()?.feriadosAno ?? 12);

  feriadosMesSimulado = computed(() => this.feriadosAnoSimulado() / 12);

  diariasNormaisReal = computed(() => {
    const b = this.breakdown();
    if (!b) return 0;
    const uteis = Math.max(0, b.diariasTotaisMes - b.diariasFdsMes);
    const noturnas = Math.min(uteis, b.diariasNoturnasMes);
    return Math.max(0, uteis - noturnas);
  });

  custoDiariasNormaisSimulado = computed(() => {
    return this.simulacaoBreakdown()?.custoDiariasNormais ?? 0;
  });

  diariasNoturnasUteisMes = computed(() => {
    const s = this.simulacaoBreakdown();
    if (!s) return 0;
    const diariasNoturnasMes = s.diariasNoturnasPorDia * this.diasUteisMesSimulado();
    return Math.min(s.diariasUteisMes, diariasNoturnasMes);
  });

  diariasDiurnasUteisMes = computed(() => {
    const s = this.simulacaoBreakdown();
    if (!s) return 0;
    return Math.max(0, s.diariasUteisMes - this.diariasNoturnasUteisMes());
  });

  custoAdicionalNoturnoComBaseSimulado = computed(() => {
    return this.simulacaoBreakdown()?.custoAdicionalNoturno ?? 0;
  });

  custoBrutoSimulado = computed(() => {
    return (
      this.custoDiariasNormaisSimulado() +
      this.custoAdicionalNoturnoComBaseSimulado() +
      this.custoDiariasFimSemanaSimulado() +
      this.custoTotalBeneficios()
    );
  });

  custoDiariasFimSemanaSimulado = computed(() => {
    return this.simulacaoBreakdown()?.custoDiariasFimSemana ?? 0;
  });

  custoTotalEtapa2Simulado = computed(() => {
    return this.custoBrutoSimulado();
  });

  valorImpostosSimulado = computed(() => {
    return this.simulacaoBreakdown()?.valorImpostos ?? 0;
  });

  custoTotalFinalSimulado = computed(() => {
    return this.custoBrutoSimulado() + this.valorImpostosSimulado();
  });

  lucroTotalFinalSimulado = computed(() => {
    return this.faturamentoSimulado() - this.custoTotalFinalSimulado();
  });

  faturamentoRealComparativo = computed(() => this.faturamentoSimulado());

  custoTotalRealComparativo = computed(() => this.custoTotalComImpostoReal());

  lucroTotalRealComparativo = computed(() => {
    return this.faturamentoRealFechado() - this.custoTotalRealComparativo();
  });

  variacaoFaturamentoPercent = computed(() =>
    this.calcularVariacaoPercentual(this.faturamentoSimulado(), this.faturamentoRealComparativo()),
  );

  variacaoCustoPercent = computed(() =>
    this.calcularVariacaoPercentual(
      this.custoTotalFinalSimulado(),
      this.custoTotalRealComparativo(),
    ),
  );

  variacaoLucroPercent = computed(() =>
    this.calcularVariacaoPercentual(
      this.valorMargemLucroSimulado(),
      this.lucroTotalRealComparativo(),
    ),
  );

  valorMargemLucroSimulado = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    return simulacao?.valorMargemLucro ?? 0;
  });

  valorMargemFaltasSimulado = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    return simulacao?.valorMargemFaltas ?? 0;
  });

  faturamentoSimulado = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    if (simulacao?.faturamentoSimulado !== undefined) return simulacao.faturamentoSimulado;
    return (
      this.custoTotalFinalSimulado() +
      this.valorMargemLucroSimulado() +
      this.valorMargemFaltasSimulado()
    );
  });

  lucroCalculadoPorDiferenca = computed(() => {
    const breakdown = this.breakdown();
    if (!breakdown) return 0;
    return this.faturamentoSimulado() - breakdown.custoBaseMensal;
  });

  lucroPorPercentualFaturamento = computed(() => {
    const breakdown = this.breakdown();
    const percentualLucro = this.contrato()?.margemLucroPercentual ?? 0;
    if (!breakdown) return 0;
    return breakdown.valorTotalMensal * percentualLucro;
  });

  faturamentoCalculadoPorSoma = computed(() => {
    const breakdown = this.breakdown();
    if (!breakdown) return 0;
    return breakdown.custoBaseMensal + this.lucroCalculadoPorDiferenca();
  });

  // Novos computed signals para separação de feriados e projeção de funcionários

  feriadosMesRisco = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    return simulacao?.diariasFeriadosMes ?? 0;
  });

  funcionariosProjetados = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    return simulacao?.funcionariosProjetados ?? 0;
  });

  // Salário / funcionário (simulado e real)
  diariasPorFuncSimulado = computed(() => {
    const sim = this.simulacaoBreakdown();
    if (!sim || !sim.funcionariosProjetados) return 0;
    return sim.diariasTotaisMes / sim.funcionariosProjetados;
  });

  salarioSimuladoDiurno = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;
    return (
      this.diariasPorFuncSimulado() * (contrato.valorDiariaCobrada ?? 0) +
      (contrato.valorBeneficiosExtrasMensal ?? 0)
    );
  });

  salarioSimuladoNoturno = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;
    const diaria = contrato.valorDiariaCobrada ?? 0;
    const adicNot = this.normalizarPercentualContrato(contrato.percentualAdicionalNoturno);
    return (
      this.diariasPorFuncSimulado() * diaria * (1 + adicNot) +
      (contrato.valorBeneficiosExtrasMensal ?? 0)
    );
  });

  salarioRealMedio = computed(() => {
    const funcCount = this.funcionariosCliente();
    if (!funcCount || funcCount === 0) return 0;
    return this.custoTotalSemImpostoReal() / funcCount;
  });

  salarioRealMedioDiurno = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;
    
    const alocsDiurnas = this.alocacoes().filter(a => !a.temHorarioNoturno);
    if (alocsDiurnas.length === 0) return this.salarioRealMedio(); // fallback
    
    let sumSalaries = 0;
    let countEmployees = 0;
    
    for (const a of alocsDiurnas) {
      const diasMedio = this.getDiasMedio(a.tipoEscala);
      const salarioBase = diasMedio * (contrato.valorDiariaCobrada || 0);
      const beneficios = contrato.valorBeneficiosExtrasMensal || 0;
      
      const qtd = a.quantidadeFuncionarios || 1;
      sumSalaries += (salarioBase + beneficios) * qtd;
      countEmployees += qtd;
    }
    
    if (countEmployees === 0) return this.salarioRealMedio();
    return sumSalaries / countEmployees;
  });

  salarioRealMedioNoturno = computed(() => {
    const contrato = this.contrato();
    if (!contrato) return 0;
    
    const alocsNoturnas = this.alocacoes().filter(a => a.temHorarioNoturno);
    if (alocsNoturnas.length === 0) return this.salarioRealMedio(); // fallback
    
    let sumSalaries = 0;
    let countEmployees = 0;
    const adicNoturno = this.normalizarPercentualContrato(contrato.percentualAdicionalNoturno);
    
    for (const a of alocsNoturnas) {
      const diasMedio = this.getDiasMedio(a.tipoEscala);
      const salarioBase = diasMedio * (contrato.valorDiariaCobrada || 0) * (1 + adicNoturno);
      const beneficios = contrato.valorBeneficiosExtrasMensal || 0;
      
      const qtd = a.quantidadeFuncionarios || 1;
      sumSalaries += (salarioBase + beneficios) * qtd;
      countEmployees += qtd;
    }
    
    if (countEmployees === 0) return this.salarioRealMedio();
    return sumSalaries / countEmployees;
  });

  variacaoSalarioDiurnoPercent = computed(() =>
    this.calcularVariacaoPercentual(this.salarioSimuladoDiurno(), this.salarioRealMedioDiurno()),
  );

  variacaoSalarioNoturnoPercent = computed(() =>
    this.calcularVariacaoPercentual(this.salarioSimuladoNoturno(), this.salarioRealMedioNoturno()),
  );

  variacaoSalarioDiurnoTexto(): string {
    return this.formatarVariacaoPercentualTexto(this.variacaoSalarioDiurnoPercent());
  }

  variacaoSalarioNoturnoTexto(): string {
    return this.formatarVariacaoPercentualTexto(this.variacaoSalarioNoturnoPercent());
  }

  custoTotalBeneficios = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    return simulacao?.custoTotalBeneficios ?? 0;
  });

  proporcaoNoturnaCalc = computed(() => {
    const simulacao = this.simulacaoBreakdown();
    if (!simulacao || simulacao.numeroDePostos <= 0) return 0;
    return 1 / simulacao.numeroDePostos;
  });

  // Real report helpers
  totalDiariasReal = computed(() => {
    return this.breakdown()?.diariasTotaisMes ?? 0;
  });

  funcionariosNecessariosReal = computed(() => {
    return this.breakdown()?.quantidadeFuncionarios ?? this.breakdown()?.funcionariosEstimados ?? 0;
  });

  quantidadeDiariasReal = computed(() => {
    return this.breakdown()?.quantidadeDiarias ?? 0;
  });

  // Lucro real: faturamento SIMULADO menos custo REAL (conforme pedido)
  lucroReal = computed(() => {
    const custoReal = this.breakdown()?.custoBaseMensal ?? 0;
    return this.faturamentoRealFechado() - custoReal;
  });

  // Lucro ideal: faturamento real projetado (API) menos custo real
  lucroIdeal = computed(() => {
    const custoTotal = this.custoTotalFinalSimulado();
    return this.faturamentoRealFechado() - custoTotal;
  });

  private calcularVariacaoPercentual(valorBase: number, valorComparado: number): number {
    if (!Number.isFinite(valorBase) || Math.abs(valorBase) < 0.0001) {
      return 0;
    }

    return ((valorComparado - valorBase) / Math.abs(valorBase)) * 100;
  }

  private formatarVariacaoPercentualTexto(percentual: number): string {
    if (!Number.isFinite(percentual) || Math.abs(percentual) < 0.0001) return '0%';
    const sinal = percentual > 0 ? 'a mais' : 'a menos';
    const valor = Math.abs(percentual).toFixed(2).replace('.', ',');
    return `${valor}% ${sinal}`;
  }

  variacaoFaturamentoTexto(): string {
    return this.formatarVariacaoPercentualTexto(this.variacaoFaturamentoPercent());
  }

  variacaoCustoTexto(): string {
    return this.formatarVariacaoPercentualTexto(this.variacaoCustoPercent());
  }

  variacaoLucroTexto(): string {
    return this.formatarVariacaoPercentualTexto(this.variacaoLucroPercent());
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/contratos']);
      return;
    }

    this.contratoService.getById(id).subscribe({
      next: (contrato) => {
        this.contrato.set(contrato);
        this.loading.set(false);
        this.funcionariosCarregados.set(false);
        this.resumoFinanceiroCarregado.set(false);
        this.calculoDisparado.set(false);
        this.carregarCliente(contrato.clienteId);
        this.carregarFuncionarios(contrato.clienteId);
        this.carregarAlocacoes(id);
        this.carregarPostos(contrato.clienteId);
        // Load calculation breakdown from API after loading timesheet
        this.carregarResumoFinanceiro(id);
      },
      error: () => {
        this.erro.set('Contrato não encontrado.');
        this.loading.set(false);
      },
    });
  }

  private carregarCliente(clienteId: string): void {
    this.clienteService.getById(clienteId).subscribe({
      next: (cond) => this.clienteNome.set(cond.nome),
      error: () => {},
    });
  }

  private carregarFuncionarios(clienteId: string): void {
    this.funcionarioService.getByClienteId(clienteId).subscribe({
      next: (funcionarios) => {
        this.funcionariosCliente.set(funcionarios.length);
        this.funcionariosCarregados.set(true);
        this.tentarCarregarCalculo();
      },
      error: () => {
        this.funcionariosCliente.set(0);
        this.funcionariosCarregados.set(true);
        this.tentarCarregarCalculo();
      },
    });
  }

  private carregarPostos(clienteId: string): void {
    this.postoService.getByClienteId(clienteId).subscribe({
      next: (postos) => this.postos.set(postos),
      error: () => this.postos.set([]),
    });
  }

  private carregarAlocacoes(contratoId: string): void {
    this.alocacaoService.getByContratoId(contratoId).subscribe({
      next: (alocs) => this.alocacoes.set(alocs),
      error: () => {},
    });
  }

  private carregarResumoFinanceiro(contratoId: string): void {
    const hoje = new Date();
    this.loadingResumoFinanceiro.set(true);
    this.diariaService
      .getResumoFinanceiroByContrato(contratoId, hoje.getFullYear(), hoje.getMonth() + 1)
      .subscribe({
        next: (resumo) => {
          this.resumoFinanceiro.set(resumo);
          this.loadingResumoFinanceiro.set(false);
          this.resumoFinanceiroCarregado.set(true);
          this.tentarCarregarCalculo();
        },
        error: () => {
          this.resumoFinanceiro.set(null);
          this.loadingResumoFinanceiro.set(false);
          this.resumoFinanceiroCarregado.set(true);
          this.tentarCarregarCalculo();
        },
      });
  }

  private tentarCarregarCalculo(): void {
    if (
      this.calculoDisparado() ||
      !this.funcionariosCarregados() ||
      !this.resumoFinanceiroCarregado()
    ) {
      return;
    }

    this.calculoDisparado.set(true);
    this.carregarCalculo();
  }

  private carregarCalculo(): void {
    const contrato = this.contrato();
    if (!contrato) {
      this.erroCalculo.set('Contrato não carregado');
      return;
    }

    this.calculando.set(true);
    this.erroCalculo.set(null);

    const resumo = this.resumoFinanceiro();
    const diariasTotaisMes = (resumo?.totalDiariasNormais || 0) + (resumo?.totalDiariasExtras || 0);
    const diariasNoturnasMes =
      resumo?.projecaoCustoPorAlocacao
        ?.filter((a) => a.temHorarioNoturno)
        .reduce((acc, item) => acc + (item.totalDiarias || 0), 0) || 0;
    const diariasFdsMes = Math.max(0, resumo?.totalDiariasFimDeSemana || 0);
    const diariasFeriadosMes = 0; // Feriados não são calculados neste fluxo
    const funcionarios = this.funcionariosCliente() || contrato.quantidadeFuncionarios || 1;

    // Build calculation input using shared helper with explicit diarias at detail level
    const input = buildCalculoValorTotalInput(
      {
        postos: [
          {
            tipoPosto: 'PERSONALIZADO',
            quantidadeAlocacoes: Math.max(1, contrato.numeroDePostos || 1),
            quantidadeFuncionariosPorAlocacao: 1,
            alocacoesNoturnas: 0,
          },
        ],
        valorDiariaCobrada: contrato.valorDiariaCobrada || 0,
        valorBeneficiosExtrasMensal: contrato.valorBeneficiosExtrasMensal || 0,
        percentualEncargosProvisoes: contrato.percentualEncargosProvisoes || 0,
        percentualAdicionalNoturno: this.normalizarPercentualContrato(
          contrato.percentualAdicionalNoturno,
        ),
        percentualAdicionalFimSemana: this.normalizarPercentualContrato(
          contrato.percentualAdicionalFimSemana,
        ),
        margemLucroPercentual: this.normalizarPercentualContrato(contrato.margemLucroPercentual),
        margemCoberturaFaltasPercentual: this.normalizarPercentualContrato(
          contrato.margemCoberturaFaltasPercentual,
        ),
      },
      {
        PERSONALIZADO: {
          label: 'Personalizado',
          alocacoes: Math.max(1, contrato.numeroDePostos || 1),
          funcionariosPorAlocacao: 1,
          alocacoesNoturnas: 0,
          diasTrabalhadosPorFuncMes: this.DIARIAS_POR_FUNCIONARIO_MES_BASE,
          operaFimDeSemana: true,
        },
      },
    );

    // Override derived totals with operational data when available
    if (resumo) {
      input.diariasTotaisMes = diariasTotaisMes;
      input.funcionariosEstimados = funcionarios;
      input.diariasNoturnasMes = diariasNoturnasMes;
      input.diariasFdsMes = diariasFdsMes;
      input.diariasFeriadosMes = diariasFeriadosMes;
    }

    const simulacaoInput = this.buildSimulacaoInput(contrato);
    this.simulacaoInputAtual.set(simulacaoInput);

    this.calculoService.calcularValorTotal(input).subscribe({
      next: (resultadoReal) => {
        this.breakdown.set(resultadoReal);

        this.calculoService.simularSemAlocacoes(simulacaoInput).subscribe({
          next: (resultadoSimulado) => {
            this.simulacaoBreakdown.set(resultadoSimulado);
            this.calculando.set(false);
          },
          error: (err) => {
            this.calculando.set(false);
            this.erroCalculo.set(err.error?.error || 'Erro ao carregar relatório simulado');
            this.simulacaoBreakdown.set(null);
          },
        });
      },
      error: (err) => {
        this.calculando.set(false);
        this.erroCalculo.set(err.error?.error || 'Erro ao calcular valor total');
        this.breakdown.set(null);
        this.simulacaoBreakdown.set(null);
      },
    });
  }

  private buildSimulacaoInput(contrato: Contrato): SimulacaoFinanceiraMensalInput {
    const numeroDePostos = Math.max(1, contrato.numeroDePostos || 1);
    const funcionariosContrato = Math.max(1, contrato.quantidadeFuncionarios || 1);
    const alocacoesPorPosto = 2;

    return {
      valorDiaria: contrato.valorDiariaCobrada || 0,
      numeroDePostos,
      percentualAdicionalNoturno: this.normalizarPercentualContrato(
        contrato.percentualAdicionalNoturno,
      ),
      percentualAdicionalFimSemana: this.normalizarPercentualContrato(
        contrato.percentualAdicionalFimSemana,
      ),
      alocacoesPorPosto,
      funcionariosPorAlocacao: Math.max(1, Math.ceil(funcionariosContrato / alocacoesPorPosto)),
      diasTrabalhadosPorFuncionarioMes: this.DIARIAS_POR_FUNCIONARIO_MES_BASE,
      valorBeneficioMensalPorFuncionario: contrato.valorBeneficiosExtrasMensal || 0,
      percentualEncargosProvisoes: this.normalizarPercentualContrato(
        contrato.percentualEncargosProvisoes,
      ),
      margemLucroPercentual: this.normalizarPercentualContrato(contrato.margemLucroPercentual),
      margemCoberturaFaltasPercentual: this.normalizarPercentualContrato(
        contrato.margemCoberturaFaltasPercentual,
      ),
    };
  }

  retryCalculo(): void {
    const contrato = this.contrato();
    if (!contrato) return;
    this.carregarCalculo();
  }

  getStatusLabel(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.ATIVO:
        return 'Ativo';
      case StatusContrato.PENDENTE:
        return 'Pendente';
      case StatusContrato.FINALIZADO:
        return 'Finalizado';
      default:
        return status;
    }
  }

  getStatusClass(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.ATIVO:
        return 'success';
      case StatusContrato.PENDENTE:
        return 'warning';
      case StatusContrato.FINALIZADO:
        return 'inactive';
      default:
        return '';
    }
  }

  getTagRatesPreview(): string {
    const tags = this.contrato()?.tags ?? [];
    if (tags.length === 0) {
      return 'Sem tags tarifadas neste contrato';
    }

    return tags.map((tag) => `${tag.tagNome}: ${this.formatCurrency(tag.valorDiaria)}`).join(' • ');
  }

  getMaiorTagRate(): number {
    const tags = this.contrato()?.tags ?? [];
    return tags.length > 0 ? Math.max(...tags.map((tag) => tag.valorDiaria)) : 0;
  }

  formatHorario(horarioInicio: string, horarioFim: string): string {
    return `${horarioInicio.substring(0, 5)} – ${horarioFim.substring(0, 5)}`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  }

  getAlocacoesPorPosto(postoId: string): number {
    return this.alocacoes().filter((a) => a.postoId === postoId).length;
  }

  getFuncionariosCliente(): number {
    return this.funcionariosCliente();
  }

  getBeneficiosTotaisReais(): number {
    const funcionarios = this.funcionariosCliente();
    const beneficioPorFuncionario = this.contrato()?.valorBeneficiosExtrasMensal ?? 0;
    return funcionarios * beneficioPorFuncionario;
  }

  getQuantidadeFuncionariosReal(): number {
    return this.funcionariosNecessariosReal();
  }
}
