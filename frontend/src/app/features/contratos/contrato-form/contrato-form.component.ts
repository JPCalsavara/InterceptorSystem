import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { CondominioService } from '../../../services/condominio.service';
import { StatusContrato } from '../../../models/index';

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

  StatusContrato = StatusContrato;
  statusOptions = [
    { value: StatusContrato.PAGO, label: 'Pago' },
    { value: StatusContrato.PENDENTE, label: 'Pendente' },
    { value: StatusContrato.INATIVO, label: 'Inativo' },
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

    // Observar mudanças nos campos para recalcular o valor total
    this.form.valueChanges.subscribe(() => {
      this.calcularValorTotal();
    });
  }

  calcularValorTotalMensal(): number {
    const valores = this.form.value;

    // Calcular valor por funcionário: (diária × 30 dias + benefícios extras)
    const valorDiariaMensal = (valores.valorDiariaCobrada || 0) * 30;
    const beneficiosPorFuncionario = valores.valorBeneficiosExtrasMensal || 0;
    const valorPorFuncionario = valorDiariaMensal + beneficiosPorFuncionario;

    // Multiplicar pela quantidade de funcionários
    const quantidadeFuncionarios = valores.quantidadeFuncionarios || 0;
    const base = valorPorFuncionario * quantidadeFuncionarios;

    return base;
  }

  calcularValorTotal(): number {
    const valores = this.form.value;

    // Base: Calcular valor total mensal
    let base = this.calcularValorTotalMensal();

    // Aplicar percentual adicional noturno APENAS A METADE (50% dos funcionários)
    if (valores.percentualAdicionalNoturno > 0) {
      base += base * 0.5 * (valores.percentualAdicionalNoturno / 100);
    }

    // Aplicar margem de cobertura de faltas
    if (valores.margemCoberturaFaltasPercentual > 0) {
      base += base * (valores.margemCoberturaFaltasPercentual / 100);
    }

    // Aplicar margem de lucro
    if (valores.margemLucroPercentual > 0) {
      base += base * (valores.margemLucroPercentual / 100);
    }

    // Aplicar impostos
    if (valores.percentualImpostos > 0) {
      base += base * (valores.percentualImpostos / 100);
    }

    return base;
  }

  get valorTotalMensalCalculado(): number {
    return this.calcularValorTotalMensal();
  }

  get valorTotalCalculado(): number {
    return this.calcularValorTotal();
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

    // Adicionar o valorTotalMensal calculado e converter percentuais de 0-100 para 0-1
    const formValue = {
      ...this.form.value,
      valorTotalMensal: this.calcularValorTotalMensal(),
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
