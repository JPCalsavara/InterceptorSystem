import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  template: `
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">Interceptor Assessoria</div>
          <p class="footer-desc">Gestão e Facilities Inteligentes</p>
        </div>

        <div class="footer-links">
          <div class="footer-column">
            <h4>Empresa</h4>
            <a href="#sobre">Sobre</a>
            <a href="#servicos">Serviços</a>
            <a href="#lideranca">Liderança</a>
          </div>
          <div class="footer-column">
            <h4>Produto</h4>
            <a href="#sistema">InterceptorSystem</a>
            <a href="/login">Área do Cliente</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Interceptor Assessoria Inteligente. Todos os direitos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .landing-footer {
      background: var(--surface-card);
      border-top: 1px solid var(--border-subtle);
      padding: 4rem 2rem 2rem;
    }

    .footer-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between;
      gap: 4rem; padding-bottom: 3rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .footer-brand { max-width: 300px; }
    .footer-logo {
      font-size: var(--text-xl); font-weight: var(--fw-extrabold);
      color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: var(--space-2);
    }
    .footer-desc { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }

    .footer-links {
      display: flex; gap: 4rem;
    }

    .footer-column { display: flex; flex-direction: column; gap: var(--space-3); }
    .footer-column h4 {
      font-size: var(--text-sm); font-weight: var(--fw-bold);
      color: var(--text-primary); margin-bottom: var(--space-2);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .footer-column a {
      font-size: var(--text-sm); color: var(--text-secondary);
      text-decoration: none; transition: color 0.2s;
    }
    .footer-column a:hover { color: var(--primary-color); }

    .footer-bottom {
      max-width: 1200px; margin: 0 auto;
      padding-top: 2rem; text-align: center;
    }
    .footer-bottom p {
      font-size: var(--text-xs); color: var(--text-tertiary, var(--text-secondary)); margin: 0;
    }

    @media (max-width: 600px) {
      .landing-footer { padding: 3rem 1.5rem 1.5rem; }
      .footer-inner { flex-direction: column; gap: 2.5rem; text-align: center; align-items: center; }
      .footer-links { flex-direction: column; gap: 2rem; text-align: center; }
    }
  `],
})
export class LandingFooterComponent {
  currentYear = new Date().getFullYear();
}
