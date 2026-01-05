import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';
import { CondominioService } from '../../../services/condominio.service';
import { StatusFuncionario, TipoFuncionario, TipoEscala } from '../../../models/index';

@Component({
  selector: 'app-funcionario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './funcionario-form.component.html',
  styleUrl: './funcionario-form.component.scss',
})
export class FuncionarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(FuncionarioService);
  private condominioService = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  funcionarioId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  condominios = signal<any[]>([]);

  StatusFuncionario = StatusFuncionario;
  TipoFuncionario = TipoFuncionario;
  TipoEscala = TipoEscala;

  statusOptions = [
    { value: StatusFuncionario.ATIVO, label: 'Ativo' },
    { value: StatusFuncionario.FERIAS, label: 'Férias' },
    { value: StatusFuncionario.AFASTADO, label: 'Afastado' },
    { value: StatusFuncionario.DEMITIDO, label: 'Demitido' },
  ];

  tipoOptions = [
    { value: TipoFuncionario.CLT, label: 'CLT' },
    { value: TipoFuncionario.FREELANCER, label: 'Freelancer' },
    { value: TipoFuncionario.TERCEIRIZADO, label: 'Terceirizado' },
  ];

  escalaOptions = [
    {
      value: TipoEscala.DOZE_POR_TRINTA_SEIS,
      label: '12x36 (12 horas trabalhadas, 36 de descanso)',
    },
    { value: TipoEscala.SEMANAL_COMERCIAL, label: 'Semanal Comercial (44h semanais)' },
  ];

  ngOnInit(): void {
    this.loadCondominios();
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.funcionarioId.set(id);
      this.isEdit.set(true);
      this.loadFuncionario(id);
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
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      celular: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      salarioMensal: [0, [Validators.required, Validators.min(0)]],
      valorTotalBeneficiosMensal: [0, [Validators.min(0)]],
      valorDiariasFixas: [0, [Validators.min(0)]],
      statusFuncionario: [StatusFuncionario.ATIVO, Validators.required],
      tipoFuncionario: [TipoFuncionario.CLT, Validators.required],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, Validators.required],
    });
  }

  loadFuncionario(id: string): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          condominioId: data.condominioId,
          nome: data.nome,
          cpf: data.cpf,
          celular: data.celular,
          salarioMensal: data.salarioMensal,
          valorTotalBeneficiosMensal: data.valorTotalBeneficiosMensal,
          valorDiariasFixas: data.valorDiariasFixas,
          statusFuncionario: data.statusFuncionario,
          tipoFuncionario: data.tipoFuncionario,
          tipoEscala: data.tipoEscala,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar funcionário. Redirecionando...');
        console.error('Erro:', err);
        setTimeout(() => this.router.navigate(['/funcionarios']), 2000);
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

    const formValue = this.form.value;
    const request = this.isEdit()
      ? this.service.update(this.funcionarioId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.router.navigate(['/funcionarios']);
      },
      error: (err) => {
        this.error.set(
          this.isEdit()
            ? 'Erro ao atualizar funcionário. Tente novamente.'
            : 'Erro ao criar funcionário. Tente novamente.'
        );
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/funcionarios']);
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
    if (errors['pattern']) {
      if (fieldName === 'cpf') return 'CPF deve conter 11 dígitos';
      if (fieldName === 'celular') return 'Celular deve conter 10 ou 11 dígitos';
    }

    return 'Campo inválido';
  }
}
