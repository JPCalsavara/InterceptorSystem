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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import {
  Funcionario,
  PostoDeTrabalho,
  Condominio,
  Alocacao,
  StatusAlocacao,
  TipoAlocacao,
} from '../../../models/index';

@Component({
  selector: 'app-alocacao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alocacao-form.component.html',
  styleUrl: './alocacao-form.component.scss',
})
export class AlocacaoFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private service = inject(AlocacaoService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() embeddedAlocacaoId: string | null = null;
  @Output() savedEvent = new EventEmitter<void>();
  @Output() cancelledEvent = new EventEmitter<void>();

  get isEmbedded(): boolean {
    return this.embeddedAlocacaoId !== null;
  }

  form!: FormGroup;
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);
  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  alocacaoId: string | null = null;

  statusOptions = [
    { value: StatusAlocacao.CONFIRMADA, label: 'Confirmada' },
    { value: StatusAlocacao.CANCELADA, label: 'Cancelada' },
    { value: StatusAlocacao.FALTA_REGISTRADA, label: 'Falta Registrada' },
  ];

  tipoOptions = [
    { value: TipoAlocacao.REGULAR, label: 'Regular' },
    { value: TipoAlocacao.DOBRA_PROGRAMADA, label: 'Dobra Programada' },
    { value: TipoAlocacao.SUBSTITUICAO, label: 'Substituição' },
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      funcionarioId: ['', Validators.required],
      postoDeTrabalhoId: ['', Validators.required],
      data: ['', Validators.required],
      statusAlocacao: [StatusAlocacao.CONFIRMADA, Validators.required],
      tipoAlocacao: [TipoAlocacao.REGULAR, Validators.required],
    });

    this.loadDependencies();
    this.initFromSource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['embeddedAlocacaoId'] && this.form) {
      this.initFromSource();
    }
  }

  private initFromSource(): void {
    this.alocacaoId = this.embeddedAlocacaoId ?? this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.alocacaoId);

    if (this.isEditMode() && this.alocacaoId) {
      this.loadAlocacao(this.alocacaoId);
    } else {
      this.form.enable();
      this.form.reset({
        statusAlocacao: StatusAlocacao.CONFIRMADA,
        tipoAlocacao: TipoAlocacao.REGULAR,
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

    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => console.error('Erro ao carregar condomínios:', err),
    });
  }

  loadAlocacao(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: Alocacao) => {
        this.form.patchValue({
          funcionarioId: data.funcionarioId,
          postoDeTrabalhoId: data.postoDeTrabalhoId,
          data: data.data,
          statusAlocacao: data.statusAlocacao,
          tipoAlocacao: data.tipoAlocacao,
        });
        // Em modo de edição, funcionario e posto não podem ser alterados
        this.form.get('funcionarioId')?.disable();
        this.form.get('postoDeTrabalhoId')?.disable();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar alocação.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  getCondominioNome(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return '';
    return this.condominios().find((c) => c.id === posto.condominioId)?.nome || '';
  }

  getPostoLabel(posto: PostoDeTrabalho): string {
    const inicio = posto.horarioInicio.substring(0, 5);
    const fim = posto.horarioFim.substring(0, 5);
    const condominio = this.getCondominioNome(posto.id);
    return `${inicio} - ${fim} (${condominio})`;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue();

    if (this.isEditMode() && this.alocacaoId) {
      const updateDto = {
        statusAlocacao: formValue.statusAlocacao,
        tipoAlocacao: formValue.tipoAlocacao,
        data: formValue.data,
      };

      this.service.update(this.alocacaoId, updateDto).subscribe({
        next: () => {
          this.loading.set(false);
          if (this.isEmbedded) {
            this.savedEvent.emit();
          } else {
            this.router.navigate(['/alocacoes']);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao atualizar alocação.');
          this.loading.set(false);
          console.error(err);
        },
      });
    } else {
      const createDto = {
        funcionarioId: formValue.funcionarioId,
        postoDeTrabalhoId: formValue.postoDeTrabalhoId,
        data: formValue.data,
        statusAlocacao: formValue.statusAlocacao,
        tipoAlocacao: formValue.tipoAlocacao,
      };

      this.service.create(createDto).subscribe({
        next: () => {
          this.loading.set(false);
          if (this.isEmbedded) {
            this.savedEvent.emit();
          } else {
            this.router.navigate(['/alocacoes']);
          }
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Erro ao criar alocação.');
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
      this.router.navigate(['/alocacoes']);
    }
  }
}
