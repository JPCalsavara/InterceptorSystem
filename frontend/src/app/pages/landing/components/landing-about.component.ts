import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-about',
  standalone: true,
  template: `
    <section class="about" id="sobre">
      <div class="about-inner">
        <div class="about-content">
          <h2 class="section-title">Interceptor<br/>Assessoria Inteligente</h2>
          <p class="about-text">
            Somos uma <strong>empresa de gestão e facilities em associações condominiais</strong>,
            com <strong>consultoria</strong> e <strong>gerenciamento operacional e administrativo</strong>
            para clientes. Atualmente atendemos <strong>7 clientes</strong> nas cidades de
            <strong>Porto Feliz, Tietê, Tatuí, Boituva e Salto</strong>.
          </p>
          <p class="about-text">
            Com mais de uma década de experiência no setor, desenvolvemos soluções sob medida para
            cada cliente. Da operação de facilities à gestão completa administrativa. Nossa
            metodologia garante eficiência operacional, transparência total e tranquilidade para
            síndicos e moradores.
          </p>

          <div class="about-mission">
            <h3>Nossa missão</h3>
            <p>
              Prestar serviços com excelência, responsabilidade e comprometimento,
              oferecendo soluções inteligentes em segurança e facilities, garantindo
              tranquilidade, organização e eficiência operacional aos nossos clientes.
            </p>
          </div>
        </div>
        <div class="about-values">
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div class="value-content">
              <h4>Segurança</h4>
              <p>Proteção e prevenção em primeiro lugar, com profissionais treinados e supervisão contínua</p>
            </div>
          </div>
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div class="value-content">
              <h4>Profissionalismo</h4>
              <p>Equipes treinadas, supervisionadas e selecionadas com rigor para cada operação</p>
            </div>
          </div>
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
              </svg>
            </div>
            <div class="value-content">
              <h4>Gestão inteligente</h4>
              <p>Processos, controles e acompanhamento contínuo para otimizar custos e resultados</p>
            </div>
          </div>
          <div class="value-item">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <div class="value-content">
              <h4>Compromisso</h4>
              <p>Excelência no atendimento e foco na qualidade de vida do cliente</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .about { padding: 6rem 2rem; background: var(--bg-primary); }

    .about-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1.2fr 0.8fr;
      gap: 5rem; align-items: start;
    }

    .section-title {
      font-size: clamp(1.75rem, 3vw, var(--text-4xl));
      font-weight: var(--fw-extrabold);
      color: var(--text-primary);
      line-height: 1.1; letter-spacing: -0.03em;
      margin-bottom: var(--space-6);
    }

    .about-text {
      font-size: var(--text-base);
      color: var(--text-secondary);
      line-height: 1.8;
      margin-bottom: var(--space-4);
      max-width: 65ch;
    }
    .about-text strong { color: var(--text-primary); font-weight: var(--fw-semibold); }

    .about-mission {
      margin-top: var(--space-6);
      padding: var(--space-6);
      background: color-mix(in srgb, var(--primary-color) 6%, transparent);
      border-left: 3px solid var(--primary-color);
      border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    }
    .about-mission h3 {
      font-size: var(--text-base);
      font-weight: var(--fw-bold);
      color: var(--primary-color);
      margin-bottom: var(--space-2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: var(--text-sm);
    }
    .about-mission p {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.7; margin: 0;
    }

    .about-values { display: flex; flex-direction: column; gap: var(--space-4); }

    .value-item {
      display: flex; align-items: flex-start; gap: var(--space-4);
      padding: var(--space-5);
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-subtle);
      border-left: 3px solid var(--primary-color);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .value-item:hover {
      box-shadow: var(--shadow-md);
      transform: translateX(4px);
    }

    .value-icon {
      font-size: 1.75rem; color: var(--primary-color);
      line-height: 1; flex-shrink: 0; padding-top: 2px;
    }

    .value-content h4 {
      font-size: var(--text-base); font-weight: var(--fw-bold);
      color: var(--text-primary); margin-bottom: var(--space-1);
    }
    .value-content p {
      font-size: var(--text-sm); color: var(--text-secondary);
      line-height: 1.6; margin: 0;
    }

    @media (max-width: 1024px) {
      .about-inner { grid-template-columns: 1fr; gap: 3rem; }
    }

    @media (max-width: 600px) {
      .about { padding: 4rem 1.5rem; }
    }
  `],
})
export class LandingAboutComponent {}
