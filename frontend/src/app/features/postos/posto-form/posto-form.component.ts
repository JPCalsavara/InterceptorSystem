import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import { CepService } from '../../../services/cep.service';
import { Cliente, Posto, Contrato } from '../../../models/index';
import { FormInputComponent } from '../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-posto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormInputComponent, FormSelectComponent],
  templateUrl: './posto-form.component.html',
  styleUrl: './posto-form.component.scss',
})
export class PostoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PostoService);
  private clienteService = inject(ClienteService);
  private contratoService = inject(ContratoService);
  private cepService = inject(CepService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  clientes = signal<Cliente[]>([]);
  contratos = signal<Contrato[]>([]);
  loading = signal(false);
  loadingCep = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  isEditMode = signal(false);
  postoId: string | null = null;

  clienteOptions = computed(() => 
    this.clientes().map(c => ({ value: c.id, label: c.nome }))
  );

  contratoOptions = computed(() => 
    this.contratos().map(c => ({ value: c.id, label: c.descricao }))
  );

  ngOnInit(): void {
    this.postoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.postoId);

    this.form = this.fb.group({
      clienteId: ['', Validators.required],
      contratoId: [{value: '', disabled: true}, Validators.required],
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
        this.contratos.set([]);
        this.form.get('contratoId')?.setValue('');
        this.form.get('contratoId')?.disable();
        return;
      }
      this.form.get('contratoId')?.enable();
      this.contratoService.getByClienteId(clienteId).subscribe({
        next: (data) => this.contratos.set(data),
        error: (err) => {
          this.error.set('Erro ao carregar contratos.');
          console.error(err);
        }
      });
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
          contratoId: data.contratoId,
          nome: data.nome,
          cep: this.cepService.formatCep(data.cep),
          endereco: data.endereco,
          numero: data.numero,
          complemento: data.complemento ?? '',
          cidade: data.cidade,
          estado: data.estado,
        });
        this.form.get('clienteId')?.disable();
        this.form.get('contratoId')?.disable();
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
          contratoId: formValue.contratoId,
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

}
