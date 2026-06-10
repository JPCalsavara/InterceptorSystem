import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-cta',
  standalone: true,
  template: `
    <section class="cta-banner">
      <div class="cta-inner">
        <h2 class="cta-title">Pronto para otimizar sua gestão?</h2>
        <p class="cta-text">
          Converse com nossa equipe e descubra como a Interceptor pode transformar
          a operação do seu condomínio com transparência e eficiência.
        </p>
        <a href="#contato" class="btn-cta">
          Falar com especialista
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .cta-banner {
      background: var(--primary-color);
      padding: 6rem 2rem;
      position: relative;
      overflow: hidden;
      clip-path: polygon(0 5vw, 100% 0, 100% calc(100% - 5vw), 0 100%);
      margin: 4rem 0;
    }
    .cta-banner::before {
      content: '';
      position: absolute; inset: 0;
      background-image: radial-gradient(circle at right top, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at left bottom, rgba(255, 255, 255, 0.1) 0%, transparent 40%);
      pointer-events: none;
    }

    .cta-inner {
      max-width: 800px; margin: 0 auto;
      text-align: center;
      display: flex; flex-direction: column;
      align-items: center; gap: var(--space-6);
      position: relative; z-index: 1;
    }

    .cta-title {
      font-size: clamp(2rem, 4vw, var(--text-4xl));
      font-weight: var(--fw-extrabold);
      color: white; line-height: 1.1; letter-spacing: -0.02em;
    }

    .cta-text {
      font-size: var(--text-lg);
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6; max-width: 600px; margin: 0;
    }

    .btn-cta {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: 1rem 2rem;
      background: white; color: var(--primary-color);
      border-radius: var(--radius-lg); text-decoration: none;
      font-weight: var(--fw-bold); font-size: var(--text-base);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-cta svg { font-size: 1.1rem; transition: transform 0.25s; }
    .btn-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    .btn-cta:hover svg { transform: translateX(4px); }
    .btn-cta:active { transform: translateY(0) scale(0.98); }

    @media (max-width: 600px) {
      .cta-banner {
        clip-path: none; margin: 0; padding: 5rem 1.5rem;
      }
    }
  `],
})
export class LandingCtaComponent {}
