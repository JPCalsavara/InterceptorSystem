import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, firstValueFrom, forkJoin } from 'rxjs';
import { CriarClienteCompletoOutput } from '../../../services/cliente-completo.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { IbgeService } from '../../../services/ibge.service';
import { TagService } from '../../../services/tag.service';
import {
  cnpjValidator,
  cpfValidator,
  telefoneValidator,
} from '../../../shared/validators/br-documents.validators';
import { TagPickerComponent } from '../../../shared/components/tag-picker/tag-picker.component';
import {
  buildCalculoValorTotalInput,
  computePostosByQuantidadeIdeal,
  PostoConfigAutoGerado,
  PostoCalculoInput,
} from '../../../shared/helpers/contrato-calculo.helper';
import {
  StatusContrato,
  StatusFuncionario,
  TipoFuncionario,
  TipoEscala,
  Tag,
} from '../../../models/index';
import {
  TipoPosto,
  TIPO_POSTO_CONFIGS,
  TIPO_POSTO_OPTIONS,
} from '../../contratos/contrato-form/contrato-form.component';

@Component({
  selector: 'app-cliente-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective, TagPickerComponent],
  templateUrl: './cliente-wizard.component.html',
  styleUrls: ['./cliente-wizard.component.scss'],
})
export class ClienteWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private calculoService = inject(ContratoCalculoService);
  private funcionarioService = inject(FuncionarioService);
  private ibgeService = inject(IbgeService);
  private tagService = inject(TagService);
  private router = inject(Router);

  // Controle do wizard
  currentStep = signal(1);
  totalSteps = 3;
  loading = signal(false);
  error = signal<string | null>(null);

  // Formulários de cada etapa
  formCliente!: FormGroup;
  formContrato!: FormGroup;
  formFuncionarios!: FormGroup;

  estados = signal<string[]>([]);
  cidadesDisponiveis = signal<string[]>([]);
  tags = signal<Tag[]>([]);
  selectedTagIds = signal<string[]>([]);
  tagRateById = signal<Record<string, number>>({});

  selectedTags = computed(() => {
    const selected = new Set(this.selectedTagIds());
    return this.tags().filter((tag) => selected.has(tag.id));
  });

  // Controle do modal de criação de tags
  showTagModal = signal(false);
  savingTag = signal(false);
  tagFormError = signal<string | null>(null);
  tagFormSuccess = signal<string | null>(null);

  tagForm = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    valor: [0, [Validators.required, Validators.min(0)]],
    descricao: ['', Validators.maxLength(500)],
  });

  // Labels dos steps
  steps = [
    { number: 1, label: 'Cliente', icon: 'building-office' },
    { number: 2, label: 'Contrato', icon: 'document-text' },
    { number: 3, label: 'Funcionários', icon: 'user-group' },
  ];

  // Computed para controle de navegação
  canGoNext(): boolean {
    const step = this.currentStep();
    if (step === 1) return this.formCliente?.valid ?? false;
    if (step === 2) {
      const criarContrato = this.formContrato?.get('criarContrato')?.value;
      if (criarContrato) return this.formContrato?.valid ?? false;
      return true;
    }
    if (step === 3) return true; // Funcionários são opcionais
    return false;
  }

  // Enum de tipos de posto
  TipoPosto = TipoPosto;
  tipoPostoOptions = TIPO_POSTO_OPTIONS;

  canGoBack = computed(() => this.currentStep() > 1);
  isLastStep = computed(() => this.currentStep() === this.totalSteps);

  // Breakdown do contrato (resultado da API)
  breakdown = signal<any>(null);
  calculando = signal(false);
  erroCalculo = signal<string | null>(null);
  private syncingPostos = false;

  // Cálculos simplificados para exibição (usam dados do breakdown quando disponível)
  custoOperacional = computed(() => {
    return this.breakdown()?.custoBaseMensal || 0;
  });

  margemLucro = computed(() => {
    return this.breakdown()?.valorMargemLucro || 0;
  });

  margemFaltas = computed(() => {
    return this.breakdown()?.valorMargemFaltas || 0;
  });

  faturamentoMensal = computed(() => {
    return this.breakdown()?.valorTotalMensal || 0;
  });

  // Custo estimado por escala (diária × dias, sem contar benefícios pois varia)
  custoEstimado12x36(): number {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    const diaria = postos.length > 0 ? postos[0].valorDiariaCobrada || 0 : 0;
    return 15 * diaria;
  }

  custoEstimado5x2(): number {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    const diaria = postos.length > 0 ? postos[0].valorDiariaCobrada || 0 : 0;
    return 22 * diaria;
  }

  totalFuncionariosPorPostos(): number {
    return this.funcionarios?.length || 0;
  }

  quantidadeTotalFuncionarios(): number {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    let total = 0;
    for (const posto of postos) {
      total += (posto.quantidadeAlocacoes || 0) * (posto.quantidadeFuncionariosPorAlocacao || 0);
    }
    return total;
  }

  totalAlocacoesNoturnas(): number {
    const postos = this.formContrato?.get('postosConfig')?.value || [];
    let total = 0;
    for (const posto of postos) {
      total += (posto.alocacoesNoturnas || 0);
    }
    return total;
  }

  /** Verifica se o posto está em modo personalizado (edição livre) */
  isPostoPersonalizado(index: number): boolean {
    if (this.isModoPersonalizado()) {
      return true;
    }
    return this.postosConfig.at(index)?.get('tipoPosto')?.value === TipoPosto.PERSONALIZADO;
  }

  isModoPersonalizado(): boolean {
    return Boolean(this.formContrato?.get('modoPersonalizado')?.value);
  }

  getQuantidadeIdealPorTurno(): number {
    const ideal = Number(this.formCliente?.get('quantidadeIdealPorTurno')?.value ?? 1);
    return Number.isFinite(ideal) && ideal > 0 ? Math.floor(ideal) : 1;
  }

  getDivergenciasQuantidadeIdeal(): Array<{ index: number; ideal: number; atual: number }> {
    const ideal = this.getQuantidadeIdealPorTurno();
    return this.postosConfig.controls
      .map((ctrl, index) => {
        const atual = Number(ctrl.get('quantidadeFuncionariosPorAlocacao')?.value ?? 0);
        return { index, ideal, atual };
      })
      .filter((item) => item.atual !== item.ideal);
  }

  private recomputarPostosAutomatico(): void {
    if (this.syncingPostos || this.isModoPersonalizado()) {
      return;
    }

    const numeroBase = Math.max(1, Number(this.formContrato.get('numeroPostos')?.value ?? 1));
    const ideal = this.getQuantidadeIdealPorTurno();

    const tiposSelecionados = Array.from({ length: numeroBase }, (_, index) => {
      const tipoAtual = this.postosConfig.at(index)?.get('tipoPosto')?.value as TipoPosto | undefined;
      return tipoAtual ?? TipoPosto.ESCALA_12X36;
    });

    const baseValorDiaria =
      Number(this.postosConfig.at(0)?.get('valorDiariaCobrada')?.value ?? 100) || 100;
    const baseBeneficios =
      Number(this.postosConfig.at(0)?.get('valorBeneficiosExtrasMensal')?.value ?? 350) || 350;

    const autoConfigs = computePostosByQuantidadeIdeal(
      ideal,
      tiposSelecionados,
      TIPO_POSTO_CONFIGS,
    );

    this.syncingPostos = true;
    this.postosConfig.clear({ emitEvent: false });

    autoConfigs.forEach((cfg) => {
      this.postosConfig.push(
        this.createPostoConfigGroup(cfg.tipoPosto as TipoPosto, {
          ...cfg,
          valorDiariaCobrada: baseValorDiaria,
          valorBeneficiosExtrasMensal: baseBeneficios,
        }),
        { emitEvent: false },
      );
    });

    this.formContrato.get('numeroPostos')?.setValue(this.postosConfig.length, { emitEvent: false });
    this.syncingPostos = false;
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

    group.patchValue({
      quantidadeAlocacoes: cfg.alocacoes,
      quantidadeFuncionariosPorAlocacao: cfg.funcionariosPorAlocacao,
      alocacoesNoturnas: cfg.alocacoesNoturnas,
    }, { emitEvent: true });
  }

  ngOnInit(): void {
    this.buildForms();
    this.setupQuantidadeIdealRespect();
    this.setupAutoCalculo();
    this.carregarEstados();
    this.loadTags();
  }

  loadTags(): void {
    this.tagService.getAll().subscribe({
      next: (data) => this.tags.set(data),
      error: (err) => console.error('Erro ao carregar tags:', err),
    });
  }

  openCreateTag(): void {
    this.tagForm.reset();
    this.tagFormError.set(null);
    this.tagFormSuccess.set(null);
    this.showTagModal.set(true);
  }

  closeTagModal(): void {
    this.showTagModal.set(false);
    this.tagForm.reset();
    this.tagFormError.set(null);
    this.tagFormSuccess.set(null);
  }

  saveTag(): void {
    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }

    const val = this.tagForm.value;
    const dto = {
      nome: val.nome!,
      valor: Number(val.valor ?? 0),
      descricao: val.descricao || undefined,
    };

    this.savingTag.set(true);
    this.tagFormError.set(null);

    this.tagService.create(dto).subscribe({
      next: () => {
        this.tagFormSuccess.set('Tag criada com sucesso!');
        setTimeout(() => {
          this.closeTagModal();
          this.loadTags();
          this.tagFormSuccess.set(null);
        }, 1500);
      },
      error: (err) => {
        this.tagFormError.set(err?.error?.error ?? 'Erro ao criar tag.');
        this.savingTag.set(false);
      },
      complete: () => {
        this.savingTag.set(false);
      },
    });
  }

  getTagErrorMessage(fieldName: string): string {
    const field = this.tagForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;

    return 'Campo inválido';
  }

  hasTagError(fieldName: string): boolean {
    const field = this.tagForm.get(fieldName);
    if (!field) return false;
    return field.invalid && field.touched;
  }

  carregarEstados(): void {
    this.ibgeService.getEstados().subscribe((estadosObj) => {
      this.estados.set(estadosObj.map((e) => e.sigla));
    });
  }

  setupAutoCalculo(): void {
    // Observar mudanças no formContrato e formCliente para recalcular via API
    this.formContrato.valueChanges
      .pipe(
        debounceTime(500), // Aguarda 500ms após última mudança
        distinctUntilChanged(),
        switchMap((valores) => {
          // Só calcular se checkbox estiver marcado
          if (!valores.criarContrato) {
            this.breakdown.set(null);
            return of(null);
          }

          const postos = valores.postosConfig || [];
          if (!postos.length) return of(null);

          // Build input for each posto
          const requests = postos.map((posto: any) => {
            const input = buildCalculoValorTotalInput({
              postos: [posto as PostoCalculoInput],
              valorDiariaCobrada: posto.valorDiariaCobrada || 0,
              valorBeneficiosExtrasMensal: posto.valorBeneficiosExtrasMensal || 0,
              percentualEncargosProvisoes: (valores.percentualImpostos || 0) / 100,
              percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100,
              percentualAdicionalFimSemana: (valores.percentualAdicionalFimSemana || 100) / 100,
              margemLucroPercentual: (valores.percentualMargemLucro || 0) / 100,
              margemCoberturaFaltasPercentual: (valores.percentualMargemFaltas || 0) / 100,
            }, TIPO_POSTO_CONFIGS);
            
            if (input.diariasTotaisMes <= 0) {
              const simulacaoInput = {
                valorDiaria: posto.valorDiariaCobrada || 0,
                numeroDePostos: 1,
                percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100,
                percentualAdicionalFimSemana: (valores.percentualAdicionalFimSemana || 100) / 100,
                alocacoesPorPosto: posto.quantidadeAlocacoes || 1,
                funcionariosPorAlocacao: posto.quantidadeFuncionariosPorAlocacao || 1,
                diasUteisMes: 22,
                diasFimSemanaMes: 8,
                feriadosAno: 11,
                diasTrabalhadosPorFuncionarioMes: 15,
                valorBeneficioMensalPorFuncionario: posto.valorBeneficiosExtrasMensal || 0,
                percentualEncargosProvisoes: (valores.percentualImpostos || 0) / 100,
                margemLucroPercentual: (valores.percentualMargemLucro || 0) / 100,
                margemCoberturaFaltasPercentual: (valores.percentualMargemFaltas || 0) / 100
              };
              return this.calculoService.simularSemAlocacoes(simulacaoInput);
            }
            
            return this.calculoService.calcularValorTotal(input);
          });

          this.calculando.set(true);
          this.erroCalculo.set(null);
          return forkJoin(requests);
        }),
      )
      .subscribe({
        next: (resultados: any) => {
          this.calculando.set(false);
          if (resultados && resultados.length > 0) {
            const combined = {
              valorTotalMensal: 0,
              custoBaseMensal: 0,
              valorMargemLucro: 0,
              valorMargemFaltas: 0,
              custoDiariasFimSemana: 0,
              custoAdicionalNoturno: 0,
            };
            resultados.forEach((res: any) => {
              if (res) {
                combined.valorTotalMensal += (res.valorTotalMensal ?? res.faturamentoSimulado) || 0;
                combined.custoBaseMensal += res.custoBaseMensal || 0;
                combined.valorMargemLucro += res.valorMargemLucro || 0;
                combined.valorMargemFaltas += res.valorMargemFaltas || 0;
                combined.custoDiariasFimSemana += res.custoDiariasFimSemana || 0;
                combined.custoAdicionalNoturno += res.custoAdicionalNoturno || 0;
              }
            });
            this.breakdown.set(combined);
          } else {
            this.breakdown.set(null);
          }
        },
        error: (err) => {
          this.calculando.set(false);
          this.erroCalculo.set(err.error?.error || 'Erro ao calcular valores');
          this.breakdown.set(null);
        },
      });

    // Também observar mudanças nos campos profundos de Array para forçar recálculo
    this.formContrato
      .get('postosConfig')
      ?.valueChanges.pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        const criarContrato = this.formContrato.get('criarContrato')?.value;
        if (criarContrato) {
          this.formContrato.patchValue({ ...this.formContrato.value }, { emitEvent: true });
        }
      });
  }

  buildForms(): void {
    // Etapa 1: Cliente
    this.formCliente = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, cnpjValidator]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      quantidadeIdealPorTurno: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      horarioTrocaTurno: ['06:00', [Validators.required]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['', [telefoneValidator]],
    });
    this.setupLocationWatcher();

    // Etapa 2: Contrato (opcional)
    this.formContrato = this.fb.group({
      criarContrato: [false], // Checkbox para habilitar
      modoPersonalizado: [false],
      descricao: ['Contrato de prestação de serviços de vigilância', []],
      numeroPostos: [1, [Validators.required, Validators.min(1)]],
      postosConfig: this.fb.array([this.createPostoConfigGroup()]),

      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentualAdicionalNoturno: [
        20,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      percentualAdicionalFimSemana: [
        100,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      percentualMargemLucro: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      percentualMargemFaltas: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
      dataInicio: [this.formatDate(new Date()), [Validators.required]],
      mesesDuracao: [6, [Validators.required, Validators.min(1), Validators.max(60)]],
      status: [StatusContrato.ATIVO],
    });

    // Etapa 3: Funcionários (opcional)
    this.formFuncionarios = this.fb.group({
      adicionarFuncionarios: [false], // Checkbox para habilitar
      funcionarios: this.fb.array([]),
    });
    this.setupPostosConfigWatcher();
  }

  private setupLocationWatcher(): void {
    const estadoControl = this.formCliente.get('estado');
    const cidadeControl = this.formCliente.get('cidade');

    estadoControl?.valueChanges.subscribe((uf: string) => {
      const estado = String(uf ?? '').toUpperCase();
      if (estadoControl.value !== estado) {
        estadoControl.setValue(estado, { emitEvent: false });
      }

      if (estado) {
        this.ibgeService.getMunicipiosPorEstado(estado).subscribe((municipios) => {
          const cidadesDoEstado = municipios.map((m) => m.nome);
          this.cidadesDisponiveis.set(cidadesDoEstado);

          const cidadeAtual = String(cidadeControl?.value ?? '');
          if (cidadeAtual && !cidadesDoEstado.includes(cidadeAtual)) {
            cidadeControl?.setValue('');
          }
        });
      } else {
        this.cidadesDisponiveis.set([]);
        cidadeControl?.setValue('');
      }
    });
  }

  createPostoConfigGroup(
    tipo: TipoPosto | string = TipoPosto.ESCALA_12X36,
    overrides?: Partial<PostoConfigAutoGerado & { valorDiariaCobrada: number; valorBeneficiosExtrasMensal: number }>,
  ): FormGroup {
    let cleanTipo = String(tipo);
    if (cleanTipo.includes(': ')) {
      cleanTipo = cleanTipo.split(': ').slice(1).join(': ').trim();
    }
    const cfg = TIPO_POSTO_CONFIGS[cleanTipo as TipoPosto] || TIPO_POSTO_CONFIGS[TipoPosto.PERSONALIZADO];
    const group = this.fb.group({
      tipoPosto: [overrides?.tipoPosto ?? cleanTipo, Validators.required],
      quantidadeAlocacoes: [overrides?.quantidadeAlocacoes ?? cfg.alocacoes, [Validators.required, Validators.min(1)]],
      quantidadeFuncionariosPorAlocacao: [overrides?.quantidadeFuncionariosPorAlocacao ?? cfg.funcionariosPorAlocacao, [Validators.required, Validators.min(1)]],
      alocacoesNoturnas: [overrides?.alocacoesNoturnas ?? cfg.alocacoesNoturnas, [Validators.required, Validators.min(0)]],
      valorDiariaCobrada: [overrides?.valorDiariaCobrada ?? 100, [Validators.required, Validators.min(0.01)]],
      valorBeneficiosExtrasMensal: [overrides?.valorBeneficiosExtrasMensal ?? 350, [Validators.required, Validators.min(0)]],
    });

    // Auto-preencher quando o tipo mudar
    group.get('tipoPosto')?.valueChanges.subscribe((newTipo) => {
      if (newTipo) {
        this.applyTipoPostoConfig(group, newTipo as TipoPosto);
        this.recomputarPostosAutomatico();
      }
    });

    return group;
  }

  setupPostosConfigWatcher() {
    this.formContrato.get('numeroPostos')?.valueChanges.subscribe((num) => {
      if (this.syncingPostos) {
        return;
      }

      if (!this.isModoPersonalizado()) {
        this.recomputarPostosAutomatico();
        return;
      }

      const currentLen = this.postosConfig.length;
      if (num > currentLen && num <= 20) {
        for (let i = currentLen; i < num; i++) {
          this.postosConfig.push(this.createPostoConfigGroup());
        }
      } else if (num < currentLen && num >= 1) {
        for (let i = currentLen - 1; i >= num; i--) {
          this.postosConfig.removeAt(i);
        }
      }
    });
  }

  private setupQuantidadeIdealRespect(): void {
    this.formCliente
      .get('quantidadeIdealPorTurno')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.recomputarPostosAutomatico();
      });

    this.formContrato
      .get('modoPersonalizado')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((modoPersonalizado) => {
        if (!modoPersonalizado) {
          this.recomputarPostosAutomatico();
        }
      });
  }

  // Getters para FormArrays
  get funcionarios(): FormArray {
    return this.formFuncionarios.get('funcionarios') as FormArray;
  }

  get postosConfig(): FormArray {
    return this.formContrato.get('postosConfig') as FormArray;
  }

  // Helpers para validação
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.formCliente.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && field.touched;
    }

    return field.invalid && field.touched;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.formCliente.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
    if (errors['cnpjInvalid']) return 'CNPJ inválido (verifique o formato e os dígitos)';
    if (errors['cpfInvalid']) return 'CPF inválido (verifique o formato e os dígitos)';
    if (errors['telefoneInvalid']) return 'Telefone inválido (ex: (11) 99999-9999)';
    if (errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }

  isEdit = signal(false); // Wizard sempre é criação, nunca edição

  // Métodos auxiliares
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calcularDataFim(): string {
    const dataInicio = this.formContrato.get('dataInicio')?.value;
    const mesesDuracao = this.formContrato.get('mesesDuracao')?.value || 2;

    if (!dataInicio) return '';

    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + mesesDuracao);

    return this.formatDate(data);
  }

  calcularDuracaoMeses(): string {
    const meses = this.formContrato?.get('mesesDuracao')?.value || 0;
    if (meses === 0) return '';
    if (meses === 1) return 'Duração: 1 mês';
    if (meses < 12) return `Duração: ${meses} meses`;

    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;

    if (mesesRestantes === 0) {
      return anos === 1 ? 'Duração: 1 ano' : `Duração: ${anos} anos`;
    }

    const anoTexto = anos === 1 ? '1 ano' : `${anos} anos`;
    const mesTexto = mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`;
    return `Duração: ${anoTexto} e ${mesTexto}`;
  }

  // Gerenciar funcionários
  addFuncionario(): void {
    const funcionarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, cpfValidator]],
      celular: ['', [telefoneValidator]],
      tipoFuncionario: [TipoFuncionario.CLT, [Validators.required]],
      statusFuncionario: [StatusFuncionario.ATIVO, [Validators.required]],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, [Validators.required]],
    });

    this.funcionarios.push(funcionarioForm);
  }

  removeFuncionario(index: number): void {
    this.funcionarios.removeAt(index);
  }

  contarFuncionariosPorStatus(status: string): number {
    return this.funcionarios.controls.filter(
      (func) => func.get('statusFuncionario')?.value === status,
    ).length;
  }

  contarFuncionariosPorTipo(tipo: string): number {
    return this.funcionarios.controls.filter((func) => func.get('tipoFuncionario')?.value === tipo)
      .length;
  }

  // Navegação entre steps
  nextStep(): void {
    const step = this.currentStep();

    // Marca campos como touched para mostrar erros
    if (step === 1) {
      this.markFormGroupTouched(this.formCliente);
    } else if (step === 2) {
      const criarContrato = this.formContrato?.get('criarContrato')?.value;
      if (criarContrato) {
        this.markFormGroupTouched(this.formContrato);
      }
    }

    if (this.currentStep() < this.totalSteps && this.canGoNext()) {
      this.currentStep.update((v) => v + 1);
      this.error.set(null);
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  previousStep(): void {
    if (this.canGoBack()) {
      this.currentStep.update((v) => v - 1);
      this.error.set(null);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      const currentStepNum = this.currentStep();

      // Se tentar avançar, valida o step atual primeiro
      if (step > currentStepNum) {
        // Validar STEP 1 (Cliente)
        if (currentStepNum === 1 && !this.formCliente.valid) {
          this.markFormGroupTouched(this.formCliente);
          this.error.set('Preencha todos os campos obrigatórios do cliente antes de avançar');
          return;
        }

        // Validar STEP 2 (Contrato - se habilitado)
        if (currentStepNum === 2) {
          const criarContrato = this.formContrato?.get('criarContrato')?.value;
          if (criarContrato && !this.formContrato?.valid) {
            this.markFormGroupTouched(this.formContrato);
            this.error.set('Preencha todos os campos obrigatórios do contrato antes de avançar');
            return;
          }
        }
      }

      // Sempre permite mudar de step (navegação livre)
      this.currentStep.set(step);
      this.error.set(null);
    }
  }

  // Submissão final
  async onSubmit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const criarContrato = this.formContrato.get('criarContrato')?.value;

      if (!criarContrato) {
        // Se não criar contrato, criar apenas cliente
        const clienteId = await this.criarCliente();
        this.router.navigate(['/clientes', clienteId]);
        return;
      }

      // Usar endpoint /api/clientes-completos para criar tudo junto
      const payload = this.montarPayloadCompleto();

      console.log(
        'Payload enviado para /api/clientes-completos:',
        JSON.stringify(payload, null, 2),
      );

      this.clienteService.createCompleto(payload).subscribe({
        next: async (response: CriarClienteCompletoOutput) => {
          console.log('Resposta recebida:', response);

          // Funcionários já foram criados pelo orquestrador no backend

          this.loading.set(false);
          this.router.navigate(['/clientes', response.cliente.id]);
        },
        error: (err) => {
          this.loading.set(false);
          const errorMessage =
            err.error?.error ||
            err.error?.message ||
            err.message ||
            'Erro ao criar cliente completo';
          this.error.set(errorMessage);
          console.error('Erro detalhado:', err);
          console.error('Status:', err.status);
          console.error('Error body:', err.error);
        },
      });
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao processar dados');
      this.loading.set(false);
      console.error('Erro:', err);
    }
  }

  private montarPayloadCompleto(): any {
    const formClienteValue = this.formCliente.value;
    const formContratoValue = this.formContrato.value;

    // Limpar telefone (remover parênteses, espaços e hífens) - aceita null/vazio
    let telefone = formClienteValue.telefoneEmergencia || '';
    if (telefone) {
      telefone = telefone.replace(/[\(\)\s\-]/g, '');
    }

    // Determinar valores agregados/médios ou do primeiro posto para o payload base do backend
    const postosConfigValues = formContratoValue.postosConfig || [];
    const firstConfig = postosConfigValues[0] || {};
    const numeroPostos = formContratoValue.numeroPostos || 1;

    // Data de término calculada
    const dataFim = this.calcularDataFim();

    return {
      cliente: {
        nome: formClienteValue.nome,
        cnpj: formClienteValue.cnpj,
        cidade: formClienteValue.cidade,
        estado: formClienteValue.estado,
        quantidadeIdealPorTurno: formClienteValue.quantidadeIdealPorTurno,
        horarioTrocaTurno: formClienteValue.horarioTrocaTurno,
        emailGestor: formClienteValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      },
      contrato: {
        descricao: formContratoValue.descricao || `Contrato - ${formClienteValue.nome}`,
        valorTotalMensal: this.faturamentoMensal(),
        valorDiariaCobrada: firstConfig.valorDiariaCobrada || 0,
        percentualAdicionalNoturno: (formContratoValue.percentualAdicionalNoturno || 0) / 100,
        percentualAdicionalFimSemana: (formContratoValue.percentualAdicionalFimSemana || 100) / 100,
        valorBeneficiosExtrasMensal: firstConfig.valorBeneficiosExtrasMensal || 0,
        percentualEncargosProvisoes: (formContratoValue.percentualImpostos || 0) / 100,
        margemLucroPercentual: (formContratoValue.percentualMargemLucro || 0) / 100,
        margemCoberturaFaltasPercentual: (formContratoValue.percentualMargemFaltas || 0) / 100,
        dataInicio: formContratoValue.dataInicio,
        dataFim: dataFim,
        status: 'ATIVO', // Status inicial sempre ATIVO
        tags: this.selectedTagIds().map((tagId) => ({
          tagId,
          valorDiaria: this.getTagRate(tagId),
        })),
      },
      criarPostosAutomaticamente: true,
      numeroDePostos: numeroPostos,
      postoConfigs: postosConfigValues.map((posto: any) => ({
        tipoPosto: posto.tipoPosto,
        quantidadeAlocacoes: posto.quantidadeAlocacoes,
        quantidadeFuncionariosPorAlocacao: posto.quantidadeFuncionariosPorAlocacao,
        alocacoesNoturnas: posto.alocacoesNoturnas,
        valorDiariaCobrada: posto.valorDiariaCobrada,
        valorBeneficiosExtrasMensal: posto.valorBeneficiosExtrasMensal,
      })),
      funcionarios: this.funcionarios.value.map((func: any) => ({
        nome: func.nome,
        cpf: func.cpf,
        celular: func.celular || '',
        tipoFuncionario: func.tipoFuncionario,
        statusFuncionario: func.statusFuncionario,
        tipoEscala: func.tipoEscala
      }))
    };
  }

  onContratoTagsChange(tagIds: string[]): void {
    const currentRates = this.tagRateById();
    const defaultRate =
      Number(this.formContrato?.value?.postosConfig?.[0]?.valorDiariaCobrada) || 0;
    const nextRates: Record<string, number> = {};

    for (const tagId of tagIds) {
      nextRates[tagId] = currentRates[tagId] ?? defaultRate;
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
    return Number(this.formContrato?.value?.postosConfig?.[0]?.valorDiariaCobrada) || 0;
  }

  getTagPercentualAcima(tag: Tag, rate: number): string {
    if (!tag.valor || tag.valor === 0) return '';
    const pct = ((rate - tag.valor) / tag.valor) * 100;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(0)}% do valor base`;
  }

  private async criarCliente(): Promise<string> {
    return new Promise((resolve, reject) => {
      const formValue = this.formCliente.value;

      // Limpar telefone (remover parênteses, espaços e hífens)
      let telefone = formValue.telefoneEmergencia || '';
      telefone = telefone.replace(/[\(\)\s\-]/g, '');

      const payload = {
        nome: formValue.nome,
        cnpj: formValue.cnpj,
        cidade: formValue.cidade,
        estado: formValue.estado,
        quantidadeIdealPorTurno: formValue.quantidadeIdealPorTurno,
        horarioTrocaTurno: formValue.horarioTrocaTurno,
        emailGestor: formValue.emailGestor || null,
        telefoneEmergencia: telefone || null,
      };

      this.clienteService.create(payload).subscribe({
        next: (response) => {
          resolve(response.id);
        },
        error: (err) => reject(err),
      });
    });
  }

  cancel(): void {
    if (confirm('Deseja cancelar? Todos os dados serão perdidos.')) {
      this.router.navigate(['/clientes']);
    }
  }
}
