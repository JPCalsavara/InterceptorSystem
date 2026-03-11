import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FuncionarioService } from '../../../services/funcionario.service';
import { ClienteService } from '../../../services/cliente.service';
import { ContratoService } from '../../../services/contrato.service';
import {
  Funcionario,
  StatusFuncionario,
  TipoFuncionario,
  TipoEscala,
  Cliente,
  Contrato,
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
  private clienteService = inject(ClienteService);
  private contratoService = inject(ContratoService);

  funcionarios = signal<Funcionario[]>([]);
  clientes = signal<Cliente[]>([]);
  contratos = signal<Contrato[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros
  filtroCliente = signal<string>('');
  filtroTipo = signal<string>('');
  filtroEscala = signal<string>('');

  // Enums para dropdown
  StatusFuncionario = StatusFuncionario;
  TipoFuncionario = TipoFuncionario;
  TipoEscala = TipoEscala;

  // Funcionários filtrados
  funcionariosFiltrados = computed(() => {
    let resultado = this.funcionarios();

    const clienteFiltro = this.filtroCliente();
    if (clienteFiltro) {
      resultado = resultado.filter((f) => f.clienteId === clienteFiltro);
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
    this.loadClientes();
    this.loadContratos();
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => this.clientes.set(data),
      error: (err) => console.error('Erro ao carregar clientes:', err),
    });
  }

  loadContratos(): void {
    this.contratoService.getAll().subscribe({
      next: (data) => this.contratos.set(data),
      error: (err) => console.error('Erro ao carregar contratos:', err),
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
      [StatusFuncionario.ATIVO]: 'badge-success',
      [StatusFuncionario.FERIAS]: 'badge-warning',
      [StatusFuncionario.AFASTADO]: 'badge-neutral',
      [StatusFuncionario.DEMITIDO]: 'badge-error',
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
      [TipoEscala.ALCALA_8H]: 'Alcalá 8h',
      [TipoEscala.FOLGUISTA]: 'Folguista',
      [TipoEscala.OITO_HORAS_SEIS_POR_DOIS]: '8h (6x2)',
    };
    return labels[escala] || 'Desconhecido';
  }

  getClienteNome(clienteId: string): string {
    const cond = this.clientes().find((c) => c.id === clienteId);
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
    this.filtroCliente.set('');
    this.filtroTipo.set('');
    this.filtroEscala.set('');
  }

  getSalarioSimuladoMensal(func: Funcionario): number {
    const contrato = this.contratos().find((c) => c.id === func.contratoId);
    if (!contrato) return 0;
    let diasMedio = 22;
    if (func.tipoEscala === TipoEscala.DOZE_POR_TRINTA_SEIS) diasMedio = 15;
    else if (func.tipoEscala === TipoEscala.FOLGUISTA) diasMedio = 8; // Arbitrary for simulation
    return (
      diasMedio * (contrato.valorDiariaCobrada || 0) + (contrato.valorBeneficiosExtrasMensal || 0)
    );
  }
}
