import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { CepService } from '../../../services/cep.service';
import { Cliente, Posto } from '../../../models/index';

@Component({
  selector: 'app-posto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './posto-form.component.html',
  styleUrl: './posto-form.component.scss',
})
export class PostoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PostoService);
  private clienteService = inject(ClienteService);
  private cepService = inject(CepService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  loadingCep = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  isEditMode = signal(false);
  postoId: string | null = null;

  ngOnInit(): void {
    this.postoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.postoId);

    this.form = this.fb.group({
      clienteId: ['', Validators.required],
      nome: ['', [Validators.required, Validators.maxLength(150)]],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      endereco: ['', [Validators.required, Validators.maxLength(250)]],
      numero: ['', [Validators.required, Validators.maxLength(20)]],
      complemento: ['', [Validators.maxLength(120)]],
      cidade: ['', [Validators.required, Validators.maxLength(100)]],
      estado: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(2),
          Validators.pattern(/^[A-Za-z]{2}$/),
        ],
      ],
    });

    this.setupClienteChange();
    this.loadClientes();

    if (this.isEditMode() && this.postoId) {
      this.loadPosto(this.postoId);
    }
  }

  private setupClienteChange(): void {
    this.form.get('clienteId')?.valueChanges.subscribe((clienteId) => {
      if (!clienteId) {
        return;
      }
    });
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => {
        this.error.set('Erro ao carregar clientes.');
        console.error(err);
      },
    });
  }

  loadPosto(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: Posto) => {
        this.form.patchValue({
          clienteId: data.clienteId,
          nome: data.nome,
          cep: this.cepService.formatCep(data.cep),
          endereco: data.endereco,
          numero: data.numero,
          complemento: data.complemento ?? '',
          cidade: data.cidade,
          estado: data.estado,
        });
        this.form.get('clienteId')?.disable();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar posto.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue();
    const cepNormalizado = this.cepService.onlyDigits(formValue.cep);
    const payload = {
      nome: (formValue.nome || '').trim(),
      cep: cepNormalizado,
      endereco: (formValue.endereco || '').trim(),
      numero: (formValue.numero || '').trim(),
      complemento: (formValue.complemento || '').trim() || null,
      cidade: (formValue.cidade || '').trim(),
      estado: (formValue.estado || '').trim().toUpperCase(),
    };

    if (this.isEditMode() && this.postoId) {
      this.service.update(this.postoId, payload).subscribe({
        next: () => this.router.navigate(['/postos']),
        error: (err) => {
          this.error.set(err.error?.error || 'Erro ao atualizar posto.');
          this.loading.set(false);
        },
      });
    } else {
      this.service
        .create({
          clienteId: formValue.clienteId,
          ...payload,
        })
        .subscribe({
          next: () => this.router.navigate(['/postos']),
          error: (err) => {
            this.error.set(err.error?.error || 'Erro ao criar posto.');
            this.loading.set(false);
          },
        });
    }
  }

  onCepInput(): void {
    const control = this.form.get('cep');
    if (!control) return;

    const formatted = this.cepService.formatCep(control.value || '');
    if (formatted !== control.value) {
      control.setValue(formatted, { emitEvent: false });
    }

    this.clearCustomCepError();
  }

  onCepBlur(): void {
    const cepControl = this.form.get('cep');
    if (!cepControl) return;

    const cep = cepControl.value || '';
    if (!this.cepService.isCepValido(cep)) {
      return;
    }

    this.loadingCep.set(true);
    this.error.set(null);

    this.cepService
      .buscarCep(cep)
      .pipe(finalize(() => this.loadingCep.set(false)))
      .subscribe({
        next: (endereco) => {
          this.clearCustomCepError();
          this.form.patchValue({
            cep: this.cepService.formatCep(endereco.cep),
            endereco: endereco.logradouro || this.form.get('endereco')?.value,
            cidade: endereco.cidade || this.form.get('cidade')?.value,
            estado: (endereco.estado || this.form.get('estado')?.value || '').toUpperCase(),
            complemento:
              this.form.get('complemento')?.value ||
              endereco.complemento ||
              this.form.get('complemento')?.value,
          });
        },
        error: () => {
          this.setCustomCepError();
          this.error.set('CEP não encontrado ou indisponível no momento.');
        },
      });
  }

  onEstadoBlur(): void {
    const estadoControl = this.form.get('estado');
    if (!estadoControl) return;

    const normalized = (estadoControl.value || '').toUpperCase().slice(0, 2);
    if (normalized !== estadoControl.value) {
      estadoControl.setValue(normalized);
    }
  }

  private setCustomCepError(): void {
    const cepControl = this.form.get('cep');
    if (!cepControl) return;

    const errors = cepControl.errors || {};
    cepControl.setErrors({ ...errors, cepNotFound: true });
  }

  private clearCustomCepError(): void {
    const cepControl = this.form.get('cep');
    if (!cepControl?.errors?.['cepNotFound']) return;

    const { cepNotFound, ...rest } = cepControl.errors;
    cepControl.setErrors(Object.keys(rest).length ? rest : null);
  }

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.touched || this.submitted()) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.submitted())) return '';
    if (field.errors['required']) return 'Este campo é obrigatório';
    if (field.errors['pattern']) {
      if (fieldName === 'cep') return 'Informe um CEP válido no formato 00000-000';
      if (fieldName === 'estado') return 'UF deve conter 2 letras';
    }
    if (field.errors['cepNotFound']) return 'CEP não encontrado';
    if (field.errors['maxlength']) return 'Ultrapassou o limite de caracteres';
    if (field.errors['minlength']) return 'Mínimo de caracteres não atingido';
    return 'Campo inválido';
  }
}
