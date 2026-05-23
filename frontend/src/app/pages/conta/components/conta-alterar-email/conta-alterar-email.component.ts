import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-conta-alterar-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2>Alterar E-mail</h2>
      </div>
      <div class="card-body">
        <p class="section-desc">
          E-mail atual: <strong>{{ authService.currentUser()?.email }}</strong>
        </p>
        <form class="form" (ngSubmit)="solicitarAlteracaoEmail()">
          <div class="form-group">
            <label>Novo e-mail</label>
            <input
              type="email"
              [(ngModel)]="novoEmail"
              name="novoEmail"
              data-cy="conta-novo-email"
              placeholder="novo@empresa.com"
            />
          </div>
          @if (erroEmail()) {
            <div class="error-msg">{{ erroEmail() }}</div>
          }
          @if (sucessoEmail()) {
            <div class="success-msg">
              Um e-mail de confirmação foi enviado para {{ novoEmail }}. Acesse o link para
              confirmar a troca.
            </div>
          }
          <button type="submit" class="btn-primary" data-cy="conta-email-submit" [disabled]="salvandoEmail()">
            @if (salvandoEmail()) {
              Enviando...
            } @else {
              Solicitar alteração de e-mail
            }
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }
      .card-header h2 {
        font-size: var(--text-2xl);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }
      .card-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        align-items: flex-start;
      }
      .section-desc {
        color: var(--text-secondary);
        font-size: var(--text-base);
        margin: 0;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        width: 100%;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .form-group label {
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
      }
      .form-group input {
        padding: var(--space-3) var(--space-4);
        border: 1px solid var(--border-strong);
        border-radius: var(--radius-md);
        background: var(--input-bg);
        color: var(--text-primary);
        font-size: var(--text-base);
        font-family: inherit;
        transition: all 0.2s ease;
      }
      .form-group input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
      }
      .btn-primary {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-md);
        font-size: var(--text-base);
        font-weight: var(--fw-semibold);
        cursor: pointer;
        align-self: flex-start;
        transition: all 0.2s ease;
      }
      .btn-primary:hover:not(:disabled) {
        background: var(--primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      .error-msg {
        background: rgba(220, 38, 38, 0.1);
        color: var(--kanban-error-border, #dc2626);
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
      }
      .success-msg {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: var(--radius-md);
        padding: var(--space-3) var(--space-4);
        font-size: var(--text-sm);
      }
      @media (max-width: 768px) {
        .card { padding: var(--space-4); }
        .card-header h2 { font-size: var(--text-xl); }
        .btn-primary { width: 100%; }
      }
    `,
  ],
})
export class ContaAlterarEmailComponent {
  authService = inject(AuthService);

  novoEmail = '';
  salvandoEmail = signal(false);
  erroEmail = signal<string | null>(null);
  _sucessoEmail = signal(false);

  sucessoEmail(): boolean {
    return this._sucessoEmail();
  }

  solicitarAlteracaoEmail(): void {
    if (!this.novoEmail) return;

    this.erroEmail.set(null);
    this._sucessoEmail.set(false);
    this.salvandoEmail.set(true);

    this.authService.solicitarAlteracaoEmail(this.novoEmail).subscribe({
      next: () => {
        this.salvandoEmail.set(false);
        this._sucessoEmail.set(true);
      },
      error: (err) => {
        this.salvandoEmail.set(false);
        this.erroEmail.set(err?.error?.mensagem ?? 'Erro ao solicitar alteração de e-mail.');
      },
    });
  }
}
