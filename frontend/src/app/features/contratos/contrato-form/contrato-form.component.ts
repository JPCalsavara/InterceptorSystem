import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { ContratoCalculoService } from '../../../services/contrato-calculo.service';
import { CondominioService } from '../../../services/condominio.service';
import { StatusContrato, CalculoValorTotalOutput } from '../../../models/index';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.scss',
})
export class ContratoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ContratoService);
  private calculoService = inject(ContratoCalculoService);
  private condominioService = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  contratoId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  condominios = signal<any[]>([]);
  duracaoContrato = signal<string>(''); // Duração calculada do contrato
  activeTooltip = signal<string | null>(null); // Controla qual tooltip está aberto

  // Estado do cálculo
  calculando = signal(false);
  erroCalculo = signal<string | null>(null);
  breakdown = signal<CalculoValorTotalOutput | null>(null);

  StatusContrato = StatusContrato;
  statusOptions = [
    { value: StatusContrato.ATIVO, label: 'Ativo' },
    { value: StatusContrato.PENDENTE, label: 'Pendente' },
    { value: StatusContrato.FINALIZADO, label: 'Finalizado' },
  ];

  ngOnInit(): void {
    this.loadCondominios();
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

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => console.error('Erro ao carregar condomínios:', err),
    });
  }

  buildForm(): void {
    // Datas padrão: hoje e 6 meses depois
    const hoje = new Date();
    const seisMesesDepois = new Date();
    seisMesesDepois.setMonth(hoje.getMonth() + 6);

    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      // Valores padrão baseados no mercado de segurança patrimonial brasileiro
      valorDiariaCobrada: [100, [Validators.required, Validators.min(0)]], // R$ 100/dia é valor médio para portaria
      percentualAdicionalNoturno: [
        20, // 20% é o mínimo legal (CLT Art. 73)
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      valorBeneficiosExtrasMensal: [350, [Validators.required, Validators.min(0)]], // Vale-transporte + alimentação
      percentualImpostos: [15, [Validators.required, Validators.min(0), Validators.max(100)]], // Impostos médios (INSS + FGTS)
      quantidadeFuncionarios: [2, [Validators.required, Validators.min(1)]], // Mínimo 2 para cobertura 24h
      numeroDePostos: [2, [Validators.required, Validators.min(2), Validators.max(6)]], // 2 turnos (12x36) é padrão
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

  setupAutoCalculo(): void {
    this.form.valueChanges
      .pipe(
        debounceTime(500), // Aguarda 500ms após última mudança
        distinctUntilChanged(),
        switchMap((valores) => {
          // Validar campos necessários
          if (!valores.valorDiariaCobrada || !valores.quantidadeFuncionarios) {
            this.breakdown.set(null);
            return of(null);
          }

          // Chamar backend
          this.calculando.set(true);
          this.erroCalculo.set(null);

          const input = {
            valorDiariaCobrada: valores.valorDiariaCobrada,
            quantidadeFuncionarios: valores.quantidadeFuncionarios,
            numeroDePostos: valores.numeroDePostos || 2, // Padrão: 2 postos (12x36)
            valorBeneficiosExtrasMensal: valores.valorBeneficiosExtrasMensal || 0,
            percentualImpostos: (valores.percentualImpostos || 0) / 100, // UI: 15, Backend: 0.15
            percentualAdicionalNoturno: (valores.percentualAdicionalNoturno || 0) / 100, // UI: 20, Backend: 0.20
            margemLucroPercentual: (valores.margemLucroPercentual || 0) / 100,
            margemCoberturaFaltasPercentual: (valores.margemCoberturaFaltasPercentual || 0) / 100,
          };

          return this.calculoService.calcularValorTotal(input);
        })
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
        this.form.patchValue({
          condominioId: data.condominioId,
          descricao: data.descricao,
          valorDiariaCobrada: data.valorDiariaCobrada,
          percentualAdicionalNoturno: data.percentualAdicionalNoturno * 100, // Converter 0-1 para 0-100
          valorBeneficiosExtrasMensal: data.valorBeneficiosExtrasMensal,
          percentualImpostos: data.percentualImpostos * 100, // Converter 0-1 para 0-100
          quantidadeFuncionarios: data.quantidadeFuncionarios,
          margemLucroPercentual: data.margemLucroPercentual * 100, // Converter 0-1 para 0-100
          margemCoberturaFaltasPercentual: data.margemCoberturaFaltasPercentual * 100, // Converter 0-1 para 0-100
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
            : 'Erro ao criar contrato. Tente novamente.'
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
