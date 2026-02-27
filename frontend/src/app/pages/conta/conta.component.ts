import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-conta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <h1 class="page-title">Minha Conta</h1>

      <!-- Status de verificação de e-mail -->
      <section class="card">
        <h2 class="section-title">Status do E-mail</h2>
        @if (authService.isEmailVerificado()) {
          <div class="status-badge verified">E-mail verificado</div>
        } @else {
          <div class="status-badge unverified">E-mail não verificado</div>
          <button
            class="btn-secondary"
            (click)="reenviarVerificacao()"
            [disabled]="enviandoVerificacao()"
          >
            @if (enviandoVerificacao()) {
              Enviando...
            } @else {
              Reenviar e-mail de verificação
            }
          </button>
          @if (msgVerificacao()) {
            <p class="feedback-msg">{{ msgVerificacao() }}</p>
          }
        }
      </section>

      <!-- Alterar senha -->
      <section class="card">
        <h2 class="section-title">Alterar Senha</h2>
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
          @if (sucesso('senha')) {
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
      </section>

      <!-- Alterar e-mail -->
      <section class="card">
        <h2 class="section-title">Alterar E-mail</h2>
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
              placeholder="novo@empresa.com"
            />
          </div>
          @if (erroEmail()) {
            <div class="error-msg">{{ erroEmail() }}</div>
          }
          @if (sucesso('email')) {
            <div class="success-msg">
              Um e-mail de confirmação foi enviado para {{ novoEmail }}. Acesse o link para
              confirmar a troca.
            </div>
          }
          <button type="submit" class="btn-primary" [disabled]="salvandoEmail()">
            @if (salvandoEmail()) {
              Enviando...
            } @else {
              Solicitar alteração de e-mail
            }
          </button>
        </form>
      </section>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 700px;
        margin: 2rem auto;
        padding: 0 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
      }

      .card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
      }

      .section-desc {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin: 0;
      }

      .status-badge {
        display: inline-block;
        padding: 0.35rem 0.8rem;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;

        &.verified {
          background: #d1fae5;
          color: #065f46;
        }

        &.unverified {
          background: #fef3c7;
          color: #92400e;
        }
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        input {
          padding: 0.7rem 1rem;
          border: 1px solid var(--border-strong);
          border-radius: 8px;
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.95rem;

          &:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.15);
          }
        }
      }

      .btn-primary {
        padding: 0.75rem 1.25rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        align-self: flex-start;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-secondary {
        padding: 0.6rem 1rem;
        background: transparent;
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        align-self: flex-start;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: rgba(33, 150, 243, 0.08);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .error-msg {
        background: #fee2e2;
        color: #dc2626;
        border: 1px solid #fecaca;
        border-radius: 6px;
        padding: 0.6rem 0.85rem;
        font-size: 0.875rem;
      }

      .success-msg {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #6ee7b7;
        border-radius: 6px;
        padding: 0.6rem 0.85rem;
        font-size: 0.875rem;
      }

      .feedback-msg {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
      }
    `,
  ],
})
export class ContaComponent {
  authService = inject(AuthService);

  // Verificação de e-mail
  enviandoVerificacao = signal(false);
  msgVerificacao = signal<string | null>(null);

  // Alterar senha
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  salvandoSenha = signal(false);
  erroSenha = signal<string | null>(null);
  _sucessoSenha = signal(false);

  // Alterar e-mail
  novoEmail = '';
  salvandoEmail = signal(false);
  erroEmail = signal<string | null>(null);
  _sucessoEmail = signal(false);

  sucesso(tipo: 'senha' | 'email'): boolean {
    return tipo === 'senha' ? this._sucessoSenha() : this._sucessoEmail();
  }

  reenviarVerificacao(): void {
    this.enviandoVerificacao.set(true);
    this.msgVerificacao.set(null);

    this.authService.reenviarVerificacaoEmail().subscribe({
      next: () => {
        this.enviandoVerificacao.set(false);
        this.msgVerificacao.set('E-mail enviado! Verifique sua caixa de entrada.');
      },
      error: () => {
        this.enviandoVerificacao.set(false);
        this.msgVerificacao.set('Erro ao enviar. Tente novamente.');
      },
    });
  }

  alterarSenha(): void {
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) return;
    if (this.novaSenha !== this.confirmarSenha) {
      this.erroSenha.set('As senhas não coincidem.');
      return;
    }

    this.erroSenha.set(null);
    this._sucessoSenha.set(false);
    this.salvandoSenha.set(true);

    // Via ContaController que já existe
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
