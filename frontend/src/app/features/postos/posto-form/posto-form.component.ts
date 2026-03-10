import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
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
      endereco: ['', [Validators.required, Validators.maxLength(250)]],
      cidade: ['', [Validators.required, Validators.maxLength(100)]],
      estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
    });

    this.loadClientes();

    if (this.isEditMode() && this.postoId) {
      this.loadPosto(this.postoId);
    }
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
          nome: data.nome,
          endereco: data.endereco,
          cidade: data.cidade,
          estado: data.estado
        });
        this.form.get('clienteId')?.setValue(data.clienteId);
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

    if (this.isEditMode() && this.postoId) {
      this.service
        .update(this.postoId, {
          nome: formValue.nome,
          endereco: formValue.endereco,
          cidade: formValue.cidade,
          estado: formValue.estado,
        })
        .subscribe({
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
          nome: formValue.nome,
          endereco: formValue.endereco,
          cidade: formValue.cidade,
          estado: formValue.estado,
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

  hasError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.invalid && (field.touched || this.submitted()) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || (!field.touched && !this.submitted())) return '';
    if (field.errors['required']) return 'Este campo é obrigatório';
    if (field.errors['maxlength']) return 'Ultrapassou o limite de caracteres';
    if (field.errors['minlength']) return 'Mínimo de caracteres não atingido';
    return 'Campo inválido';
  }
}
