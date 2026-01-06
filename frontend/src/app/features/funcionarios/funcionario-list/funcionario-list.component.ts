import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FuncionarioService } from '../../../services/funcionario.service';
import { CondominioService } from '../../../services/condominio.service';
import {
  Funcionario,
  StatusFuncionario,
  TipoFuncionario,
  TipoEscala,
  Condominio,
} from '../../../models/index';

@Component({
  selector: 'app-funcionario-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './funcionario-list.component.html',
  styleUrl: './funcionario-list.component.scss',
})
export class FuncionarioListComponent implements OnInit {
  private service = inject(FuncionarioService);
  private condominioService = inject(CondominioService);

  funcionarios = signal<Funcionario[]>([]);
  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  filtroCondominio = signal<string>('');
  filtroTipo = signal<string>('');
  filtroEscala = signal<string>('');

  // Enums para dropdown
  StatusFuncionario = StatusFuncionario;
  TipoFuncionario = TipoFuncionario;
  TipoEscala = TipoEscala;

  // Funcionários filtrados
  funcionariosFiltrados = computed(() => {
    let resultado = this.funcionarios();

    const condominioFiltro = this.filtroCondominio();
    if (condominioFiltro) {
      resultado = resultado.filter((f) => f.condominioId === condominioFiltro);
    }

    const tipoFiltro = this.filtroTipo();
    if (tipoFiltro) {
      resultado = resultado.filter((f) => f.tipoFuncionario === tipoFiltro);
    }

    const escalaFiltro = this.filtroEscala();
    if (escalaFiltro) {
      resultado = resultado.filter((f) => f.tipoEscala === escalaFiltro);
    }

    return resultado;
  });

  ngOnInit(): void {
    this.loadFuncionarios();
    this.loadCondominios();
  }

  loadCondominios(): void {
    this.condominioService.getAll().subscribe({
      next: (data) => this.condominios.set(data),
      error: (err) => console.error('Erro ao carregar condomínios:', err),
    });
  }

  loadFuncionarios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll().subscribe({
      next: (data) => {
        this.funcionarios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar funcionários. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  confirmDelete(id: string, nome: string): void {
    if (confirm(`Deseja realmente excluir o funcionário "${nome}"?`)) {
      this.deleteFuncionario(id);
    }
  }

  deleteFuncionario(id: string): void {
    this.loading.set(true);

    this.service.delete(id).subscribe({
      next: () => {
        this.successMessage.set('Funcionário excluído com sucesso!');
        this.loadFuncionarios();
        setTimeout(() => this.dismissSuccess(), 5000);
      },
      error: (err) => {
        this.error.set('Erro ao excluir funcionário. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  dismissError(): void {
    this.error.set(null);
  }

  dismissSuccess(): void {
    this.successMessage.set(null);
  }

  getStatusLabel(status: StatusFuncionario): string {
    const labels = {
      [StatusFuncionario.ATIVO]: 'Ativo',
      [StatusFuncionario.FERIAS]: 'Férias',
      [StatusFuncionario.AFASTADO]: 'Afastado',
      [StatusFuncionario.DEMITIDO]: 'Demitido',
    };
    return labels[status] || 'Desconhecido';
  }

  getStatusClass(status: StatusFuncionario): string {
    const classes = {
      [StatusFuncionario.ATIVO]: 'success',
      [StatusFuncionario.FERIAS]: 'warning',
      [StatusFuncionario.AFASTADO]: 'inactive',
      [StatusFuncionario.DEMITIDO]: 'error',
    };
    return classes[status] || '';
  }

  getTipoLabel(tipo: TipoFuncionario): string {
    const labels = {
      [TipoFuncionario.CLT]: 'CLT',
      [TipoFuncionario.FREELANCER]: 'Freelancer',
      [TipoFuncionario.TERCEIRIZADO]: 'Terceirizado',
    };
    return labels[tipo] || 'Desconhecido';
  }

  getEscalaLabel(escala: TipoEscala): string {
    const labels = {
      [TipoEscala.DOZE_POR_TRINTA_SEIS]: '12x36',
      [TipoEscala.SEMANAL_COMERCIAL]: 'Semanal',
    };
    return labels[escala] || 'Desconhecido';
  }

  getCondominioNome(condominioId: string): string {
    const cond = this.condominios().find((c) => c.id === condominioId);
    return cond?.nome || 'Não atribuído';
  }

  getTipoClass(tipo: TipoFuncionario): string {
    const classes = {
      [TipoFuncionario.CLT]: 'badge-info',
      [TipoFuncionario.FREELANCER]: 'badge-warning',
      [TipoFuncionario.TERCEIRIZADO]: 'badge-secondary',
    };
    return classes[tipo] || 'badge-info';
  }

  getEscalaClass(escala: TipoEscala): string {
    return 'badge-info';
  }

  limparFiltros(): void {
    this.filtroCondominio.set('');
    this.filtroTipo.set('');
    this.filtroEscala.set('');
  }
}
