import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-services',
  standalone: true,
  template: `
    <section class="services" id="servicos">
      <div class="services-inner">
        <div class="services-header">
          <h2 class="services-title">Soluções completas<br/>para sua operação</h2>
          <p class="services-subtitle">
            Da operação de facilities à gestão financeira, tudo que seu cliente precisa
          </p>
        </div>

        <div class="services-grid">
          <!-- Card grande (destaque) -->
          <div class="service-card service-card-featured">
            <div class="service-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3>Coordenação de Segurança</h3>
            <p>
              Planejamento estratégico, supervisão de equipes, controle de acesso e CFTV,
              rondas preventivas, gestão de ocorrências e procedimentos operacionais padrão (POP).
            </p>
            <div class="service-tag">Serviço principal</div>
          </div>

          <!-- Cards menores -->
          <div class="service-card">
            <div class="service-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3>Serviços de Portaria</h3>
            <p>
              Controle de entrada e saída, identificação de visitantes, cadastro de prestadores,
              controle de entregas e operação de sistemas.
            </p>
          </div>

          <div class="service-card">
            <div class="service-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3>Gestão de Equipes</h3>
            <p>
              Seleção rigorosa e verificação de antecedentes, treinamentos constantes,
              PCMSO e medicina ocupacional, atendimento personalizado.
            </p>
          </div>

          <div class="service-card">
            <div class="service-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3>Manutenção</h3>
            <p>
              Manutenção preventiva e corretiva, pequenos reparos, apoio hidráulico e elétrico,
              conservação de áreas comuns e vistoria operacional.
            </p>
          </div>

          <div class="service-card">
            <div class="service-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Controle Financeiro</h3>
            <p>
              Gestão de custos operacionais, apuração de encargos, controle de folha de pagamento
              e relatórios financeiros detalhados por cliente.
            </p>
          </div>

          <div class="service-card">
            <div class="service-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <h3>Limpeza e Conservação</h3>
            <p>
              Limpeza de áreas comuns, conservação de ambientes, higienização completa
              e apoio operacional com zeladoria preventiva.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    svg { width: 1em; height: 1em; }

    .services { padding: 6rem 2rem; background: var(--surface-card); }

    .services-inner { max-width: 1200px; margin: 0 auto; }

    .services-header {
      text-align: center;
      margin-bottom: var(--space-12);
    }

    .services-title {
      font-size: clamp(1.75rem, 3vw, var(--text-4xl));
      font-weight: var(--fw-extrabold);
      color: var(--text-primary);
      line-height: 1.1; letter-spacing: -0.03em;
      margin-bottom: var(--space-4);
    }

    .services-subtitle {
      font-size: var(--text-lg); color: var(--text-secondary); margin: 0;
    }

    /* Bento grid - not 3 equal columns */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto auto;
      gap: var(--space-5);
    }

    .service-card {
      position: relative;
      padding: var(--space-6);
      background: var(--bg-primary);
      border-radius: var(--radius-2xl);
      border: 1px solid var(--border-subtle);
      display: flex; flex-direction: column;
      gap: var(--space-3);
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .service-card::before {
      content: '';
      position: absolute; bottom: 0; left: 0;
      width: 0; height: 3px;
      background: var(--primary-color);
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .service-card:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }
    .service-card:hover::before { width: 100%; }

    /* Featured card spans 2 rows */
    .service-card-featured {
      grid-row: span 2;
      background: linear-gradient(160deg, var(--bg-primary) 0%, color-mix(in srgb, var(--primary-color) 4%, var(--bg-primary)) 100%);
      border-color: color-mix(in srgb, var(--primary-color) 20%, var(--border-subtle));
    }
    .service-card-featured h3 { font-size: var(--text-xl); }
    .service-card-featured p { font-size: var(--text-base); line-height: 1.8; }

    .service-tag {
      display: inline-block;
      align-self: flex-start;
      padding: 0.25rem 0.75rem;
      background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      color: var(--primary-color);
      font-size: var(--text-xs);
      font-weight: var(--fw-semibold);
      border-radius: var(--radius-full);
      margin-top: auto;
    }

    .service-icon {
      font-size: 1.75rem; color: var(--primary-color); line-height: 1;
    }

    .service-card h3 {
      font-size: var(--text-lg); font-weight: var(--fw-bold);
      color: var(--text-primary); margin: 0;
    }

    .service-card p {
      font-size: var(--text-sm); color: var(--text-secondary);
      line-height: 1.7; margin: 0;
    }

    @media (max-width: 900px) {
      .services-grid { grid-template-columns: repeat(2, 1fr); }
      .service-card-featured { grid-row: span 1; }
    }

    @media (max-width: 600px) {
      .services { padding: 4rem 1.5rem; }
      .services-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class LandingServicesComponent {}
