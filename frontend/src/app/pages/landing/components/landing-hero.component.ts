import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  template: `
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">
            Assessoria<br/>
            <span class="hero-accent">inteligente</span><br/>
            em Gestão Condominial
          </h1>
          <p class="hero-description">
            Soluções integradas de gestão e facilities para associações condominiais
            nas cidades de Porto Feliz, Tietê, Tatuí, Boituva e Salto.
          </p>
          <div class="hero-actions">
            <a href="#servicos" class="btn-hero-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              Conheça nossos serviços
            </a>
            <a href="#contato" class="btn-hero-ghost">Fale conosco</a>
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-image-wrapper">
            <img src="/landing-hero.png" alt="Portaria de condomínio moderno com segurança profissional" class="hero-image" loading="eager" />
          </div>
          <div class="hero-badge hero-badge-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <span>50+ profissionais</span>
          </div>
          <div class="hero-badge hero-badge-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
            <span>7+ clientes ativos</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .hero {
      min-height: calc(100dvh - 72px);
      position: relative;
      display: flex;
      align-items: center;
      padding: var(--space-16) 2rem;
      background: var(--surface-card);
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
        linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px);
      background-size: 48px 48px;
      opacity: 0.4;
      pointer-events: none;
    }

    .hero-inner {
      position: relative;
      max-width: 1200px; width: 100%; margin: 0 auto;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-text {
      display: flex; flex-direction: column;
      gap: var(--space-6);
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 3.75rem);
      font-weight: var(--fw-extrabold);
      line-height: 1.05;
      color: var(--text-primary);
      letter-spacing: -0.03em;
    }

    .hero-accent {
      color: var(--primary-color);
      position: relative;
    }
    .hero-accent::after {
      content: '';
      position: absolute; bottom: 2px; left: 0; right: 0;
      height: 3px; background: var(--primary-color);
      border-radius: var(--radius-full);
      opacity: 0.35;
    }

    .hero-description {
      font-size: var(--text-lg);
      color: var(--text-secondary);
      line-height: 1.7;
      max-width: 520px;
    }

    .hero-actions {
      display: flex; gap: var(--space-4);
      flex-wrap: wrap; align-items: center;
    }

    .btn-hero-primary {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: 0.875rem 1.75rem;
      background: var(--primary-color); color: white;
      border-radius: var(--radius-lg); text-decoration: none;
      font-weight: var(--fw-bold); font-size: var(--text-base);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-hero-primary svg { font-size: 1rem; }
    .btn-hero-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-color) 35%, transparent);
    }
    .btn-hero-primary:active { transform: translateY(0) scale(0.98); }

    .btn-hero-ghost {
      display: inline-flex; align-items: center; gap: var(--space-2);
      padding: 0.875rem 1.75rem;
      color: var(--text-secondary);
      border-radius: var(--radius-lg); text-decoration: none;
      font-weight: var(--fw-semibold); font-size: var(--text-base);
      border: 1.5px solid var(--border-strong);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-hero-ghost:hover {
      color: var(--primary-color);
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 5%, transparent);
    }

    /* Hero visual (right side) */
    .hero-visual {
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }

    .hero-image-wrapper {
      border-radius: var(--radius-2xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-subtle);
    }

    .hero-image {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      aspect-ratio: 1 / 1;
    }

    .hero-badge {
      position: absolute;
      display: flex; align-items: center; gap: var(--space-2);
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm); font-weight: var(--fw-semibold);
      color: var(--text-primary);
      box-shadow: var(--shadow-md);
      animation: badgeFloat 3s ease-in-out infinite;
    }
    .hero-badge svg { color: var(--primary-color); font-size: 1.1rem; }

    .hero-badge-1 { top: 1rem; right: -1rem; animation-delay: 0s; }
    .hero-badge-2 { bottom: 1.5rem; left: -1rem; animation-delay: 1s; }

    @keyframes badgeFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-badge { animation: none; }
    }

    @media (max-width: 1024px) {
      .hero-inner { grid-template-columns: 1fr; gap: 3rem; }
    }

    @media (max-width: 600px) {
      .hero {
        min-height: 100dvh;
        padding: 2rem 1.5rem;
        align-items: flex-start;
        justify-content: center;
      }
      .hero-visual { display: none; }
      .hero-text { text-align: center; align-items: center; }
      .hero-title { font-size: clamp(2.25rem, 9vw, 3rem); }
      .hero-description { font-size: var(--text-base); }
      .hero-actions {
        flex-direction: column; align-items: stretch; width: 100%;
      }
      .hero-actions a { text-align: center; justify-content: center; }
    }
  `],
})
export class LandingHeroComponent {}
