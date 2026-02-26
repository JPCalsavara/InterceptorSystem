import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import { ContratoService } from '../../../services/contrato.service';
import { Condominio, Contrato, PostoDeTrabalho, StatusContrato } from '../../../models/index';

@Component({
  selector: 'app-posto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './posto-form.component.html',
  styleUrl: './posto-form.component.scss',
})
export class PostoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);
  private contratoService = inject(ContratoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  condominios = signal<Condominio[]>([]);
  contratos = signal<Contrato[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  isEditMode = signal(false);
  postoId: string | null = null;

  ngOnInit(): void {
    this.postoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.postoId);

    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      contratoId: ['', Validators.required],
      horarioInicio: [{ value: '', disabled: true }, [Validators.required]],
      horarioFim: [{ value: '', disabled: true }, [Validators.required]],
      permiteDobrarEscala: [true],
    });

    this.loadCondominios();

    this.form.get('condominioId')?.valueChanges.subscribe((condominioId) => {
      if (condominioId) {
        this.onCondominioChange(condominioId);
      } else {
        this.contratos.set([]);
        this.form.get('contratoId')?.reset('');
      }
    });

    if (this.isEditMode() && this.postoId) {
      this.loadPosto(this.postoId);
    }
  }

  onCondominioChange(condominioId: string): void {
    const condominio = this.condominios().find((c) => c.id === condominioId);
    if (!condominio) return;

    const horarioInicio = condominio.horarioTrocaTurno.substring(0, 5);
    const horarioFim = this.calcularHorarioFim(horarioInicio);

    this.form.patchValue({ horarioInicio, horarioFim });
    this.form.get('contratoId')?.reset('');
    this.loadContratos(condominioId);
  }

  calcularHorarioFim(horarioInicio: string): string {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    const novaHora = (horas + 12) % 24;
    return `${String(novaHora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  }

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => {
        this.error.set('Erro ao carregar condomínios.');
        console.error(err);
      },
    });
  }

  loadContratos(condominioId: string): void {
    this.contratoService.getAll().subscribe({
      next: (data) => {
        const contratosDoCondominio = data.filter(
          (c) => c.condominioId === condominioId && c.status !== StatusContrato.FINALIZADO,
        );
        this.contratos.set(contratosDoCondominio);
      },
      error: (err) => console.error('Erro ao carregar contratos:', err),
    });
  }

  loadPosto(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: PostoDeTrabalho) => {
        const horarioInicioFormatado = data.horarioInicio.substring(0, 5);
        const horarioFimFormatado = data.horarioFim.substring(0, 5);

        this.form.patchValue({
          horarioInicio: horarioInicioFormatado,
          horarioFim: horarioFimFormatado,
          permiteDobrarEscala: data.permiteDobrarEscala,
        });
        this.form.get('condominioId')?.setValue(data.condominioId);
        this.form.get('condominioId')?.disable();
        this.form.get('contratoId')?.setValue(data.contratoId);
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

    if (!this.isEditMode() && this.contratos().length === 0) {
      this.error.set(
        'Não há contratos ativos para o condomínio selecionado. Cadastre um contrato primeiro.',
      );
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue();

    const horarioInicio = formValue.horarioInicio.includes(':00', 5)
      ? formValue.horarioInicio
      : formValue.horarioInicio + ':00';

    const horarioFim = formValue.horarioFim.includes(':00', 5)
      ? formValue.horarioFim
      : formValue.horarioFim + ':00';

    if (this.isEditMode() && this.postoId) {
      this.service
        .update(this.postoId, {
          horarioInicio,
          horarioFim,
          permiteDobrarEscala: formValue.permiteDobrarEscala,
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
          condominioId: formValue.condominioId,
          contratoId: formValue.contratoId,
          horarioInicio,
          horarioFim,
          permiteDobrarEscala: formValue.permiteDobrarEscala,
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
    return 'Campo inválido';
  }
}
