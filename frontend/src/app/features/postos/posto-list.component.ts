import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostoDeTrabalhoService } from '../../services/posto-de-trabalho.service';
import { PostoDeTrabalho } from '../../models/index';

@Component({
  selector: 'app-posto-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>📍 Postos de Trabalho</h1>
          <p class="subtitle">Gerencie todos os postos de trabalho cadastrados</p>
        </div>
        <button class="btn-primary" routerLink="/postos/novo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Novo Posto
        </button>
      </div>

      @if (successMessage()) {
      <div class="alert alert-success">
        {{ successMessage() }}
        <button class="alert-close" (click)="dismissSuccess()">×</button>
      </div>
      } @if (error()) {
      <div class="alert alert-error">
        {{ error() }}
        <button class="alert-close" (click)="dismissError()">×</button>
      </div>
      } @if (loading()) {
      <div class="loading-container">
        <div class="spinner"></div>
        <p>Carregando postos...</p>
      </div>
      } @if (!loading() && postos().length === 0) {
      <div class="empty-state">
        <h3>Nenhum posto cadastrado</h3>
        <p>Comece criando seu primeiro posto de trabalho</p>
        <button class="btn-primary" routerLink="/postos/novo">Criar Primeiro Posto</button>
      </div>
      } @if (!loading() && postos().length > 0) {
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Horário</th>
              <th class="actions-column">Ações</th>
            </tr>
          </thead>
          <tbody>
            @for (posto of postos(); track posto.id) {
            <tr>
              <td>{{ posto.horario }}</td>
              <td class="actions-column">
                <div class="action-buttons">
                  <button
                    class="btn-action btn-edit"
                    [routerLink]="['/postos', posto.id, 'editar']"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                  <button
                    class="btn-action btn-delete"
                    (click)="confirmDelete(posto.id, posto.horario)"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
        <div class="table-footer">
          <p>Total: {{ postos().length }} posto(s)</p>
        </div>
      </div>
      }
    </div>
  `,
  styleUrl: './posto-list.component.scss',
})
export class PostoListComponent implements OnInit {
  private service = inject(PostoDeTrabalhoService);

  postos = signal<PostoDeTrabalho[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPostos();
  }

  loadPostos(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.postos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar postos.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  confirmDelete(id: string, horario: string): void {
    if (confirm(`Deseja excluir o posto "${horario}"?`)) {
      this.service.delete(id).subscribe({
        next: () => {
          this.successMessage.set('Posto excluído!');
          this.loadPostos();
          setTimeout(() => this.dismissSuccess(), 5000);
        },
        error: (err) => {
          this.error.set('Erro ao excluir posto.');
          this.loading.set(false);
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
