import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-stats',
  standalone: true,
  template: `
    <section class="stats" id="numeros">
      <div class="stats-inner">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-n">7+</span>
            <span class="stat-l">Clientes atendidos</span>
            <span class="stat-d">Região metropolitana de Sorocaba</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <span class="stat-n">50+</span>
            <span class="stat-l">Funcionários gerenciados</span>
            <span class="stat-d">Vigias, porteiros e supervisores</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <span class="stat-n">R$400k+</span>
            <span class="stat-l">Folha de pagamento</span>
            <span class="stat-d">Gerenciamento mensal de custos</span>
          </div>
          <div class="stat-div"></div>
          <div class="stat-item">
            <span class="stat-n">10+</span>
            <span class="stat-l">Anos de experiência</span>
            <span class="stat-d">No mercado de gestão e facilities</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stats {
      background: linear-gradient(135deg, var(--blue-800) 0%, var(--blue-700) 50%, var(--blue-600) 100%);
      padding: 5rem 2rem;
      position: relative;
      overflow: hidden;
    }
    .stats::before {
      content: '';
      position: absolute; top: -80px; right: -80px;
      width: 320px; height: 320px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.04);
    }
    .stats::after {
      content: '';
      position: absolute; bottom: -60px; left: -60px;
      width: 240px; height: 240px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.04);
    }

    .stats-inner {
      max-width: 1200px; margin: 0 auto;
      position: relative;
    }

    .stats-row {
      display: flex; align-items: center;
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-2xl);
      overflow: hidden;
      backdrop-filter: blur(8px);
    }

    .stat-item {
      flex: 1;
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      padding: 2.5rem 1.5rem;
      gap: var(--space-1);
      transition: background 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .stat-item:hover { background: rgba(255, 255, 255, 0.08); }

    .stat-div {
      width: 1px; height: 70px;
      background: rgba(255, 255, 255, 0.18);
      flex-shrink: 0;
    }

    .stat-n {
      font-size: clamp(2.25rem, 4vw, 3.5rem);
      font-weight: var(--fw-extrabold);
      color: white;
      letter-spacing: -0.03em; line-height: 1;
    }

    .stat-l {
      font-size: var(--text-sm); font-weight: var(--fw-semibold);
      color: rgba(255, 255, 255, 0.9);
      margin-top: var(--space-2);
    }

    .stat-d {
      font-size: var(--text-xs);
      color: rgba(255, 255, 255, 0.55);
      margin-top: 2px;
    }

    @media (max-width: 1024px) {
      .stats-row { flex-wrap: wrap; }
      .stat-div { display: none; }
      .stat-item { flex: 0 0 50%; }
    }

    @media (max-width: 600px) {
      .stats { padding: 3rem 1.5rem; }
      .stats-row { flex-direction: column; border-radius: var(--radius-xl); }
      .stat-item { flex: 1; }
    }
  `],
})
export class LandingStatsComponent {}
