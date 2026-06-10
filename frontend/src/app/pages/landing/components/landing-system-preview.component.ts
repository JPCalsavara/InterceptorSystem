import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-system-preview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="sys-preview">
      <div class="sys-preview-container">
        <div class="sys-preview-card">
          <div class="sp-content">
            <div class="sp-badge">Produto Exclusivo</div>
            <h2>Interceptor System</h2>
            <p>
              Nossa operação roda sobre uma plataforma tecnológica proprietária e completa. 
              Substituímos planilhas e achismos por gestão inteligente de escalas, contratos dinâmicos 
              e um motor de cálculo de folha de pagamento à prova de erros.
            </p>
            <div class="sp-actions">
              <a routerLink="/sistema" class="btn-primary">
                Conheça a plataforma
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
          <div class="sp-visual">
            <div class="sp-image-wrapper">
              <!-- Using the same dashboard mockup for consistency -->
              <img src="/landing-dashboard.png" alt="Interceptor System Dashboard Preview" />
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .sys-preview {
      padding: 6rem 2rem;
      background: var(--bg-primary);
      display: flex;
      justify-content: center;
    }

    .sys-preview-container {
      max-width: 1200px;
      width: 100%;
    }

    .sys-preview-card {
      background: linear-gradient(135deg, var(--surface-card) 0%, color-mix(in srgb, var(--primary-color) 4%, var(--surface-card)) 100%);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-2xl);
      padding: 4rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-xl);
    }

    /* Decorative gradient blurs */
    .sys-preview-card::before {
      content: '';
      position: absolute;
      top: -100px; left: -100px;
      width: 300px; height: 300px;
      background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 15%, transparent) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .sp-content {
      position: relative;
      z-index: 2;
    }

    .sp-badge {
      display: inline-flex;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      color: var(--primary-color);
      font-size: var(--text-xs);
      font-weight: var(--fw-bold);
      padding: 0.35rem 0.875rem;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: var(--space-4);
      border: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
    }

    .sp-content h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: var(--fw-extrabold);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .sp-content p {
      font-size: var(--text-lg);
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: var(--space-8);
      max-width: 480px;
    }

    .sp-actions .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 1rem 2rem;
      background: var(--text-primary);
      color: var(--bg-primary);
      font-weight: var(--fw-bold);
      font-size: var(--text-base);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sp-actions .btn-primary:hover {
      background: var(--primary-color);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }

    .sp-actions .btn-primary svg {
      width: 20px;
      height: 20px;
      transition: transform 0.2s ease;
    }

    .sp-actions .btn-primary:hover svg {
      transform: translateX(4px);
    }

    .sp-visual {
      position: relative;
      perspective: 1000px;
      z-index: 2;
    }

    .sp-image-wrapper {
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-strong);
      overflow: hidden;
      transform: rotateY(-8deg) rotateX(4deg);
      box-shadow: 20px 20px 40px rgba(0,0,0,0.1);
      transition: transform 0.5s ease;
      background: var(--bg-primary);
    }

    .sys-preview-card:hover .sp-image-wrapper {
      transform: rotateY(0) rotateX(0);
    }

    .sp-image-wrapper img {
      width: 100%;
      height: auto;
      display: block;
      transform: scale(1.02); /* Slight scale to hide border gaps if any */
    }

    @media (max-width: 1024px) {
      .sys-preview-card {
        grid-template-columns: 1fr;
        padding: 3rem;
        gap: 3rem;
        text-align: center;
      }
      .sp-content p {
        margin-left: auto;
        margin-right: auto;
      }
      .sp-image-wrapper {
        transform: none;
      }
    }

    @media (max-width: 600px) {
      .sys-preview { padding: 4rem 1rem; }
      .sys-preview-card { padding: 2.5rem 1.5rem; }
      .sp-content h2 { font-size: 2.25rem; }
    }
  `]
})
export class LandingSystemPreviewComponent {}
