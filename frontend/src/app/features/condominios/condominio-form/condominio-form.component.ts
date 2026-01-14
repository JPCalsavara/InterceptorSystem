import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CondominioService } from '../../../services/condominio.service';

@Component({
  selector: 'app-condominio-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './condominio-form.component.html',
  styleUrl: './condominio-form.component.scss',
})
export class CondominioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  isEdit = signal(false);
  condominioId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);

  // Calculado automaticamente
  quantidadeTotalFuncionarios = signal(0);

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.condominioId.set(id);
      this.isEdit.set(true);
      this.loadCondominio(id);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      cnpj: [
        '',
        [Validators.required, Validators.pattern(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)],
      ],
      endereco: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      // FASE 5 - Número de postos e funcionários por posto
      numeroPostos: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      funcionariosPorPosto: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      // Input type="time" retorna HH:mm (sem segundos), adicionamos :00 no submit
      horarioTrocaTurno: ['', [Validators.required]],
      emailGestor: ['', [Validators.email]],
      telefoneEmergencia: ['', [Validators.pattern(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/)]],
    });

    // Calcular quantidade inicial
    this.calcularQuantidadeFuncionarios();
  }

  calcularQuantidadeFuncionarios(): void {
    const numeroPostos = this.form.get('numeroPostos')?.value || 0;
    const funcionariosPorPosto = this.form.get('funcionariosPorPosto')?.value || 0;
    this.quantidadeTotalFuncionarios.set(numeroPostos * funcionariosPorPosto);
  }

  loadCondominio(id: string): void {
    this.loading.set(true);

    this.service.getById(id).subscribe({
      next: (data) => {
        // Converter HH:mm:ss para HH:mm (input time não aceita segundos)
        const horarioFormatado = data.horarioTrocaTurno
          ? data.horarioTrocaTurno.substring(0, 5)
          : '';

        // Calcular número de postos e funcionários por posto a partir da quantidade ideal
        const quantidadeIdeal = data.quantidadeFuncionariosIdeal || 0;
        const numeroPostos = Math.max(1, Math.ceil(quantidadeIdeal / 2)); // Assumindo 2 funcionários por posto
        const funcionariosPorPosto = quantidadeIdeal > 0 ? Math.ceil(quantidadeIdeal / numeroPostos) : 1;

        this.form.patchValue({
          nome: data.nome,
          cnpj: data.cnpj,
          endereco: data.endereco,
          numeroPostos: numeroPostos,
          funcionariosPorPosto: funcionariosPorPosto,
          horarioTrocaTurno: horarioFormatado,
          emailGestor: data.emailGestor,
          telefoneEmergencia: data.telefoneEmergencia,
        });

        this.calcularQuantidadeFuncionarios();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar condomínio. Redirecionando...');
        console.error('Erro:', err);
        setTimeout(() => this.router.navigate(['/condominios']), 2000);
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

    // Converter horário HH:mm para HH:mm:ss (backend espera TimeSpan completo)
    if (formValue.horarioTrocaTurno && !formValue.horarioTrocaTurno.includes(':00', 5)) {
      formValue.horarioTrocaTurno = formValue.horarioTrocaTurno + ':00';
    }

    // Formatar telefone sem parênteses: (11) 99999-9999 -> 11999999999
    if (formValue.telefoneEmergencia) {
      formValue.telefoneEmergencia = formValue.telefoneEmergencia.replace(/\D/g, '');
    }

    // Calcular quantidadeFuncionariosIdeal (backend ainda usa esse campo)
    const numeroPostos = formValue.numeroPostos || 1;
    const funcionariosPorPosto = formValue.funcionariosPorPosto || 1;
    formValue.quantidadeFuncionariosIdeal = numeroPostos * funcionariosPorPosto;

    // Remover campos temporários
    delete formValue.numeroPostos;
    delete formValue.funcionariosPorPosto;

    const request = this.isEdit()
      ? this.service.update(this.condominioId()!, formValue)
      : this.service.create(formValue);

    request.subscribe({
      next: () => {
        this.router.navigate(['/condominios']);
      },
      error: (err) => {
        // Detectar tipo de erro e mostrar mensagem específica
        const errorMessage = err.error?.message || err.message || '';

        if (err.status === 409 || errorMessage.toLowerCase().includes('cnpj') || errorMessage.toLowerCase().includes('duplicate')) {
          this.error.set('⚠️ Este CNPJ já está cadastrado. Por favor, use um CNPJ diferente.');
        } else if (err.status === 400) {
          this.error.set('❌ Dados inválidos. Verifique os campos obrigatórios e tente novamente.');
        } else {
          this.error.set(
            this.isEdit()
              ? '❌ Erro ao atualizar condomínio. Tente novamente.'
              : '❌ Erro ao criar condomínio. Tente novamente.'
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
    if (errors['pattern']) {
      if (fieldName === 'cnpj') return 'CNPJ inválido (ex: 12.345.678/0001-90)';
      if (fieldName === 'telefone') return 'Telefone inválido (ex: (11) 99999-9999)';
    }
    if (errors['email']) return 'Email inválido';

    return 'Campo inválido';
  }

  cancel(): void {
    if (this.form.dirty) {
      if (confirm('Há alterações não salvas. Deseja realmente sair?')) {
        this.router.navigate(['/condominios']);
      }
    } else {
      this.router.navigate(['/condominios']);
    }
  }
}
