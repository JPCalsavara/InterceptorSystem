import { Component, input, output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContatoInput } from '../../../services/contato.service';

@Component({
  selector: 'app-landing-contact',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="contact" id="contato">
      <div class="contact-inner">
        <div class="contact-info">
          <h2 class="section-title">Fale Conosco</h2>
          <p class="contact-text">
            Tire suas dúvidas, solicite um orçamento ou agende uma reunião
            com nossa equipe comercial.
          </p>

          <div class="contact-methods">
            <div class="method-item">
              <div class="method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div class="method-content">
                <strong>E-mail</strong>
                <a href="mailto:contato@interceptor-assessoria.com">contato&#64;interceptor-assessoria.com</a>
              </div>
            </div>

            <div class="method-item">
              <div class="method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div class="method-content">
                <strong>Atendimento</strong>
                <span>Porto Feliz, Tietê, Tatuí, Boituva e Salto</span>
              </div>
            </div>
          </div>
        </div>

        <div class="contact-form-wrapper">
          <form class="contact-form" (ngSubmit)="onSubmit()" #contactForm="ngForm">
            <div class="form-group">
              <label for="nome">Nome completo</label>
              <input type="text" id="nome" name="nome" [(ngModel)]="formData.nome" required
                     placeholder="Como podemos te chamar?" [disabled]="isSubmitting()" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="cidade">Cidade</label>
                <input type="text" id="cidade" name="cidade" [(ngModel)]="formData.cidade" required
                       placeholder="Ex: Porto Feliz" [disabled]="isSubmitting()" />
              </div>
              <div class="form-group">
                <label for="estado">Estado</label>
                <input type="text" id="estado" name="estado" [(ngModel)]="formData.estado" required
                       placeholder="Ex: SP" [disabled]="isSubmitting()" />
              </div>
            </div>

            <div class="form-group">
              <label for="email">E-mail corporativo</label>
              <input type="email" id="email" name="email" [(ngModel)]="formData.email" required
                     placeholder="seu@email.com.br" [disabled]="isSubmitting()" />
            </div>

            <div class="form-group">
              <label for="descricao">Mensagem</label>
              <textarea id="descricao" name="descricao" [(ngModel)]="formData.descricao" required rows="4"
                        placeholder="Como podemos ajudar sua operação?" [disabled]="isSubmitting()"></textarea>
            </div>

            <button type="submit" class="btn-submit" [disabled]="!contactForm.form.valid || isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner"></span> Enviando...
              } @else {
                Enviar mensagem
              }
            </button>

            @if (message()) {
              <div class="submit-message" [class.success]="message()?.includes('sucesso')" [class.error]="!message()?.includes('sucesso')">
                {{ message() }}
              </div>
            }
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .contact { padding: 6rem 2rem; background: var(--bg-primary); }

    .contact-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 5rem; align-items: start;
    }

    .section-title {
      font-size: clamp(1.75rem, 3vw, var(--text-4xl));
      font-weight: var(--fw-extrabold);
      color: var(--text-primary);
      line-height: 1.1; letter-spacing: -0.03em;
      margin-bottom: var(--space-4);
    }

    .contact-text {
      font-size: var(--text-lg); color: var(--text-secondary);
      line-height: 1.6; margin-bottom: var(--space-8);
    }

    .contact-methods {
      display: flex; flex-direction: column; gap: var(--space-6);
    }

    .method-item {
      display: flex; align-items: flex-start; gap: var(--space-4);
    }

    .method-icon {
      width: 44px; height: 44px; min-width: 44px;
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
      border-radius: var(--radius-full);
      display: flex; align-items: center; justify-content: center;
      color: var(--primary-color); font-size: 1.25rem;
    }

    .method-content { display: flex; flex-direction: column; gap: 2px; }
    .method-content strong {
      font-size: var(--text-sm); font-weight: var(--fw-bold); color: var(--text-primary);
    }
    .method-content a, .method-content span {
      font-size: var(--text-base); color: var(--text-secondary);
      text-decoration: none; transition: color 0.2s;
    }
    .method-content a:hover { color: var(--primary-color); }

    /* Form Styles */
    .contact-form-wrapper {
      background: var(--surface-card);
      padding: var(--space-8);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-lg);
    }

    .contact-form { display: flex; flex-direction: column; gap: var(--space-4); }

    .form-row { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-4); }

    .form-group { display: flex; flex-direction: column; gap: var(--space-2); }
    .form-group label {
      font-size: var(--text-sm); font-weight: var(--fw-semibold); color: var(--text-primary);
    }
    .form-group input, .form-group textarea {
      padding: 0.75rem 1rem;
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: inherit; font-size: var(--text-base);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none; border-color: var(--primary-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 15%, transparent);
    }
    .form-group input:disabled, .form-group textarea:disabled {
      opacity: 0.7; cursor: not-allowed;
    }
    .form-group textarea { resize: vertical; min-height: 100px; }

    .btn-submit {
      margin-top: var(--space-2);
      padding: 1rem;
      background: var(--primary-color); color: white;
      border: none; border-radius: var(--radius-md);
      font-weight: var(--fw-bold); font-size: var(--text-base);
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: var(--space-2);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--primary-dark); transform: translateY(-2px);
    }
    .btn-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: white;
      border-radius: 50%; animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .submit-message {
      margin-top: var(--space-4); padding: 1rem;
      border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: var(--fw-medium);
      text-align: center;
    }
    .submit-message.success {
      background: color-mix(in srgb, var(--success-color, #4caf50) 10%, transparent);
      color: var(--success-color, #4caf50);
      border: 1px solid color-mix(in srgb, var(--success-color, #4caf50) 20%, transparent);
    }
    .submit-message.error {
      background: color-mix(in srgb, var(--error-color, #f44336) 10%, transparent);
      color: var(--error-color, #f44336);
      border: 1px solid color-mix(in srgb, var(--error-color, #f44336) 20%, transparent);
    }

    @media (max-width: 900px) {
      .contact-inner { grid-template-columns: 1fr; gap: 3rem; }
    }

    @media (max-width: 600px) {
      .contact { padding: 4rem 1.5rem; }
      .contact-form-wrapper { padding: var(--space-5); }
      .form-row { grid-template-columns: 1fr; }
    }
  `],
})
export class LandingContactComponent {
  readonly isSubmitting = input.required<boolean>();
  readonly message = input.required<string | null>();
  readonly submitForm = output<ContatoInput>();

  formData: ContatoInput = {
    nome: '',
    cidade: '',
    estado: '',
    email: '',
    descricao: ''
  };

  onSubmit() {
    this.submitForm.emit({ ...this.formData });
    // Reset handled by smart component logic when success occurs
  }
}
