import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import { Condominio, PostoDeTrabalho } from '../../../models/index';

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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  postoId: string | null = null;
  condominioSelecionado = signal<Condominio | null>(null);

  ngOnInit(): void {
    this.postoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.postoId);

    this.form = this.fb.group({
      condominioId: ['', Validators.required],
      // Horário de início será importado do condomínio
      horarioInicio: [{ value: '', disabled: true }, [Validators.required]],
      // Horário de fim será calculado automaticamente (12h depois)
      horarioFim: [{ value: '', disabled: true }, [Validators.required]],
      permiteDobrarEscala: [true], // Default true conforme FASE 4
    });

    this.loadCondominios();

    // Listener para quando selecionar condomínio
    this.form.get('condominioId')?.valueChanges.subscribe((condominioId) => {
      if (condominioId) {
        this.onCondominioChange(condominioId);
      }
    });

    if (this.isEditMode() && this.postoId) {
      this.loadPosto(this.postoId);
    }
  }

  onCondominioChange(condominioId: string): void {
    const condominio = this.condominios().find((c) => c.id === condominioId);
    if (!condominio) return;

    this.condominioSelecionado.set(condominio);

    // Importar horário de troca do condomínio como horário de início
    const horarioInicio = condominio.horarioTrocaTurno.substring(0, 5); // HH:mm

    // Calcular horário de fim (12 horas depois)
    const horarioFim = this.calcularHorarioFim(horarioInicio);

    // Atualizar form
    this.form.patchValue({
      horarioInicio,
      horarioFim,
    });
  }

  calcularHorarioFim(horarioInicio: string): string {
    const [horas, minutos] = horarioInicio.split(':').map(Number);
    let novaHora = (horas + 12) % 24;
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

  loadPosto(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: PostoDeTrabalho) => {
        // Converter HH:mm:ss para HH:mm (input time não aceita segundos)
        const horarioInicioFormatado = data.horarioInicio.substring(0, 5);
        const horarioFimFormatado = data.horarioFim.substring(0, 5);

        // Não pode alterar condominioId em edição
        this.form.patchValue({
          horarioInicio: horarioInicioFormatado,
          horarioFim: horarioFimFormatado,
          permiteDobrarEscala: data.permiteDobrarEscala,
        });
        // Desabilita condominioId
        this.form.get('condominioId')?.setValue(data.condominioId);
        this.form.get('condominioId')?.disable();
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue(); // getRawValue pega inclusive campos disabled

    // Converter horários HH:mm para HH:mm:ss (backend espera TimeSpan completo)
    const horarioInicio = formValue.horarioInicio.includes(':00', 5)
      ? formValue.horarioInicio
      : formValue.horarioInicio + ':00';

    const horarioFim = formValue.horarioFim.includes(':00', 5)
      ? formValue.horarioFim
      : formValue.horarioFim + ':00';

    if (this.isEditMode() && this.postoId) {
      const updateDto = {
        horarioInicio,
        horarioFim,
        permiteDobrarEscala: formValue.permiteDobrarEscala,
      };

      this.service.update(this.postoId, updateDto).subscribe({
        next: () => {
          this.router.navigate(['/postos']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao atualizar posto.');
          this.loading.set(false);
          console.error(err);
        },
      });
    } else {
      const createDto = {
        condominioId: formValue.condominioId,
        horarioInicio,
        horarioFim,
        permiteDobrarEscala: formValue.permiteDobrarEscala,
      };

      this.service.create(createDto).subscribe({
        next: () => {
          this.router.navigate(['/postos']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao criar posto.');
          this.loading.set(false);
          console.error(err);
        },
      });
    }
  }

  dismissError(): void {
    this.error.set(null);
  }
}


