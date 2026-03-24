import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { ClienteService } from '../../../services/cliente.service';
import { TagService } from '../../../services/tag.service';
import { StatusContrato, CalculoValorTotalOutput, Tag } from '../../../models/index';
import { TagPickerComponent } from '../../../shared/components/tag-picker/tag-picker.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

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
      valorBeneficiosExtrasMensal: [350, [Validators.required, Validators.min(0)]], // Vale-transporte + alimentação
      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]], // Impostos médios (INSS + FGTS)
      numeroDePostos: [2, [Validators.required, Validators.min(2), Validators.max(6)]], // 2 turnos (12x36) é padrão
      numeroDePostosNoturnos: [1, [Validators.required, Validators.min(0), Validators.max(6)]], // padrão: 1 de 2 postos é noturno
      margemLucroPercentual: [15, [Validators.required, Validators.min(0), Validators.max(100)]], // 15% margem razoável
      margemCoberturaFaltasPercentual: [
        10, // 10% para cobrir faltas e imprevistos
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      dataInicio: [this.formatDateForInput(hoje), Validators.required],
      dataFim: [this.formatDateForInput(seisMesesDepois), Validators.required],
      status: [StatusContrato.PENDENTE, Validators.required],
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

  // Calcula o total de funcionários a partir do número de postos (slots)
  getQuantidadeFuncionariosTotal(numeroDePostos: number): number {
    return numeroDePostos || 0;
  }

  setupAutoCalculo(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(500), // Aguarda 500ms após última mudança
        distinctUntilChanged(),
        switchMap((valores) => {
          // Deriva total de funcionários diretamente do número de postos (slots)
          const quantidadeFuncionarios = this.getQuantidadeFuncionariosTotal(
            valores.numeroDePostos,
          );

          // Validar campos necessários
          if (!valores.valorDiariaCobrada || !quantidadeFuncionarios) {
            this.breakdown.set(null);
            return of(null);
          }

          // Chamar backend
          this.calculando.set(true);
          this.erroCalculo.set(null);

          const input = {
            valorDiariaCobrada: valores.valorDiariaCobrada,
            quantidadeFuncionarios: quantidadeFuncionarios,
            numeroDePostos: valores.numeroDePostos || 2,
            numeroDePostosNoturnos: Math.min(
              valores.numeroDePostosNoturnos || 0,
              valores.numeroDePostos || 2,
            ),
            valorBeneficiosExtrasMensal: valores.valorBeneficiosExtrasMensal || 0,
            percentualImpostos: (valores.percentualImpostos || 0) / 100,
            percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100,
            margemLucroPercentual: (valores.margemLucroPercentual || 0) / 100,
            margemCoberturaFaltasPercentual: (valores.margemCoberturaFaltasPercentual || 0) / 100,
          };

          return this.calculoService.calcularValorTotal(input);
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

  // Getters para template
  get valorTotalCalculado(): number {
    return this.breakdown()?.valorTotalMensal || 0;
  }

  get temBreakdown(): boolean {
    return this.breakdown() !== null;
  }

  loadContrato(id: string): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: (data) => {
        const selectedTagIds = (data.tags ?? []).map((tag) => tag.tagId);
        const rates = (data.tags ?? []).reduce<Record<string, number>>((acc, tag) => {
          acc[tag.tagId] = tag.valorDiaria;
          return acc;
        }, {});

        this.selectedTagIds.set(selectedTagIds);
        this.tagRateById.set(rates);

        this.form.patchValue({
          clienteId: data.clienteId,
          descricao: data.descricao,
          valorDiariaCobrada: data.valorDiariaCobrada,
          percentualAdicionalNoturno: data.percentualAdicionalNoturno * 100,
          valorBeneficiosExtrasMensal: data.valorBeneficiosExtrasMensal,
          percentualImpostos: data.percentualImpostos * 100,
          numeroDePostos: data.numeroDePostos,
          numeroDePostosNoturnos: 0, // campo ainda não persistido na entidade Contrato
          margemLucroPercentual: data.margemLucroPercentual * 100,
          margemCoberturaFaltasPercentual: data.margemCoberturaFaltasPercentual * 100,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          status: data.status,
        });
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
    const formValue = {
      ...this.form.value,
      tags: this.selectedTagIds().map((tagId) => ({
        tagId,
        valorDiaria: this.getTagRate(tagId),
      })),
      valorTotalMensal: valorTotalMensal,
      percentualAdicionalNoturno: this.form.value.percentualAdicionalNoturno / 100,
      percentualImpostos: this.form.value.percentualImpostos / 100,
      margemLucroPercentual: this.form.value.margemLucroPercentual / 100,
      margemCoberturaFaltasPercentual: this.form.value.margemCoberturaFaltasPercentual / 100,
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
