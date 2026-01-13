import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
  selector: 'app-alocacao-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './alocacao-list.component.html',
  styleUrl: './alocacao-list.component.scss',
})
export class AlocacaoListComponent implements OnInit {
  private service = inject(AlocacaoService);
  private funcionarioService = inject(FuncionarioService);
  private postoService = inject(PostoDeTrabalhoService);
  private condominioService = inject(CondominioService);

  alocacoes = signal<Alocacao[]>([]);
  funcionarios = signal<Funcionario[]>([]);
  postos = signal<PostoDeTrabalho[]>([]);
  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  filtroCondominioId = signal<string>('');
  filtroFuncionarioId = signal<string>('');
  filtroStatus = signal<string>('');
  filtroTipo = signal<string>('');

  // Alocações filtradas
  alocacoesFiltradas = computed(() => {
    let resultado = this.alocacoes();

    const condominioId = this.filtroCondominioId();
    if (condominioId) {
      const postosDoCondominio = this.postos()
        .filter((p) => p.condominioId === condominioId)
        .map((p) => p.id);
      resultado = resultado.filter((a) => postosDoCondominio.includes(a.postoDeTrabalhoId));
    }

    const funcionarioId = this.filtroFuncionarioId();
    if (funcionarioId) {
      resultado = resultado.filter((a) => a.funcionarioId === funcionarioId);
    }

    const status = this.filtroStatus();
    if (status) {
      resultado = resultado.filter((a) => a.statusAlocacao === status);
    }

    const tipo = this.filtroTipo();
    if (tipo) {
      resultado = resultado.filter((a) => a.tipoAlocacao === tipo);
    }

    return resultado;
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    Promise.all([
      this.loadAlocacoes(),
      this.loadFuncionarios(),
      this.loadPostos(),
      this.loadCondominios(),
    ]).finally(() => this.loading.set(false));
  }

  loadAlocacoes(): Promise<void> {
    return new Promise((resolve) => {
      this.service.getAll().subscribe({
        next: (data) => {
          this.alocacoes.set(data);
          resolve();
        },
        error: (err) => {
          this.error.set('Erro ao carregar alocações.');
          console.error(err);
          resolve();
        },
      });
    });
  }

  loadFuncionarios(): Promise<void> {
    return new Promise((resolve) => {
      this.funcionarioService.getAll().subscribe({
        next: (data) => {
          this.funcionarios.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar funcionários:', err);
          resolve();
        },
      });
    });
  }

  loadPostos(): Promise<void> {
    return new Promise((resolve) => {
      this.postoService.getAll().subscribe({
        next: (data) => {
          this.postos.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar postos:', err);
          resolve();
        },
      });
    });
  }

  loadCondominios(): Promise<void> {
    return new Promise((resolve) => {
      this.condominioService.getAll().subscribe({
        next: (data) => {
          this.condominios.set(data);
          resolve();
        },
        error: (err) => {
          console.error('Erro ao carregar condomínios:', err);
          resolve();
        },
      });
    });
  }

  aplicarFiltros(): void {
    // Os filtros são reativos via computed
  }

  getFuncionarioNome(funcionarioId: string): string {
    return this.funcionarios().find((f) => f.id === funcionarioId)?.nome || 'N/A';
  }

  getPostoHorario(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'N/A';
    const inicio = posto.horarioInicio.substring(0, 5);
    const fim = posto.horarioFim.substring(0, 5);
    return `${inicio} - ${fim}`;
  }

  getCondominioNome(postoId: string): string {
    const posto = this.postos().find((p) => p.id === postoId);
    if (!posto) return 'N/A';
    return this.condominios().find((c) => c.id === posto.condominioId)?.nome || 'N/A';
  }

  formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  getStatusLabel(status: StatusAlocacao): string {
    const labels: Record<StatusAlocacao, string> = {
      CONFIRMADA: 'Confirmada',
      CANCELADA: 'Cancelada',
      FALTA_REGISTRADA: 'Falta',
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
      DOBRA_PROGRAMADA: 'Dobra',
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

  confirmDelete(id: string, data: string): void {
    if (confirm(`Deseja excluir a alocação do dia ${this.formatDate(data)}?`)) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage.set('Alocação excluída!');
          this.loadAll();
          setTimeout(() => this.dismissSuccess(), 5000);
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
