import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss',
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  clienteId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId.set(id);
      this.isEdit.set(true);
      this.loadCliente(id);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cidade: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['', [this.telefoneValidator]],
    });
  }

  private telefoneValidator(control: any) {
    if (!control.value) return null;
    if (control.value.length < 10 || control.value.length > 11) {
      return { telefoneInvalid: true };
    }
    return null;
  }

  loadCliente(id: string): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nome: data.nome,
          cidade: data.cidade,
          estado: data.estado,
          emailGestor: data.emailGestor,
          telefoneEmergencia: data.telefoneEmergencia,
        });

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar cliente. Redirecionando...');
        console.error('Erro:', err);
        setTimeout(() => this.router.navigate(['/clientes']), 2000);
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

    const formValue = { ...this.form.value };

    const request = this.isEdit()
      ? this.service.update(this.clienteId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        // Detectar tipo de erro e mostrar mensagem específica
        const errorMessage = err.error?.message || err.message || '';

        if (
          err.status === 409 ||
          errorMessage.toLowerCase().includes('duplicate')
        ) {
          this.error.set('Este cliente já está cadastrado.');
        } else if (err.status === 400) {
          this.error.set('Dados inválidos. Verifique os campos obrigatórios e tente novamente.');
        } else {
          this.error.set(
            this.isEdit()
              ? 'Erro ao atualizar cliente. Tente novamente.'
              : 'Erro ao criar cliente. Tente novamente.',
          );
        }
        this.loading.set(false);
        console.error('Erro detalhado:', err);
      },
    });
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.form.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.touched || this.submitted());
    }

    return field.invalid && (field.touched || this.submitted());
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
    if (errors['cnpjInvalid']) return 'CNPJ deve conter 14 dígitos (ex: 12.345.678/0001-90)';
    if (errors['telefoneInvalid']) return 'Telefone inválido (ex: (11) 99999-9999)';
    if (errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }

  cancel(): void {
    if (this.form.dirty) {
      if (confirm('Há alterações não salvas. Deseja realmente sair?')) {
        this.router.navigate(['/clientes']);
      }
    } else {
      this.router.navigate(['/clientes']);
    }
  }
}
