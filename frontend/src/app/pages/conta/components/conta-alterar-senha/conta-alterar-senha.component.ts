import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-conta-alterar-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <div class="card-header">
        <h2>Alterar Senha</h2>
      </div>
      <div class="card-body">
        <form class="form" (ngSubmit)="alterarSenha()">
          <div class="form-group">
            <label>Senha atual</label>
            <input
              type="password"
              [(ngModel)]="senhaAtual"
              name="senhaAtual"
              placeholder="••••••••"
            />
          </div>
          <div class="form-group">
            <label>Nova senha</label>
            <input
              type="password"
              [(ngModel)]="novaSenha"
              name="novaSenha"
              placeholder="••••••••"
            />
          </div>
          <div class="form-group">
            <label>Confirmar nova senha</label>
            <input
              type="password"
              [(ngModel)]="confirmarSenha"
              name="confirmarSenha"
              placeholder="••••••••"
            />
          </div>
          
          @if (erroSenha()) {
            <div class="error-msg">{{ erroSenha() }}</div>
          }
          @if (_sucessoSenha()) {
            <div class="success-msg">Senha alterada com sucesso!</div>
          }
          
          <button type="submit" class="btn-primary" [disabled]="salvandoSenha()">
            @if (salvandoSenha()) {
              Salvando...
            } @else {
              Salvar senha
            }
          </button>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .card {
        background: var(--surface-card, #ffffff);
        border: 1px solid var(--border-subtle, #e5e7eb);
        border-radius: var(--radius-lg, 8px);
        padding: var(--space-6, 24px);
        box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
        display: flex;
        flex-direction: column;
        gap: var(--space-4, 16px);
      }

      .card-header h2 {
        font-size: var(--text-2xl, 1.5rem);
        font-weight: var(--fw-bold, 700);
        color: var(--text-primary, #111827);
        margin: 0;
      }

      .card-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-4, 16px);
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: var(--space-4, 16px);
        width: 100%;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-2, 8px);
      }

      .form-group label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: var(--fw-medium, 500);
        color: var(--text-secondary, #4b5563);
      }

      .form-group input {
        padding: var(--space-3, 12px) var(--space-4, 16px);
        border: 1px solid var(--border-strong, #d1d5db);
        border-radius: var(--radius-md, 6px);
        background: var(--input-bg, #ffffff);
        color: var(--text-primary, #111827);
        font-size: var(--text-base, 1rem);
        transition: all 0.2s ease;
      }

      .form-group input:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }

      .btn-primary {
        background: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        padding: var(--space-3, 12px) var(--space-6, 24px);
        border-radius: var(--radius-md, 6px);
        font-size: var(--text-base, 1rem);
        font-weight: var(--fw-semibold, 600);
        cursor: pointer;
        align-self: flex-start;
        transition: all 0.2s ease;
      }

      .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.1);
      }

      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .error-msg {
        background: rgba(220, 38, 38, 0.1);
        color: #dc2626;
        border: 1px solid rgba(220, 38, 38, 0.3);
        border-radius: var(--radius-md, 6px);
        padding: var(--space-3, 12px) var(--space-4, 16px);
        font-size: var(--text-sm, 0.875rem);
      }

      .success-msg {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: var(--radius-md, 6px);
        padding: var(--space-3, 12px) var(--space-4, 16px);
        font-size: var(--text-sm, 0.875rem);
      }

      /* RESPONSIVIDADE NATIVA MOBILE */
      @media (max-width: 768px) {
        .card {
          padding: var(--space-4, 16px);
        }
        
        .card-header h2 {
          font-size: var(--text-xl, 1.25rem);
        }

        .btn-primary {
          /* Esticar o botão no mobile */
          width: 100%;
          align-self: stretch;
        }
      }
    `
  ]
})
export class ContaAlterarSenhaComponent {
  authService = inject(AuthService);

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  salvandoSenha = signal(false);
  erroSenha = signal<string | null>(null);
  _sucessoSenha = signal(false);

  alterarSenha(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) return;
    if (this.novaSenha !== this.confirmarSenha) {
      this.erroSenha.set('As senhas não coincidem.');
      return;
    }

    this.erroSenha.set(null);
    this._sucessoSenha.set(false);
    this.salvandoSenha.set(true);

    const empresaId = this.authService.currentUser()?.empresaId;
    this.authService['http']
      .put(`${this.authService['apiUrl'].replace('/auth', '/conta')}`, {
        senhaAtual: this.senhaAtual,
        novaSenha: this.novaSenha,
      })
      .subscribe({
        next: () => {
          this.salvandoSenha.set(false);
          this._sucessoSenha.set(true);
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarSenha = '';
        },
        error: (err: any) => {
          this.salvandoSenha.set(false);
          this.erroSenha.set(err?.error?.mensagem ?? 'Erro ao alterar senha.');
        },
      });
  }
}
