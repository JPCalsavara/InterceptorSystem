import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { ClienteService } from '../../../services/cliente.service';
import {
  cnpjValidator,
  telefoneValidator,
} from '../../../shared/validators/br-documents.validators';
import { IbgeService } from '../../../services/ibge.service';
import { FormInputComponent } from '../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxMaskDirective, FormInputComponent, FormSelectComponent],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss',
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ibgeService = inject(IbgeService);

  form!: FormGroup;
  isEdit = signal(false);
  clienteId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  estados = signal<{value: string, label: string}[]>([]);
  selectedEstado = signal('');
  cidadesDisponiveis = signal<{value: string, label: string}[]>([]);

  ngOnInit(): void {
    this.buildForm();
    this.setupLocationWatcher();
    this.carregarEstados();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId.set(id);
      this.isEdit.set(true);
      this.loadCliente(id);
    }
  }

  carregarEstados(): void {
    this.ibgeService.getEstados().subscribe((estadosObj) => {
      this.estados.set(estadosObj.map((e) => ({ value: e.sigla, label: e.sigla })));
    });
  }

  buildForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: ['', [Validators.required, cnpjValidator]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['', [telefoneValidator]],
    });
  }

  private setupLocationWatcher(): void {
    const estadoControl = this.form.get('estado');
    const cidadeControl = this.form.get('cidade');

    estadoControl?.valueChanges.subscribe((uf: string) => {
      const estado = String(uf ?? '').toUpperCase();
      if (estadoControl.value !== estado) {
        estadoControl.setValue(estado, { emitEvent: false });
      }

      this.selectedEstado.set(estado);

      if (estado) {
        this.ibgeService.getMunicipiosPorEstado(estado).subscribe((municipios) => {
          const cidadesDoEstado = municipios.map((m) => m.nome);
          this.cidadesDisponiveis.set(cidadesDoEstado.map(c => ({ value: c, label: c })));

          const cidadeAtual = String(cidadeControl?.value ?? '');
          if (cidadeAtual && !cidadesDoEstado.includes(cidadeAtual)) {
            cidadeControl?.setValue('');
          }
        });
      } else {
        this.cidadesDisponiveis.set([]);
        cidadeControl?.setValue('');
      }
    });
  }

  loadCliente(id: string): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nome: data.nome,
          cnpj: data.cnpj,
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

        if (err.status === 409 || errorMessage.toLowerCase().includes('duplicate')) {
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
