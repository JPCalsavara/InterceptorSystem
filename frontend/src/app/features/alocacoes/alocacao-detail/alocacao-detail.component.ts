import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AlocacaoService } from '../../../services/alocacao.service';
import { FuncionarioService } from '../../../services/funcionario.service';
import { PostoDeTrabalhoService } from '../../../services/posto-de-trabalho.service';
import { CondominioService } from '../../../services/condominio.service';
import {
  Alocacao,
  Funcionario,
  PostoDeTrabalho,
  Condominio,
  StatusAlocacao,
  TipoAlocacao,
} from '../../../models/index';

@Component({
  selector: 'app-alocacao-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './alocacao-detail.component.html',
  styleUrl: './alocacao-detail.component.scss',
})
export class AlocacaoDetailComponent implements OnInit {
  private service = inject(AlocacaoService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  alocacao = signal<Alocacao | null>(null);
  funcionario = signal<Funcionario | null>(null);
  posto = signal<PostoDeTrabalho | null>(null);
  condominio = signal<Condominio | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlocacao(id);
    }
  }

  loadAlocacao(id: string): void {
    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (data: Alocacao) => {
        this.alocacao.set(data);
        this.loadRelatedData(data);
      },
      error: (err) => {
        this.error.set('Erro ao carregar alocação.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  loadRelatedData(alocacao: Alocacao): void {
    // Load funcionario
    this.funcionarioService.getById(alocacao.funcionarioId).subscribe({
      next: (func) => this.funcionario.set(func),
      error: (err) => console.error('Erro ao carregar funcionário:', err),
    });

    // Load posto
    this.postoService.getById(alocacao.postoDeTrabalhoId).subscribe({
      next: (posto) => {
        this.posto.set(posto);
        // Load condominio
        this.condominioService.getById(posto.condominioId).subscribe({
          next: (cond) => {
            this.condominio.set(cond);
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Erro ao carregar condomínio:', err);
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        console.error('Erro ao carregar posto:', err);
        this.loading.set(false);
      },
    });
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: StatusAlocacao): string {
    const labels: Record<StatusAlocacao, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      FALTA_REGISTRADA: 'Falta Registrada',
    };
    return labels[status] || status;
  }

  getStatusClass(status: StatusAlocacao): string {
    const classes: Record<StatusAlocacao, string> = {
      CONFIRMADA: 'badge-success',
      CANCELADA: 'badge-inactive',
      FALTA_REGISTRADA: 'badge-warning',
    };
    return classes[status] || '';
  }

  getTipoLabel(tipo: TipoAlocacao): string {
    const labels: Record<TipoAlocacao, string> = {
      REGULAR: 'Regular',
      DOBRA_PROGRAMADA: 'Dobra Programada',
      SUBSTITUICAO: 'Substituição',
    };
    return labels[tipo] || tipo;
  }

  getTipoClass(tipo: TipoAlocacao): string {
    const classes: Record<TipoAlocacao, string> = {
      REGULAR: 'badge-info',
      DOBRA_PROGRAMADA: 'badge-warning',
      SUBSTITUICAO: 'badge-secondary',
    };
    return classes[tipo] || '';
  }

  confirmDelete(): void {
    const aloc = this.alocacao();
    if (!aloc) return;

    if (confirm(`Deseja excluir a alocação do dia ${this.formatDate(aloc.data)}?`)) {
      this.service.delete(aloc.id).subscribe({
        next: () => {
          this.router.navigate(['/alocacoes']);
        },
        error: (err) => {
          this.error.set('Erro ao excluir alocação.');
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

