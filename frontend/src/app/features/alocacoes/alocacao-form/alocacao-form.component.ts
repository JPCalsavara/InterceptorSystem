import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { PostoService } from '../../../services/posto.service';
import { ContratoService } from '../../../services/contrato.service';
import { ClienteService } from '../../../services/cliente.service';
import {
  Alocacao,
  Posto,
  Contrato,
  Cliente,
  TipoEscala,
  CreateAlocacaoDto,
  UpdateAlocacaoDto,
} from '../../../models/index';
import { forkJoin } from 'rxjs';
import { FormInputComponent } from '../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-alocacao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormInputComponent, FormSelectComponent],
  templateUrl: './alocacao-form.component.html',
  styleUrl: './alocacao-form.component.scss',
})
export class AlocacaoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private alocacaoService = inject(AlocacaoService);
  private postoService = inject(PostoService);
  private contratoService = inject(ContratoService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  postos = signal<Posto[]>([]);
  contratos = signal<Contrato[]>([]);
  clientes = signal<Cliente[]>([]);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  isEditMode = signal(false);
  alocacaoId: string | null = null;

  get clienteOptions() {
    return this.clientes().map(c => ({ value: c.id, label: c.nome }));
  }

  get postoOptions() {
    return this.filteredPostos().map(p => ({ value: p.id, label: p.nome }));
  }

  get contratoOptions() {
    return this.filteredContratos().map(c => ({ value: c.id, label: c.descricao }));
  }

  tipoEscalaOptions = [
    { value: TipoEscala.DOZE_POR_TRINTA_SEIS, label: '12x36' },
    { value: TipoEscala.SEMANAL_COMERCIAL, label: 'Comercial' },
    { value: TipoEscala.OITO_HORAS_SEIS_POR_DOIS, label: '8h (6x2)' },
    { value: TipoEscala.FOLGUISTA, label: 'Folguista' },
  ];

  ngOnInit(): void {
    this.alocacaoId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.alocacaoId);

    this.form = this.fb.group({
      clienteId: ['', Validators.required],
      postoId: ['', Validators.required],
      contratoId: ['', Validators.required],
      horarioInicio: ['07:00', [Validators.required]],
      horarioFim: ['19:00', [Validators.required]],
      tipoEscala: [TipoEscala.DOZE_POR_TRINTA_SEIS, Validators.required],
      permiteDobrarEscala: [true],
    });

    this.loadInitialData();

    // Quando mudar cliente, filtrar postos e contratos
    this.form.get('clienteId')?.valueChanges.subscribe((clienteId) => {
      if (!this.isEditMode()) {
        this.form.patchValue({ postoId: '', contratoId: '' });
      }
    });
  }

  loadInitialData(): void {
    this.loading.set(true);
    forkJoin({
      clientes: this.clienteService.getAll(),
      postos: this.postoService.getAll(),
      contratos: this.contratoService.getAll(),
    }).subscribe({
      next: (data) => {
        this.clientes.set(data.clientes);
        this.postos.set(data.postos);
        this.contratos.set(data.contratos);

        if (this.isEditMode() && this.alocacaoId) {
          this.loadAlocacao(this.alocacaoId);
        } else {
          // Pre-fill from query params if available
          const qClienteId = this.route.snapshot.queryParamMap.get('clienteId');
          const qPostoId = this.route.snapshot.queryParamMap.get('postoId');
          if (qClienteId) this.form.patchValue({ clienteId: qClienteId });
          if (qPostoId) this.form.patchValue({ postoId: qPostoId });

          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Erro ao carregar dados iniciais.');
        this.loading.set(false);
      },
    });
  }

  loadAlocacao(id: string): void {
    this.alocacaoService.getById(id).subscribe({
      next: (data: Alocacao) => {
        const posto = this.postos().find((p) => p.id === data.postoId);
        this.form.patchValue({
          clienteId: posto?.clienteId,
          postoId: data.postoId,
          contratoId: data.contratoId,
          horarioInicio: data.horarioInicio.substring(0, 5),
          horarioFim: data.horarioFim.substring(0, 5),
          tipoEscala: data.tipoEscala,
          permiteDobrarEscala: data.permiteDobrarEscala,
        });

        // Context fields are not part of update DTO, keep them read-only on edit.
        this.form.get('clienteId')?.disable();
        this.form.get('postoId')?.disable();
        this.form.get('contratoId')?.disable();

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Erro ao carregar alocação.');
        this.loading.set(false);
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
    const val = this.form.getRawValue();

    // Garantir formato HH:mm:ss
    const inicio = val.horarioInicio.length === 5 ? `${val.horarioInicio}:00` : val.horarioInicio;
    const fim = val.horarioFim.length === 5 ? `${val.horarioFim}:00` : val.horarioFim;

    if (this.isEditMode() && this.alocacaoId) {
      const dto: UpdateAlocacaoDto = {
        horarioInicio: inicio,
        horarioFim: fim,
        tipoEscala: val.tipoEscala,
        permiteDobrarEscala: val.permiteDobrarEscala,
      };
      this.alocacaoService.update(this.alocacaoId, dto).subscribe({
        next: () => this.router.navigate(['/alocacoes']),
        error: (err) => {
          this.error.set(err.error?.error || 'Erro ao atualizar turno.');
          this.loading.set(false);
        },
      });
    } else {
      const dto: CreateAlocacaoDto = {
        postoId: val.postoId,
        contratoId: val.contratoId,
        horarioInicio: inicio,
        horarioFim: fim,
        tipoEscala: val.tipoEscala,
        permiteDobrarEscala: val.permiteDobrarEscala,
      };
      this.alocacaoService.create(dto).subscribe({
        next: () => this.router.navigate(['/alocacoes']),
        error: (err) => {
          this.error.set(err.error?.error || 'Erro ao criar turno.');
          this.loading.set(false);
        },
      });
    }
  }

  filteredPostos(): Posto[] {
    const clienteId = this.form.get('clienteId')?.value;
    if (!clienteId) return [];
    return this.postos().filter((p) => p.clienteId === clienteId);
  }

  filteredContratos(): Contrato[] {
    const clienteId = this.form.get('clienteId')?.value;
    if (!clienteId) return [];
    return this.contratos().filter((c) => c.clienteId === clienteId);
  }

}
