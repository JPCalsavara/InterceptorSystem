import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-system',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="product" id="sistema">
      <div class="product-inner">
        <div class="product-content">
          <div class="section-eyebrow">Nosso Produto Digital</div>
          <h2 class="section-title">InterceptorSystem</h2>
          <p class="product-lead">
            A plataforma digital desenvolvida pela Interceptor para centralizar a gestão
            de associações condominiais.
          </p>
          <p class="product-text">
            O <strong>InterceptorSystem</strong> centraliza toda a operação: escalas de trabalho,
            contratos com cálculo automático de custos, folha de pagamento com adicionais CLT,
            controle de diárias e um dashboard financeiro em tempo real.
          </p>

          <div class="product-highlights">
            <div class="ph-item">
              <span class="ph-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </span>
              <div>
                <strong>Gestão de escalas</strong>
                <span>Diárias com calendário, kanban e substituições automáticas</span>
              </div>
            </div>
            <div class="ph-item">
              <span class="ph-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <div>
                <strong>Contratos inteligentes</strong>
                <span>Cálculo automático de impostos, margens e alertas de vencimento</span>
              </div>
            </div>
            <div class="ph-item">
              <span class="ph-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V4.242c0-.754-.727-1.294-1.453-1.096A60.114 60.114 0 002.25 5.25v13.5zm15.978-8.15c.63-.111 1.265-.207 1.906-.29.58-.075 1.054.453 1.054 1.04v5.04c0 .587-.474 1.115-1.054 1.04a62.06 62.06 0 00-1.906-.29V10.6z" />
                </svg>
              </span>
              <div>
                <strong>Folha de pagamento</strong>
                <span>Cálculo de salários, adicionais noturnos (CLT Art. 73) e encargos</span>
              </div>
            </div>
            <div class="ph-item">
              <span class="ph-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </span>
              <div>
                <strong>Dashboard financeiro</strong>
                <span>Custos, margens e indicadores operacionais em tempo real</span>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <a routerLink="/cadastro" class="btn-hero-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              Começar agora
            </a>
            <a routerLink="/login" class="btn-hero-ghost">Já tenho uma conta</a>
          </div>
        </div>

        <div class="product-visual">
          <div class="product-image-wrapper">
            <img src="/landing-dashboard.png" alt="Dashboard do InterceptorSystem mostrando métricas financeiras e gráficos de custos" class="product-image" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .product { padding: 6rem 2rem; background: var(--bg-primary); }

    .product-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 5rem; align-items: center;
    }

    .section-eyebrow {
      display: inline-block;
      font-size: var(--text-xs); font-weight: var(--fw-bold);
      color: var(--primary-color);
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: var(--space-4);
    }

    .section-title {
      font-size: clamp(1.75rem, 3vw, var(--text-4xl));
      font-weight: var(--fw-extrabold);
      color: var(--text-primary);
      line-height: 1.1; letter-spacing: -0.03em;
      margin-bottom: var(--space-4);
    }

    .product-lead {
      font-size: var(--text-xl); color: var(--primary-color);
      font-weight: var(--fw-semibold); line-height: 1.5;
      margin-bottom: var(--space-4);
    }

    .product-text {
      font-size: var(--text-base); color: var(--text-secondary);
      line-height: 1.8; margin-bottom: var(--space-8);
    }
    .product-text strong { color: var(--text-primary); font-weight: var(--fw-semibold); }

    .product-highlights {
      display: flex; flex-direction: column;
      gap: var(--space-4); margin-bottom: var(--space-8);
    }

    .ph-item {
      display: flex; align-items: flex-start; gap: var(--space-4);
    }
    .ph-item div {
      display: flex; flex-direction: column; gap: 2px;
    }
    .ph-item strong {
      font-size: var(--text-sm); font-weight: var(--fw-bold);
      color: var(--text-primary);
    }
    .ph-item span:not(.ph-icon) {
      font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5;
    }

    .ph-icon {
      width: 36px; height: 36px; min-width: 36px;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      color: var(--primary-color); font-size: 1.1rem;
      margin-top: 1px;
    }

    .product-actions {
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
      background: var(--primary-dark); transform: translateY(-2px);
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
      color: var(--primary-color); border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 5%, transparent);
    }

    /* Product visual - real image */
    .product-image-wrapper {
      border-radius: var(--radius-2xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-subtle);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .product-image-wrapper:hover { transform: translateY(-4px) scale(1.01); }

    .product-image {
      width: 100%; height: auto; display: block;
      object-fit: cover;
    }

    @media (max-width: 1024px) {
      .product-inner { grid-template-columns: 1fr; gap: 3rem; }
    }

    @media (max-width: 600px) {
      .product { padding: 4rem 1.5rem; }
      .product-actions { flex-direction: column; align-items: stretch; }
      .product-actions a { text-align: center; justify-content: center; }
    }
  `],
})
export class LandingSystemComponent {}
