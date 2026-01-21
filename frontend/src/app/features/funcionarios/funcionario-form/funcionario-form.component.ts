import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import { StatusFuncionario, TipoFuncionario, TipoEscala, Contrato, StatusContrato } from '../../../models';

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
  private contratoService = inject(ContratoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  funcionarioId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  condominios = signal<any[]>([]);
  contratos = signal<Contrato[]>([]);

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
    this.setupCondominioChange();

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

  setupCondominioChange(): void {
    this.form.get('condominioId')?.valueChanges.subscribe((condominioId) => {
      if (condominioId) {
        this.loadContratos(condominioId);
      } else {
        this.contratos.set([]);
      }
    });
  }

  loadContratos(condominioId: string): void {
    this.contratoService.getAll().subscribe({
      next: (data) => {
        const contratosDoCondominio = data.filter(
          (c) => c.condominioId === condominioId && c.status !== StatusContrato.FINALIZADO
        );
        this.contratos.set(contratosDoCondominio);
      },
      error: (err) => console.error('Erro ao carregar contratos:', err),
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cpf: ['', [Validators.required, this.cpfValidator]],
      celular: ['', [Validators.required, this.celularValidator]],
      statusFuncionario: [StatusFuncionario.ATIVO, Validators.required],
      tipoFuncionario: [TipoFuncionario.CLT, Validators.required],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, Validators.required],
    });

    this.setupFormatListeners();
  }

  private cpfValidator(control: any) {
    if (!control.value) return null;
    const cleaned = control.value.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      return { cpfInvalid: true };
    }
    return null;
  }

  private celularValidator(control: any) {
    if (!control.value) return null;
    const cleaned = control.value.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) {
      return { celularInvalid: true };
    }
    return null;
  }

  private setupFormatListeners(): void {
    this.form.get('cpf')?.valueChanges.subscribe((value) => {
      if (value) {
        const cleaned = value.replace(/\D/g, '');
        const formatted = this.formatCPF(cleaned);
        if (formatted !== value) {
          this.form.get('cpf')?.setValue(formatted, { emitEvent: false });
        }
      }
    });

    this.form.get('celular')?.valueChanges.subscribe((value) => {
      if (value) {
        const cleaned = value.replace(/\D/g, '');
        const formatted = this.formatCelular(cleaned);
        if (formatted !== value) {
          this.form.get('celular')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
  }

  private formatCPF(value: string): string {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }

  private formatCelular(value: string): string {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  loadFuncionario(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue(data);
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

    if (this.contratos().length === 0 && !this.isEdit()) {
        this.error.set('Não há contratos ativos para o condomínio selecionado. Cadastre um contrato primeiro.');
        return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = {
      ...this.form.value,
      cpf: this.form.value.cpf.replace(/\D/g, ''),
      celular: this.form.value.celular.replace(/\D/g, ''),
      contratoId: this.isEdit() ? this.form.value.contratoId : this.contratos()[0].id,
    };

    const request = this.isEdit()
      ? this.service.update(this.funcionarioId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.loading.set(false);
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
    if (errors['cpfInvalid']) return 'CPF deve conter 11 dígitos';
    if (errors['celularInvalid']) return 'Celular deve conter 10 ou 11 dígitos';

    return 'Campo inválido';
  }
}
