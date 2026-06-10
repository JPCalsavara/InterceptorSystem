import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-leader',
  standalone: true,
  template: `
    <section class="leadership" id="lideranca">
      <div class="leadership-inner">
        <div class="leadership-quote-area">
          <div class="big-quote">"</div>
          <blockquote class="leader-quote">
            Nosso objetivo é oferecer gestão e facilities com a mesma eficiência e transparência
            que esperamos de qualquer serviço de excelência. Cada cliente que atendemos recebe
            atenção personalizada porque entendemos que gestão condominial exige confiança.
          </blockquote>
          <div class="quote-author">
            <div class="qa-name">Luciano Calsavara</div>
            <div class="qa-role">Fundador e Diretor Operacional</div>
          </div>
        </div>

        <div class="leader-info">
          <h2 class="section-title">Luciano Calsavara</h2>
          <p class="leader-bio">
            Com mais de <strong>10 anos de experiência</strong> em gestão operacional, Luciano
            fundou a Interceptor com foco em excelência e inovação no atendimento a associações
            condominiais.
          </p>
          <p class="leader-bio">
            Sua vivência direta no campo, desde a diária de vigilantes até a negociação de
            contratos, trouxe a visão de transformar a gestão manual em processos digitais
            eficientes, capazes de escalar sem perder a qualidade e o atendimento personalizado.
          </p>
          <div class="leader-highlights">
            <div class="lh-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972m0 0a8.001 8.001 0 00-10.582 0m10.582 0L14.25 10.5m-10.582 0L10.5 10.5" />
              </svg>
              <span>+10 anos no setor de gestão e facilities</span>
            </div>
            <div class="lh-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <span>7 clientes atendidos ativamente</span>
            </div>
            <div class="lh-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span>Porto Feliz, Tietê, Tatuí, Boituva e Salto</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .leadership { padding: 6rem 2rem; background: var(--surface-card); }

    .leadership-inner {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 5rem; align-items: center;
    }

    .leadership-quote-area {
      display: flex; flex-direction: column;
      gap: var(--space-6); padding: var(--space-8);
      background: linear-gradient(135deg, var(--blue-800) 0%, var(--blue-700) 100%);
      border-radius: var(--radius-2xl);
      position: relative; overflow: hidden;
    }
    .leadership-quote-area::after {
      content: '';
      position: absolute; top: -40px; right: -40px;
      width: 160px; height: 160px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.05);
    }

    .big-quote {
      font-size: 8rem; font-weight: var(--fw-extrabold);
      color: rgba(255, 255, 255, 0.15);
      line-height: 0.8; font-family: Georgia, serif;
      user-select: none;
    }

    .leader-quote {
      font-size: var(--text-lg);
      color: rgba(255, 255, 255, 0.92);
      line-height: 1.75; font-style: italic;
      margin: 0; position: relative; z-index: 1;
    }

    .quote-author { position: relative; z-index: 1; }
    .qa-name { font-size: var(--text-base); font-weight: var(--fw-bold); color: white; }
    .qa-role { font-size: var(--text-sm); color: rgba(255, 255, 255, 0.6); margin-top: 2px; }

    .section-title {
      font-size: clamp(1.75rem, 3vw, var(--text-4xl));
      font-weight: var(--fw-extrabold);
      color: var(--text-primary);
      line-height: 1.1; letter-spacing: -0.03em;
      margin-bottom: var(--space-4);
    }

    .leader-info { display: flex; flex-direction: column; }

    .leader-bio {
      font-size: var(--text-base); color: var(--text-secondary);
      line-height: 1.8; margin-bottom: var(--space-4);
    }
    .leader-bio strong { color: var(--text-primary); font-weight: var(--fw-semibold); }

    .leader-highlights {
      display: flex; flex-direction: column;
      gap: var(--space-3); margin-top: var(--space-4);
    }

    .lh-item {
      display: flex; align-items: center;
      gap: var(--space-3); padding: var(--space-3) var(--space-4);
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
      font-size: var(--text-sm); font-weight: var(--fw-medium);
      color: var(--text-secondary);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .lh-item:hover {
      border-color: var(--primary-color);
      transform: translateX(4px);
    }
    .lh-item svg { font-size: 1.2rem; color: var(--primary-color); flex-shrink: 0; }

    @media (max-width: 1024px) {
      .leadership-inner { grid-template-columns: 1fr; gap: 3rem; }
    }

    @media (max-width: 600px) {
      .leadership { padding: 4rem 1.5rem; }
    }
  `],
})
export class LandingLeaderComponent {}
