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
    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      valorDiariaCobrada: [0, [Validators.required, Validators.min(0)]],
      percentualAdicionalNoturno: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      valorBeneficiosExtrasMensal: [0, [Validators.required, Validators.min(0)]],
      percentualImpostos: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantidadeFuncionarios: [0, [Validators.required, Validators.min(1)]],
      margemLucroPercentual: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      margemCoberturaFaltasPercentual: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      dataInicio: ['', Validators.required],
      dataFim: ['', Validators.required],
      status: [StatusContrato.PENDENTE, Validators.required],
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
            valorBeneficiosExtrasMensal: valores.valorBeneficiosExtrasMensal || 0,
            percentualImpostos: (valores.percentualImpostos || 0) / 100, // UI: 15, Backend: 0.15
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
