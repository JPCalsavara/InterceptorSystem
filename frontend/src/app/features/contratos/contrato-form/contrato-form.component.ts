import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { TagService } from '../../../services/tag.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { StatusContrato, CalculoValorTotalOutput, Tag, TipoEscala } from '../../../models/index';
import { TagPickerComponent } from '../../../shared/components/tag-picker/tag-picker.component';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import {
  buildCalculoValorTotalInput,
  calcularResumoContrato,
  PostoCalculoInput,
} from '../../../shared/helpers/contrato-calculo.helper';

/**
 * Configuração padrão de cada tipo de posto.
 * - alocacoes: número de turnos no posto
 * - funcionariosPorAlocacao: funcionários por turno
 * - alocacoesNoturnas: quantos turnos são noturnos
 */
export interface TipoPostoConfig {
  label: string;
  alocacoes: number;
  funcionariosPorAlocacao: number;
  alocacoesNoturnas: number;
  diasTrabalhadosPorFuncMes: number;
  operaFimDeSemana: boolean;
}

export enum TipoPosto {
  ESCALA_12X36 = 'ESCALA_12X36',
  ESCALA_12X36_DUPLA = 'ESCALA_12X36_DUPLA',
  ESCALA_8H_3TURNOS = 'ESCALA_8H_3TURNOS',
  ESCALA_5X2_DIURNO = 'ESCALA_5X2_DIURNO',
  ESCALA_24H_UNICO = 'ESCALA_24H_UNICO',
  PERSONALIZADO = 'PERSONALIZADO',
}

export const TIPO_POSTO_CONFIGS: Record<TipoPosto, TipoPostoConfig> = {
  [TipoPosto.ESCALA_12X36]: {
    label: '12×36 (Dia / Noite) — 1 func./turno',
    alocacoes: 2,
    funcionariosPorAlocacao: 1,
    alocacoesNoturnas: 1,
    diasTrabalhadosPorFuncMes: 15,
    operaFimDeSemana: true,
  },
  [TipoPosto.ESCALA_12X36_DUPLA]: {
    label: '12×36 (Dia / Noite) — 2 func./turno',
    alocacoes: 2,
    funcionariosPorAlocacao: 2,
    alocacoesNoturnas: 1,
    diasTrabalhadosPorFuncMes: 15,
    operaFimDeSemana: true,
  },
  [TipoPosto.ESCALA_8H_3TURNOS]: {
    label: '8h (6x2) — 1 func./turno',
    alocacoes: 3,
    funcionariosPorAlocacao: 1,
    alocacoesNoturnas: 1,
    diasTrabalhadosPorFuncMes: 24,
    operaFimDeSemana: true,
  },
  [TipoPosto.ESCALA_5X2_DIURNO]: {
    label: '5×2 Diurno — 1 func./turno',
    alocacoes: 1,
    funcionariosPorAlocacao: 1,
    alocacoesNoturnas: 0,
    diasTrabalhadosPorFuncMes: 22,
    operaFimDeSemana: false,
  },
  [TipoPosto.ESCALA_24H_UNICO]: {
    label: '24h Único — 1 func.',
    alocacoes: 1,
    funcionariosPorAlocacao: 1,
    alocacoesNoturnas: 1,
    diasTrabalhadosPorFuncMes: 15,
    operaFimDeSemana: true,
  },
  [TipoPosto.PERSONALIZADO]: {
    label: 'Personalizado (edição livre)',
    alocacoes: 2,
    funcionariosPorAlocacao: 1,
    alocacoesNoturnas: 1,
    diasTrabalhadosPorFuncMes: 15,
    operaFimDeSemana: true,
  },
};

export const TIPO_POSTO_OPTIONS = Object.entries(TIPO_POSTO_CONFIGS).map(([value, cfg]) => ({
  value: value as TipoPosto,
  label: cfg.label,
}));

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TagPickerComponent],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.scss',
})
export class ContratoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ContratoService);
  private calculoService = inject(ContratoCalculoService);
  private clienteService = inject(ClienteService);
  private tagService = inject(TagService);
  private alocacaoService = inject(AlocacaoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  contratoId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  clientes = signal<any[]>([]);
  tags = signal<Tag[]>([]);
  selectedTagIds = signal<string[]>([]);
  tagRateById = signal<Record<string, number>>({});
  duracaoContrato = signal<string>(''); // Duração calculada do contrato
  activeTooltip = signal<string | null>(null); // Controla qual tooltip está aberto

  // Enum de tipos de posto
  TipoPosto = TipoPosto;
  tipoPostoOptions = TIPO_POSTO_OPTIONS;

  // Estado do cálculo
  calculando = signal(false);
  erroCalculo = signal<string | null>(null);
  breakdown = signal<CalculoValorTotalOutput | null>(null);

  selectedTags = computed(() => {
    const selected = new Set(this.selectedTagIds());
    return this.tags().filter((tag) => selected.has(tag.id));
  });

  StatusContrato = StatusContrato;
  statusOptions = [
    { value: StatusContrato.ATIVO, label: 'Ativo' },
    { value: StatusContrato.PENDENTE, label: 'Pendente' },
    { value: StatusContrato.FINALIZADO, label: 'Finalizado' },
  ];

  ngOnInit(): void {
    this.loadClientes();
    this.loadTags();
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratoId.set(id);
      this.isEdit.set(true);
      this.loadContrato(id);
    }

    // Setup auto-cálculo
    this.setupAutoCalculo();

    // Inicializar o signal com os valores do form recém-construído
    const resumoInicial = calcularResumoContrato(
      (this.postosConfig?.value || []) as PostoCalculoInput[],
      TIPO_POSTO_CONFIGS,
    );
    this.resumoContratoSignal.set(resumoInicial);

    // Inicia um recalculo com os valores padrões para não vir 0
    setTimeout(() => {
      this.form.updateValueAndValidity({ emitEvent: true });
    }, 500);
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });
  }

  loadTags(): void {
    this.tagService.getAll().subscribe({
      next: (data) => this.tags.set(data),
      error: (err) => console.error('Erro ao carregar tags:', err),
    });
  }

  buildForm(): void {
    // Datas padrão: hoje e 6 meses depois
    const hoje = new Date();
    const seisMesesDepois = new Date();
    seisMesesDepois.setMonth(hoje.getMonth() + 6);

    this.form = this.fb.group({
      clienteId: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      // Valores padrão baseados no mercado de segurança patrimonial brasileiro
      valorDiariaCobrada: [100, [Validators.required, Validators.min(0)]], // R$ 100/dia é valor médio para portaria
      percentualAdicionalNoturno: [
        20, // 20% é o mínimo legal (CLT Art. 73)
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      percentualAdicionalFimSemana: [
        100, // 100% de adicional default
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      valorBeneficiosExtrasMensal: [350, [Validators.required, Validators.min(0)]], // Vale-transporte + alimentação
      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]], // Impostos médios (INSS + FGTS)

      // Nova lógica: Postos (Locais) -> Alocações (Turnos)
      numeroPostosFisicos: [1, [Validators.required, Validators.min(1)]],
      postosConfig: this.fb.array([this.createPostoConfigGroup()]),

      // Campos calculados (mantendo compatibilidade com backend)
      numeroDePostos: [2], // Total de alocações (turnos)
      numeroDePostosNoturnos: [1, [Validators.min(0), Validators.max(60)]],

      margemLucroPercentual: [15, [Validators.required, Validators.min(0), Validators.max(100)]], // 15% margem razoável
      margemCoberturaFaltasPercentual: [
        10, // 10% para cobrir faltas e imprevistos
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      dataInicio: [this.formatDateForInput(hoje), Validators.required],
      dataFim: [this.formatDateForInput(seisMesesDepois), Validators.required],
      status: [StatusContrato.PENDENTE, Validators.required],
    });

    // Observar mudanças no número de postos físicos
    this.form.get('numeroPostosFisicos')?.valueChanges.subscribe((num) => {
      const currentLen = this.postosConfig.length;
      if (num > currentLen) {
        for (let i = currentLen; i < num; i++) {
          this.postosConfig.push(this.createPostoConfigGroup());
        }
      } else if (num < currentLen && num >= 1) {
        for (let i = currentLen - 1; i >= num; i--) {
          this.postosConfig.removeAt(i);
        }
      }
      this.updateCalculatedFields();
    });

    // Observar mudanças no postosConfig — atualiza signal imediatamente (sem debounce)
    this.postosConfig.valueChanges.subscribe((postos) => {
      const resumo = calcularResumoContrato(
        (postos || []) as PostoCalculoInput[],
        TIPO_POSTO_CONFIGS,
      );
      this.resumoContratoSignal.set(resumo);
      this.updateCalculatedFields();
    });

    // Calcular duração inicial
    this.calcularDuracaoContrato();

    // Observar mudanças nas datas para recalcular duração
    this.form.get('dataInicio')?.valueChanges.subscribe(() => {
      this.calcularDuracaoContrato();
    });

    this.form.get('dataFim')?.valueChanges.subscribe(() => {
      this.calcularDuracaoContrato();
    });
  }

  createPostoConfigGroup(tipo: TipoPosto | string = TipoPosto.ESCALA_12X36): FormGroup {
    let cleanTipo = String(tipo);
    if (cleanTipo.includes(': ')) {
      cleanTipo = cleanTipo.split(': ').slice(1).join(': ').trim();
    }
    const cfg = TIPO_POSTO_CONFIGS[cleanTipo as TipoPosto] || TIPO_POSTO_CONFIGS[TipoPosto.PERSONALIZADO];
    const group = this.fb.group({
      tipoPosto: [cleanTipo, Validators.required],
      quantidadeAlocacoes: [cfg.alocacoes, [Validators.required, Validators.min(1)]],
      quantidadeFuncionariosPorAlocacao: [
        cfg.funcionariosPorAlocacao,
        [Validators.required, Validators.min(1)],
      ],
      alocacoesNoturnas: [cfg.alocacoesNoturnas, [Validators.required, Validators.min(0)]],
      valorDiariaCobrada: [100, [Validators.required, Validators.min(0.01)]],
      valorBeneficiosExtrasMensal: [350, [Validators.required, Validators.min(0)]],
    });

    // Observar mudanças no tipo de posto para auto-preencher os campos travados
    group.get('tipoPosto')?.valueChanges.subscribe((newTipo: string | null) => {
      if (newTipo) this.applyTipoPostoConfig(group, newTipo);
    });

    return group;
  }

  /** Aplica as configurações do TipoPosto no FormGroup do posto */
  applyTipoPostoConfig(group: FormGroup, tipo: TipoPosto | string): void {
    let cleanTipo = String(tipo);
    if (cleanTipo.includes(': ')) {
      cleanTipo = cleanTipo.split(': ').slice(1).join(': ').trim();
    }
    if (cleanTipo === TipoPosto.PERSONALIZADO) return; // modo livre
    
    const cfg = TIPO_POSTO_CONFIGS[cleanTipo as TipoPosto];
    if (!cfg) return;

    group.patchValue(
      {
        quantidadeAlocacoes: cfg.alocacoes,
        quantidadeFuncionariosPorAlocacao: cfg.funcionariosPorAlocacao,
        alocacoesNoturnas: cfg.alocacoesNoturnas,
      },
      { emitEvent: true },
    );
  }

  /** Verifica se o posto está em modo personalizado (edição livre) */
  isPostoPersonalizado(index: number): boolean {
    return this.postosConfig.at(index)?.get('tipoPosto')?.value === TipoPosto.PERSONALIZADO;
  }

  /** Infere o TipoPosto a partir dos dados numéricos (usado no loadContrato para edit) */
  inferTipoPosto(alocacoes: number, funcPorAloc: number, alocNoturnas: number): TipoPosto {
    for (const [key, cfg] of Object.entries(TIPO_POSTO_CONFIGS)) {
      if (key === TipoPosto.PERSONALIZADO) continue;
      if (
        cfg.alocacoes === alocacoes &&
        cfg.funcionariosPorAlocacao === funcPorAloc &&
        cfg.alocacoesNoturnas === alocNoturnas
      ) {
        return key as TipoPosto;
      }
    }
    return TipoPosto.PERSONALIZADO;
  }

  get postosConfig(): FormArray {
    return this.form.get('postosConfig') as FormArray;
  }

  updateCalculatedFields(): void {
    const postosVal = this.postosConfig.value || [];
    const resumo = calcularResumoContrato(postosVal as PostoCalculoInput[], TIPO_POSTO_CONFIGS);

    const firstDiaria = postosVal.length > 0 ? postosVal[0].valorDiariaCobrada : this.form.get('valorDiariaCobrada')?.value;
    const firstBeneficios = postosVal.length > 0 ? postosVal[0].valorBeneficiosExtrasMensal : this.form.get('valorBeneficiosExtrasMensal')?.value;

    // Atualiza campos calculados para compatibilidade com o backend
    if (resumo.postos.length > 0) {
      this.form.patchValue(
        {
          numeroDePostos: resumo.totalAlocacoes,
          numeroDePostosNoturnos: resumo.totalAlocacoesNoturnas,
          valorDiariaCobrada: firstDiaria,
          valorBeneficiosExtrasMensal: firstBeneficios,
        },
        { emitEvent: false },
      );
    }
  }

  /**
   * Total de funcionários = Σ (postos × alocações × funcionários por alocação).
   * Cada posto físico multiplica alocações × func/alocação.
   */
  get quantidadeFuncionariosTotal(): number {
    return calcularResumoContrato(
      (this.postosConfig?.value || []) as PostoCalculoInput[],
      TIPO_POSTO_CONFIGS,
    ).diariasPorDia;
  }

  /** Total de alocações com adicional noturno (soma de todos os postos) */
  get totalAlocacoesNoturnas(): number {
    return calcularResumoContrato(
      (this.postosConfig?.value || []) as PostoCalculoInput[],
      TIPO_POSTO_CONFIGS,
    ).totalAlocacoesNoturnas;
  }

  getQuantidadeFuncionariosTotal(numeroDePostos: number): number {
    return this.quantidadeFuncionariosTotal;
  }

  setupAutoCalculo(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((valores) => {
          // Atualizar o signal de resumo antes de calcular
          const resumo = calcularResumoContrato(
            (valores.postosConfig || []) as PostoCalculoInput[],
            TIPO_POSTO_CONFIGS,
          );
          this.resumoContratoSignal.set(resumo);

          // Validar campos necessários
          if (!valores.valorDiariaCobrada || !resumo.funcionariosEstimados) {
            this.breakdown.set(null);
            return of(null);
          }

          // Chamar backend
          this.calculando.set(true);
          this.erroCalculo.set(null);

          const input = buildCalculoValorTotalInput(
            {
              postos: (valores.postosConfig || []) as PostoCalculoInput[],
              valorDiariaCobrada: valores.valorDiariaCobrada,
              valorBeneficiosExtrasMensal: valores.valorBeneficiosExtrasMensal || 0,
              percentualEncargosProvisoes: (valores.percentualImpostos || 0) / 100,
              percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100,
              percentualAdicionalFimSemana: (valores.percentualAdicionalFimSemana || 0) / 100,
              margemLucroPercentual: (valores.margemLucroPercentual || 0) / 100,
              margemCoberturaFaltasPercentual: (valores.margemCoberturaFaltasPercentual || 0) / 100,
            },
            TIPO_POSTO_CONFIGS,
          );

          return this.calculoService.calcularValorTotal(input).pipe(
            catchError((err) => {
              this.calculando.set(false);
              this.erroCalculo.set(err.error?.error || 'Erro ao calcular valor total');
              this.breakdown.set(null);
              return of(null);
            })
          );
        }),
      )
      .subscribe({
        next: (resultado) => {
          this.calculando.set(false);
          if (resultado) {
            this.breakdown.set(resultado);
          }
        },
        error: (err) => {
          this.calculando.set(false);
          this.erroCalculo.set(err.error?.error || 'Erro ao calcular valor total');
          this.breakdown.set(null);
        },
      });
  }

  // ────────────── Constantes do Relatório Mensal ──────────────
  private readonly DIAS_UTEIS = 22;
  private readonly DIAS_FIM_SEMANA = 8;
  private readonly DIAS_TOTAL_MES = 30; // 22 úteis + 8 fim de semana

  // ────────────── Getters para template ──────────────
  get valorTotalCalculado(): number {
    return this.breakdown()?.valorTotalMensal || 0;
  }

  get temBreakdown(): boolean {
    return this.breakdown() !== null;
  }

  // ── Resumo calculado dos postos (signal atualizado pelo valueChanges) ──
  readonly resumoContratoSignal = signal(
    calcularResumoContrato([] as PostoCalculoInput[], TIPO_POSTO_CONFIGS),
  );

  // Helper não-signal para uso direto no template
  private get _resumoPosto() {
    return calcularResumoContrato(
      (this.postosConfig?.value || []) as PostoCalculoInput[],
      TIPO_POSTO_CONFIGS,
    );
  }

  // --- Postos & Alocações ---
  get postosOperacionais(): number {
    return this.form?.get('numeroPostosFisicos')?.value || this.postosConfig?.length || 1;
  }

  readonly alocacoesTotais = computed(() => this.resumoContratoSignal().totalAlocacoes);
  readonly alocacoesNoturnas = computed(() => this.resumoContratoSignal().totalAlocacoesNoturnas);
  readonly diariasPorDia = computed(() => this.resumoContratoSignal().diariasPorDia);
  readonly diariasNoturnasPorDia = computed(() => this.resumoContratoSignal().diariasNoturnasPorDia);
  readonly diariasUteisMes = computed(() => this.resumoContratoSignal().diariasUteisMes);
  readonly diariasFimSemanaMes = computed(() => this.resumoContratoSignal().diariasFdsMes);
  readonly diariasTotaisMes = computed(() => this.resumoContratoSignal().diariasTotaisMes);
  readonly diariasNoturnasMes = computed(() => this.resumoContratoSignal().diariasNoturnasMes);
  readonly funcionariosEstimados = computed(() => this.resumoContratoSignal().funcionariosEstimados);

  // Diárias diurnas úteis (mesma lógica do detail)
  readonly diariasNormaisUteis = computed(() => {
    const b = this.breakdown();
    if (!b) return 0;
    const uteis = Math.max(0, b.diariasTotaisMes - b.diariasFdsMes);
    const noturnas = Math.min(uteis, b.diariasNoturnasMes);
    return Math.max(0, uteis - noturnas);
  });

  // --- Valores financeiros (sourced from API breakdown) ---
  get valorDiariaForm(): number {
    return this.form?.get('valorDiariaCobrada')?.value || 0;
  }

  readonly encargosProvisoes = computed(() => this.breakdown()?.valorImpostos ?? 0);
  readonly beneficiosTotais = computed(() => this.breakdown()?.valorBeneficios ?? 0);
  readonly custoBaseDiarias = computed(() => this.breakdown()?.custoDiariasNormais ?? 0);
  readonly adicionalNoturnoTotal = computed(() => this.breakdown()?.custoAdicionalNoturno ?? 0);
  readonly adicionalFimSemanaTotal = computed(() => this.breakdown()?.custoDiariasFimSemana ?? 0);
  readonly custoTotalForm = computed(() => this.breakdown()?.custoDireto ?? 0);

  readonly lucroEstimado = computed(() => {
    const b = this.breakdown();
    return b ? b.valorTotalMensal - b.custoBaseMensal : 0;
  });

  readonly margemLucroValor = computed(() => this.breakdown()?.valorMargemLucro ?? 0);
  readonly riscoCoberturaValor = computed(() => this.breakdown()?.valorMargemFaltas ?? 0);
  readonly lucroEsperadoMinimo = computed(() => this.margemLucroValor() + this.riscoCoberturaValor());

  loadContrato(id: string): void {
    this.loading.set(true);

    forkJoin({
      contrato: this.service.getById(id),
      alocacoes: this.alocacaoService.getByContratoId(id),
    }).subscribe({
      next: ({ contrato: data, alocacoes }) => {
        const selectedTagIds = (data.tags ?? []).map((tag) => tag.tagId);
        const rates = (data.tags ?? []).reduce<Record<string, number>>((acc, tag) => {
          acc[tag.tagId] = tag.valorDiaria;
          return acc;
        }, {});

        this.selectedTagIds.set(selectedTagIds);
        this.tagRateById.set(rates);

        this.form.patchValue(
          {
            clienteId: data.clienteId,
            descricao: data.descricao,
            valorDiariaCobrada: data.valorDiariaCobrada,
            percentualAdicionalNoturno: data.percentualAdicionalNoturno * 100,
            percentualAdicionalFimSemana:
              data.percentualAdicionalFimSemana != null
                ? data.percentualAdicionalFimSemana * 100
                : 100,
            valorBeneficiosExtrasMensal: data.valorBeneficiosExtrasMensal,
            percentualImpostos: data.percentualEncargosProvisoes * 100,
            numeroPostosFisicos: 1,
            margemLucroPercentual: data.margemLucroPercentual * 100,
            margemCoberturaFaltasPercentual: data.margemCoberturaFaltasPercentual * 100,
            dataInicio: data.dataInicio,
            dataFim: data.dataFim,
            status: data.status,
          },
          { emitEvent: false },
        );

        // Reconstruir postosConfig a partir das alocacoes reais
        this.postosConfig.clear();

        if (alocacoes && alocacoes.length > 0) {
          // Agrupar por tipoEscala para criar um posto por grupo de alocacoes similares
          const totalAlocacoes = alocacoes.length;
          const alocacoesNoturnas = alocacoes.filter((a) => a.temHorarioNoturno).length;
          const qFuncPorAloc = alocacoes[0]?.quantidadeFuncionarios ?? 1;
          // Mapear tipoEscala do backend para TipoPosto do frontend
          const tipoEscalaParaTipoPosto: Record<string, TipoPosto> = {
            [TipoEscala.DOZE_POR_TRINTA_SEIS]: TipoPosto.ESCALA_12X36,
            [TipoEscala.SEMANAL_COMERCIAL]: TipoPosto.ESCALA_5X2_DIURNO,
            [TipoEscala.OITO_HORAS_SEIS_POR_DOIS]: TipoPosto.ESCALA_8H_3TURNOS,
          };
          const tipoBackend = alocacoes[0]?.tipoEscala ?? '';
          const tipoInferido: TipoPosto =
            tipoEscalaParaTipoPosto[tipoBackend] ?? TipoPosto.PERSONALIZADO;

          // Se é ESCALA_12X36 com funcPorAloc > 1, usar DUPLA
          const tipoFinal: TipoPosto =
            tipoInferido === TipoPosto.ESCALA_12X36 && qFuncPorAloc > 1
              ? TipoPosto.ESCALA_12X36_DUPLA
              : tipoInferido;

          const cfg = TIPO_POSTO_CONFIGS[tipoFinal as TipoPosto];
          const finalAlocacoes = cfg && tipoFinal !== TipoPosto.PERSONALIZADO ? cfg.alocacoes : totalAlocacoes;
          const finalNoturnas = cfg && tipoFinal !== TipoPosto.PERSONALIZADO ? cfg.alocacoesNoturnas : alocacoesNoturnas;

          const postoGroup = this.fb.group({
            tipoPosto: [tipoFinal, Validators.required],
            quantidadeAlocacoes: [finalAlocacoes, [Validators.required, Validators.min(1)]],
            quantidadeFuncionariosPorAlocacao: [
              qFuncPorAloc,
              [Validators.required, Validators.min(1)],
            ],
            alocacoesNoturnas: [finalNoturnas, [Validators.required, Validators.min(0)]],
            valorDiariaCobrada: [
              data.valorDiariaCobrada,
              [Validators.required, Validators.min(0.01)],
            ],
            valorBeneficiosExtrasMensal: [
              data.valorBeneficiosExtrasMensal,
              [Validators.required, Validators.min(0)],
            ],
          });

          postoGroup.get('tipoPosto')?.valueChanges.subscribe((newTipo: string | null) => {
            if (newTipo) this.applyTipoPostoConfig(postoGroup, newTipo);
          });

          this.postosConfig.push(postoGroup);
        } else {
          // Fallback legado: usar dados do contrato
          const qtdAlocacoes = data.numeroDePostos || 2;
          const qFuncPorAloc = Math.max(1, Math.round(data.quantidadeFuncionarios / qtdAlocacoes));
          const alocNoturnas = Math.floor(qtdAlocacoes / 2);
          const tipoInferido = this.inferTipoPosto(qtdAlocacoes, qFuncPorAloc, alocNoturnas);

          const cfg = TIPO_POSTO_CONFIGS[tipoInferido as TipoPosto];
          const finalAlocacoes = cfg && tipoInferido !== TipoPosto.PERSONALIZADO ? cfg.alocacoes : qtdAlocacoes;
          const finalNoturnas = cfg && tipoInferido !== TipoPosto.PERSONALIZADO ? cfg.alocacoesNoturnas : alocNoturnas;

          const postoGroup = this.fb.group({
            tipoPosto: [tipoInferido, Validators.required],
            quantidadeAlocacoes: [finalAlocacoes, [Validators.required, Validators.min(1)]],
            quantidadeFuncionariosPorAlocacao: [
              qFuncPorAloc,
              [Validators.required, Validators.min(1)],
            ],
            alocacoesNoturnas: [finalNoturnas, [Validators.required, Validators.min(0)]],
            valorDiariaCobrada: [
              data.valorDiariaCobrada,
              [Validators.required, Validators.min(0.01)],
            ],
            valorBeneficiosExtrasMensal: [
              data.valorBeneficiosExtrasMensal,
              [Validators.required, Validators.min(0)],
            ],
          });

          postoGroup.get('tipoPosto')?.valueChanges.subscribe((newTipo: string | null) => {
            if (newTipo) this.applyTipoPostoConfig(postoGroup, newTipo);
          });

          this.postosConfig.push(postoGroup);
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar contrato. Redirecionando...');
        console.error('Erro:', err);
        setTimeout(() => this.router.navigate(['/contratos']), 2000);
      },
    });
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Usar valorTotalMensal do breakdown calculado pelo backend
    const valorTotalMensal = this.breakdown()?.valorTotalMensal || 0;

    // Converter percentuais de 0-100 para 0-1
    const rawValue = this.form.getRawValue();
    const formValue = {
      ...rawValue,
      tags: this.selectedTagIds().map((tagId) => ({
        tagId,
        valorDiaria: this.getTagRate(tagId),
      })),
      valorTotalMensal: valorTotalMensal,
      percentualAdicionalNoturno: rawValue.percentualAdicionalNoturno / 100,
      percentualAdicionalFimSemana: rawValue.percentualAdicionalFimSemana / 100,
      percentualEncargosProvisoes: rawValue.percentualImpostos / 100,
      margemLucroPercentual: rawValue.margemLucroPercentual / 100,
      margemCoberturaFaltasPercentual: rawValue.margemCoberturaFaltasPercentual / 100,
    };

    const request = this.isEdit()
      ? this.service.update(this.contratoId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.router.navigate(['/contratos']);
      },
      error: (err) => {
        this.error.set(
          this.isEdit()
            ? 'Erro ao atualizar contrato. Tente novamente.'
            : 'Erro ao criar contrato. Tente novamente.',
        );
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.touched || this.submitted()) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.submitted())) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;

    return 'Campo inválido';
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(value: string | null | undefined): string {
    if (!value || typeof value !== 'string') {
      return '';
    }

    const [year, month, day] = value.split('-');
    if (!year || !month || !day) {
      return '';
    }

    return `${day}/${month}/${year}`;
  }

  private calcularDuracaoContrato(): void {
    const inicio = this.form.get('dataInicio')?.value;
    const fim = this.form.get('dataFim')?.value;

    if (inicio && fim) {
      const dataInicio = new Date(inicio);
      const dataFim = new Date(fim);

      const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;

      if (diffMonths > 0) {
        let duracao = `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
        if (remainingDays > 0) {
          duracao += ` e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
        }
        this.duracaoContrato.set(duracao);
      } else {
        this.duracaoContrato.set(`${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`);
      }
    } else {
      this.duracaoContrato.set('');
    }
  }

  toggleTooltip(tooltipId: string): void {
    if (this.activeTooltip() === tooltipId) {
      this.activeTooltip.set(null);
    } else {
      this.activeTooltip.set(tooltipId);
    }
  }

  onContratoTagsChange(tagIds: string[]): void {
    const currentRates = this.tagRateById();
    const diariaBase = Number(this.form?.value?.valorDiariaCobrada) || 0;

    const nextRates: Record<string, number> = {};
    for (const tagId of tagIds) {
      nextRates[tagId] = currentRates[tagId] ?? diariaBase;
    }

    this.selectedTagIds.set([...new Set(tagIds)]);
    this.tagRateById.set(nextRates);
  }

  onTagRateChange(tagId: string, value: string): void {
    const parsed = Number(value);
    const safeValue = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;

    this.tagRateById.update((current) => ({
      ...current,
      [tagId]: safeValue,
    }));
  }

  getTagRate(tagId: string): number {
    const value = this.tagRateById()[tagId];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return Number(this.form?.value?.valorDiariaCobrada) || 0;
  }

  getTagPercentualAcima(tag: Tag, rate: number): string {
    if (!tag.valor || tag.valor === 0) return '';
    const pct = ((rate - tag.valor) / tag.valor) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(0)}% do valor base`;
  }

  cancel(): void {
    if (this.form.dirty) {
      if (confirm('Há alterações não salvas. Deseja realmente sair?')) {
        this.router.navigate(['/contratos']);
      }
    } else {
      this.router.navigate(['/contratos']);
    }
  }
}
