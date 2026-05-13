import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DiariaService } from '../../../services/diaria.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoService } from '../../../services/posto.service';
import { ClienteService } from '../../../services/cliente.service';
import {
  Diaria,
  Funcionario,
  Posto,
  Alocacao,
  Cliente,
  StatusDiaria,
  TipoDiaria,
} from '../../../models/index';
import { AlocacaoService } from '../../../services/alocacao.service';

@Component({
  selector: 'app-diaria-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diaria-detail.component.html',
  styleUrl: './diaria-detail.component.scss',
})
export class DiariaDetailComponent implements OnInit {
  private service = inject(DiariaService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoService);
  private clienteService = inject(ClienteService);
  private alocacaoService = inject(AlocacaoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  diaria = signal<Diaria | null>(null);
  funcionario = signal<Funcionario | null>(null);
  alocacao = signal<Alocacao | null>(null);
  posto = signal<Posto | null>(null);
  cliente = signal<Cliente | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  get baseRoute(): string {
    return this.router.url.startsWith('/cronograma') ? '/cronograma' : '/diarias';
  }

  get pageTitle(): string {
    return this.baseRoute === '/cronograma' ? 'Detalhes do Cronograma' : 'Detalhes da Diária';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDiaria(id);
    }
  }

  loadDiaria(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: Diaria) => {
        this.diaria.set(data);
        this.loadRelatedData(data);
      },
      error: (err) => {
        this.error.set('Erro ao carregar diária.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  loadRelatedData(diaria: Diaria): void {
    // Load funcionario
    this.funcionarioService.getById(diaria.funcionarioId).subscribe({
      next: (func) => this.funcionario.set(func),
      error: (err) => console.error('Erro ao carregar funcionário:', err),
    });

    // Load alocacao and related data
    this.alocacaoService.getById(diaria.alocacaoId).subscribe({
      next: (aloc) => {
        this.alocacao.set(aloc);
        // Load posto
        this.postoService.getById(aloc.postoId).subscribe({
          next: (posto) => {
            this.posto.set(posto);
            // Load cliente
            this.clienteService.getById(posto.clienteId).subscribe({
              next: (cond) => {
                this.cliente.set(cond);
                this.loading.set(false);
              },
              error: (err) => {
                console.error('Erro ao carregar cliente:', err);
                this.loading.set(false);
              },
            });
          },
          error: (err) => {
            console.error('Erro ao carregar posto:', err);
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Erro ao carregar alocação:', err);
        this.loading.set(false);
      },
    });
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: StatusDiaria): string {
    const labels: Record<StatusDiaria, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      FALTA_REGISTRADA: 'Falta Registrada',
    };
    return labels[status] || status;
  }

  getStatusClass(status: StatusDiaria): string {
    const classes: Record<StatusDiaria, string> = {
      CONFIRMADA: 'badge-success',
      CANCELADA: 'badge-inactive',
      FALTA_REGISTRADA: 'badge-warning',
    };
    return classes[status] || '';
  }

  getTipoLabel(tipo: TipoDiaria): string {
    const labels: Record<TipoDiaria, string> = {
      REGULAR: 'Regular',
      DOBRA_PROGRAMADA: 'Dobra Programada',
      SUBSTITUICAO: 'Substituição',
    };
    return labels[tipo] || tipo;
  }

  getTipoClass(tipo: TipoDiaria): string {
    const classes: Record<TipoDiaria, string> = {
      REGULAR: 'badge-info',
      DOBRA_PROGRAMADA: 'badge-warning',
      SUBSTITUICAO: 'badge-secondary',
    };
    return classes[tipo] || '';
  }

  confirmDelete(): void {
    const aloc = this.diaria();
    if (!aloc) return;

    if (confirm(`Deseja excluir a diária do dia ${this.formatDate(aloc.data)}?`)) {
      this.service.delete(aloc.id).subscribe({
        next: () => {
          this.router.navigate([this.baseRoute]);
        },
        error: (err) => {
          this.error.set('Erro ao excluir diária.');
          console.error(err);
        },
      });
    }
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }
}
