import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CondominioService } from '../../../services/condominio.service';
import { Condominio } from '../../../models/condominio.model';

@Component({
  selector: 'app-condominio-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './condominio-list.component.html',
  styleUrl: './condominio-list.component.scss',
})
export class CondominioListComponent implements OnInit {
  private service = inject(CondominioService);
  private router = inject(Router);

  condominios = signal<Condominio[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCondominios();
  }

  loadCondominios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.getAll().subscribe({
      next: (data) => {
        this.condominios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar condomínios. Tente novamente.');
        this.loading.set(false);
        console.error('Erro:', err);
      },
    });
  }

  confirmDelete(id: string, nome: string): void {
    if (confirm(`Deseja realmente excluir o condomínio "${nome}"?`)) {
      this.deleteCondominio(id);
    }
  }

  deleteCondominio(id: string): void {
    this.loading.set(true);

    this.service.delete(id).subscribe({
      next: () => {
        this.successMessage.set('Condomínio excluído com sucesso!');
        this.loadCondominios();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.error.set('Erro ao excluir condomínio. Tente novamente.');
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

  navigateToDetail(id: string): void {
    this.router.navigate(['/condominios', id]);
  }
}
