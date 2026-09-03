import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormInputComponent } from '../../../shared/components/form-input/form-input.component';
import { FormSelectComponent } from '../../../shared/components/form-select/form-select.component';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { AlocacaoService } from '../../../services/alocacao.service';
import { ClienteService } from '../../../services/cliente.service';
import {
  Funcionario,
  Posto,
  Alocacao,
  Cliente,
  Diaria,
  StatusDiaria,
  TipoDiaria,
} from '../../../models/index';

@Component({
  selector: 'app-diaria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  templateUrl: './diaria-form.component.html',
  styleUrl: './diaria-form.component.scss',
})
export class DiariaFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private service = inject(DiariaService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private alocacaoService = inject(AlocacaoService);
  private clienteService = inject(ClienteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() embeddedDiariaId: string | null = null;
  @Output() savedEvent = new EventEmitter<void>();
  @Output() cancelledEvent = new EventEmitter<void>();

  get isEmbedded(): boolean {
    return this.embeddedDiariaId !== null;
  }

  form!: FormGroup;
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<Posto[]>([]);
  alocacoes = signal<Alocacao[]>([]);
  clientes = signal<Cliente[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  isEditMode = signal(false);
  diariaId: string | null = null;

  funcionarioOptions = computed(() =>
    this.funcionarios().map((f) => ({ value: f.id, label: `${f.nome} - ${f.cpf}` }))
  );

  alocacaoOptions = computed(() =>
    this.alocacoes().map((a) => ({ value: a.id, label: this.getAlocacaoLabel(a) }))
  );

  get baseRoute(): string {
    return this.router.url.startsWith('/cronograma') ? '/cronograma' : '/diarias';
  }

  get pageTitle(): string {
    if (this.isEditMode()) {
      return this.baseRoute === '/cronograma' ? 'Editar Item do Cronograma' : 'Editar Diária';
    }
    return this.baseRoute === '/cronograma' ? 'Novo Item do Cronograma' : 'Nova Diária';
  }

  statusOptions = [
    { value: StatusDiaria.CONFIRMADA, label: 'Confirmada' },
    { value: StatusDiaria.CANCELADA, label: 'Cancelada' },
    { value: StatusDiaria.FALTA_INJUSTIFICADA, label: 'Falta Injustificada' },
  ];

  tipoOptions = [
    { value: TipoDiaria.REGULAR, label: 'Regular' },
    { value: TipoDiaria.DOBRA_PROGRAMADA, label: 'Dobra Programada' },
    { value: TipoDiaria.SUBSTITUICAO, label: 'Substituição' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      funcionarioId: ['', Validators.required],
      alocacaoId: ['', Validators.required],
      data: ['', Validators.required],
      statusDiaria: [StatusDiaria.CONFIRMADA, Validators.required],
      tipoDiaria: [TipoDiaria.REGULAR, Validators.required],
    });

    this.loadDependencies();
    this.initFromSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['embeddedDiariaId'] && this.form) {
      this.initFromSource();
    }
  }

  private initFromSource(): void {
    this.diariaId = this.embeddedDiariaId ?? this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.diariaId);

    if (this.isEditMode() && this.diariaId) {
      this.loadDiaria(this.diariaId);
    } else {
      this.form.enable();
      this.form.reset({
        statusDiaria: StatusDiaria.CONFIRMADA,
        tipoDiaria: TipoDiaria.REGULAR,
      });
    }
  }

  loadDependencies(): void {
    this.funcionarioService.getAll().subscribe({
      next: (data) => this.funcionarios.set(data),
      error: (err) => console.error('Erro ao carregar funcionários:', err),
    });

    this.postoService.getAll().subscribe({
      next: (data) => this.postos.set(data),
      error: (err) => console.error('Erro ao carregar postos:', err),
    });

    this.alocacaoService.getAll().subscribe({
      next: (data: Alocacao[]) => this.alocacoes.set(data),
      error: (err: any) => console.error('Erro ao carregar alocações:', err),
    });

    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });
  }

  loadDiaria(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: Diaria) => {
        this.form.patchValue({
          funcionarioId: data.funcionarioId,
          alocacaoId: data.alocacaoId,
          data: data.data,
          statusDiaria: data.statusDiaria,
          tipoDiaria: data.tipoDiaria,
        });
        // Em modo de edição, funcionario e alocacao não podem ser alterados
        this.form.get('funcionarioId')?.disable();
        this.form.get('alocacaoId')?.disable();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar diária.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getPostoNome(alocacaoId: string): string {
    const alocacao = this.alocacoes().find((a) => a.id === alocacaoId);
    if (!alocacao) return '';
    const posto = this.postos().find((p) => p.id === alocacao.postoId);
    return posto?.nome || '';
  }

  getAlocacaoLabel(alocacao: Alocacao): string {
    const posto = this.postos().find((p) => p.id === alocacao.postoId);
    const cliente = posto ? this.clientes().find((c) => c.id === posto.clienteId)?.nome : '';
    const horario = `${alocacao.horarioInicio.substring(0, 5)} - ${alocacao.horarioFim.substring(
      0,
      5,
    )}`;
    return `${horario} (${posto?.nome || ''} - ${cliente || ''})`;
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

    if (this.isEditMode() && this.diariaId) {
      const updateDto = {
        statusDiaria: formValue.statusDiaria,
        tipoDiaria: formValue.tipoDiaria,
        data: formValue.data,
      };

      this.service.update(this.diariaId, updateDto).subscribe({
        next: () => {
          this.loading.set(false);
          if (this.isEmbedded) {
            this.savedEvent.emit();
          } else {
            this.router.navigate([this.baseRoute]);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao atualizar diária.');
          this.loading.set(false);
          console.error(err);
        },
      });
    } else {
      const createDto = {
        funcionarioId: formValue.funcionarioId,
        alocacaoId: formValue.alocacaoId,
        data: formValue.data,
        statusDiaria: formValue.statusDiaria,
        tipoDiaria: formValue.tipoDiaria,
      };

      this.service.create(createDto).subscribe({
        next: () => {
          this.loading.set(false);
          if (this.isEmbedded) {
            this.savedEvent.emit();
          } else {
            this.router.navigate([this.baseRoute]);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao criar diária.');
          this.loading.set(false);
          console.error(err);
        },
      });
    }
  }

  dismissError(): void {
    this.error.set(null);
  }

  cancel(): void {
    if (this.isEmbedded) {
      this.cancelledEvent.emit();
    } else {
      this.router.navigate([this.baseRoute]);
    }
  }
}
