import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContratoService } from '../../../services/contrato.service';
import { Contrato, StatusContrato } from '../../../models/index';

@Component({
  selector: 'app-contrato-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contrato-list.component.html',
  styleUrl: './contrato-list.component.scss',
})
export class ContratoListComponent implements OnInit {
  private service = inject(ContratoService);

  contratos = signal<Contrato[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  StatusContrato = StatusContrato;

  ngOnInit(): void {
    this.loadContratos();
  }

  loadContratos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll().subscribe({
      next: (data) => {
        this.contratos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar contratos. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  confirmDelete(id: string, descricao: string): void {
    if (confirm(`Deseja realmente excluir o contrato "${descricao}"?`)) {
      this.deleteContrato(id);
    }
  }

  deleteContrato(id: string): void {
    this.loading.set(true);

    this.service.delete(id).subscribe({
      next: () => {
        this.successMessage.set('Contrato excluído com sucesso!');
        this.loadContratos();
        setTimeout(() => this.dismissSuccess(), 5000);
      },
      error: (err) => {
        this.error.set('Erro ao excluir contrato. Tente novamente.');
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

  getStatusLabel(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.PAGO:
        return 'Pago';
      case StatusContrato.PENDENTE:
        return 'Pendente';
      case StatusContrato.INATIVO:
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  }

  getStatusClass(status: StatusContrato): string {
    switch (status) {
      case StatusContrato.PAGO:
        return 'success';
      case StatusContrato.PENDENTE:
        return 'warning';
      case StatusContrato.INATIVO:
        return 'inactive';
      default:
        return '';
    }
  }
}
