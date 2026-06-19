import { Component, Input, OnInit, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { SvgIconComponent } from "../../svg/svg-icon.component";
import { FormInputComponent } from "../../../../../shared/components/form-input/form-input.component";
import { TagPickerComponent } from "../../../../../shared/components/tag-picker/tag-picker.component";
import { TagService } from '../../../../../services/tag.service';
import { ContratoCalculoService } from '../../../../../services/contrato-calculo.service';
import { TipoPosto, TIPO_POSTO_CONFIGS, TIPO_POSTO_OPTIONS } from '../../../../contratos/contrato-form/contrato-form.component';
import { buildCalculoValorTotalInput, computePostosByQuantidadeIdeal, PostoConfigAutoGerado, PostoCalculoInput } from '../../../../../shared/helpers/contrato-calculo.helper';
import { Tag } from '../../../../../models/index';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-wizard-step-contrato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SvgIconComponent, FormInputComponent, TagPickerComponent],
  templateUrl: './wizard-step-contrato.component.html',
  styleUrls: ['./wizard-step-contrato.component.scss']
})
export class WizardStepContratoComponent implements OnInit {
  @Input({ required: true }) formContrato!: FormGroup;
  @Input({ required: true }) formCliente!: FormGroup;
  @Output() calcular = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private tagService = inject(TagService);
  private calculoService = inject(ContratoCalculoService);

  tags = signal<Tag[]>([]);
  selectedTagIds = signal<string[]>([]);
  tagRateById = signal<Record<string, number>>({});
  
  selectedTags = computed(() => {
    const selected = new Set(this.selectedTagIds());
    return this.tags().filter((tag) => selected.has(tag.id));
  });

  showTagModal = signal(false);
  savingTag = signal(false);
  tagFormError = signal<string | null>(null);
  tagFormSuccess = signal<string | null>(null);

  tagForm = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    valor: [0, [Validators.required, Validators.min(0)]],
    descricao: ['', Validators.maxLength(500)],
  });

  TipoPosto = TipoPosto;
  tipoPostoOptions = TIPO_POSTO_OPTIONS;
  
  breakdown = signal<any>(null);
  calculando = signal(false);
  erroCalculo = signal<string | null>(null);
  loading = signal(false);

  custoOperacional = computed(() => this.breakdown()?.custoBaseMensal || 0);
  margemLucro = computed(() => this.breakdown()?.valorMargemLucro || 0);
  margemFaltas = computed(() => this.breakdown()?.valorMargemFaltas || 0);
  faturamentoMensal = computed(() => this.breakdown()?.valorTotalMensal || 0);

  ngOnInit() {
    if (this.postosConfig.length === 0) {
      this.postosConfig.push(this.createPostoConfigGroup());
    }
    this.setupAutoCalculo();
    this.loadTags();
    this.setupPostosConfigWatcher();
    this.setupQuantidadeIdealRespect();
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

    group.get('tipoPosto')?.valueChanges.subscribe((newTipo) => {
      if (newTipo) {
        this.applyTipoPostoConfig(group, newTipo as TipoPosto);
        this.recomputarPostosAutomatico();
      }
    });

    return group;
  }

  applyTipoPostoConfig(group: FormGroup, tipo: TipoPosto | string): void {
    let cleanTipo = String(tipo);
    if (cleanTipo.includes(': ')) {
      cleanTipo = cleanTipo.split(': ').slice(1).join(': ').trim();
    }
    
    if (cleanTipo === TipoPosto.PERSONALIZADO) return;
    
    const cfg = TIPO_POSTO_CONFIGS[cleanTipo as TipoPosto];
    if (!cfg) return;

    group.patchValue({
      quantidadeAlocacoes: cfg.alocacoes,
      quantidadeFuncionariosPorAlocacao: cfg.funcionariosPorAlocacao,
      alocacoesNoturnas: cfg.alocacoesNoturnas,
    }, { emitEvent: true });
  }

  private syncingPostos = false;

  recomputarPostosAutomatico(): void {
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

  get postosConfig(): FormArray {
    return this.formContrato.get('postosConfig') as FormArray;
  }

  isModoPersonalizado(): boolean {
    return Boolean(this.formContrato?.get('modoPersonalizado')?.value);
  }

  isPostoPersonalizado(index: number): boolean {
    if (this.isModoPersonalizado()) return true;
    return this.postosConfig.at(index)?.get('tipoPosto')?.value === TipoPosto.PERSONALIZADO;
  }

  getQuantidadeIdealPorTurno(): number {
    const ideal = Number(this.formCliente?.get('quantidadeIdealPorTurno')?.value ?? 1);
    return Number.isFinite(ideal) && ideal > 0 ? Math.floor(ideal) : 1;
  }

  getDivergenciasQuantidadeIdeal(): Array<{ index: number; ideal: number; atual: number }> {
    const ideal = this.getQuantidadeIdealPorTurno();
    return this.postosConfig.controls
      .map((ctrl, index) => ({
        index, ideal, atual: Number(ctrl.get('quantidadeFuncionariosPorAlocacao')?.value ?? 0)
      }))
      .filter((item) => item.atual !== item.ideal);
  }

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

  onContratoTagsChange(tagIds: string[]): void {
    this.selectedTagIds.set(tagIds);
    this.formContrato.get('tagIds')?.setValue(tagIds);
  }

  onTagRateChange(tagId: string, value: number): void {
    this.tagRateById.update(v => ({ ...v, [tagId]: value }));
    const rates = this.tagRateById();
    const ratesArray = Object.keys(rates).map(id => ({
      tagId: id,
      valorDiariaPersonalizado: rates[id]
    }));
    this.formContrato.get('tagRates')?.setValue(ratesArray);
  }

  getTagRate(tagId: string): number {
    const rates = this.tagRateById();
    if (rates[tagId] !== undefined) return rates[tagId];
    const tag = this.tags().find((t) => t.id === tagId);
    return tag?.valor || 0;
  }

  getTagPercentualAcima(tag: Tag, currentRate: number): string | null {
    if (!tag?.valor || currentRate <= tag.valor) return null;
    const diff = currentRate - tag.valor;
    const pct = (diff / tag.valor) * 100;
    if (pct < 1) return null;
    return `+${pct.toFixed(1)}% acima do base`;
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
    this.tagService.create(dto).subscribe({
      next: () => {
        this.tagFormSuccess.set('Tag criada com sucesso!');
        setTimeout(() => {
          this.closeTagModal();
          this.loadTags();
        }, 1500);
      },
      error: (err) => {
        this.tagFormError.set(err?.error?.error ?? 'Erro ao criar tag.');
      },
      complete: () => this.savingTag.set(false),
    });
  }

  hasTagError(fieldName: string): boolean {
    const field = this.tagForm.get(fieldName);
    if (!field) return false;
    return field.invalid && field.touched;
  }

  getTagErrorMessage(fieldName: string): string {
    const field = this.tagForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';
    const errors = field.errors;
    if (errors['required']) return 'Este campo é obrigatório';
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
    return 'Campo inválido';
  }

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
    if (mesesRestantes === 0) return anos === 1 ? 'Duração: 1 ano' : `Duração: ${anos} anos`;
    const anoTexto = anos === 1 ? '1 ano' : `${anos} anos`;
    const mesTexto = mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`;
    return `Duração: ${anoTexto} e ${mesTexto}`;
  }

  setupAutoCalculo(): void {
    this.formContrato.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((valores) => {
          if (!valores.criarContrato) {
            this.breakdown.set(null);
            return of(null);
          }
          const postos = valores.postosConfig || [];
          if (!postos.length) return of(null);

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
              valorTotalMensal: 0, custoBaseMensal: 0, valorMargemLucro: 0,
              valorMargemFaltas: 0, custoDiariasFimSemana: 0, custoAdicionalNoturno: 0,
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

    this.formContrato.get('postosConfig')?.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      const criarContrato = this.formContrato.get('criarContrato')?.value;
      if (criarContrato) {
        this.formContrato.patchValue({ ...this.formContrato.value }, { emitEvent: true });
      }
    });
  }
}
