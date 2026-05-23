import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContaAlterarSenhaComponent } from './components/conta-alterar-senha/conta-alterar-senha.component';
import { ContaVerificacaoEmailComponent } from './components/conta-verificacao-email/conta-verificacao-email.component';
import { ContaAlterarEmailComponent } from './components/conta-alterar-email/conta-alterar-email.component';

@Component({
  selector: 'app-conta',
  standalone: true,
  imports: [CommonModule, ContaAlterarSenhaComponent, ContaVerificacaoEmailComponent, ContaAlterarEmailComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        <h1>Minha Conta</h1>
      </div>

      <!-- Status de verificação de e-mail Componentizado -->
      <app-conta-verificacao-email></app-conta-verificacao-email>

      <!-- Alterar senha Componentizado -->
      <app-conta-alterar-senha></app-conta-alterar-senha>

      <!-- Alterar e-mail Componentizado -->
      <app-conta-alterar-email></app-conta-alterar-email>
    </div>
  `,
  styles: [
    `
      .page-container {
        max-width: 700px;
        margin: var(--space-4) auto;
        padding: 0 var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .page-header svg {
        width: 1.5em;
        height: 1.5em;
        color: var(--primary-color);
        font-size: var(--text-3xl);
      }

      .page-header h1 {
        font-size: var(--text-3xl);
        font-weight: var(--fw-extrabold);
        color: var(--text-primary);
        margin: 0;
      }

      @media (max-width: 768px) {
        .page-container {
          padding: 0 var(--space-2);
        }
        .page-header h1 {
          font-size: var(--text-2xl);
        }
        .page-header svg {
          font-size: var(--text-2xl);
        }
      }
    `,
  ],
})
export class ContaComponent {}
