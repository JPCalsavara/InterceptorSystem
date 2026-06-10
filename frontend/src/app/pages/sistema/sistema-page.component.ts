import { Component, OnInit, Inject, PLATFORM_ID, signal, effect, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LandingHeaderComponent } from '../landing/components/landing-header.component';
import { LandingFooterComponent } from '../landing/components/landing-footer.component';

@Component({
  selector: 'app-sistema-page',
  standalone: true,
  imports: [RouterLink, LandingHeaderComponent, LandingFooterComponent],
  template: `
    <app-landing-header
      [isDarkMode]="isDarkMode()"
      [isMobileMenuOpen]="isMobileMenuOpen()"
      [isHeaderVisible]="isHeaderVisible()"
      (menuToggle)="toggleMobileMenu()"
      (themeToggle)="toggleTheme()"
    />

    <main class="sys-landing">
      <!-- System Hero -->
      <div class="sys-hero reveal-section">
        <div class="sys-container">
          <div class="sys-hero-content">
            <div class="sys-badge">
              <span class="badge-dot"></span>
              Plataforma Digital Exclusiva
            </div>
            <h1 class="sys-title">
              Gestão inteligente.<br/>
              <span class="text-gradient">Controle absoluto.</span>
            </h1>
            <p class="sys-lead">
              O InterceptorSystem é o núcleo tecnológico da nossa operação. Desenvolvido para centralizar 
              escalas, processar contratos complexos e automatizar folhas de pagamento com precisão absoluta.
            </p>
            <div class="sys-actions">
              <a routerLink="/cadastro" class="btn-sys-primary">Experimentar Sistema</a>
            </div>
          </div>
          
          <div class="sys-hero-visual">
            <div class="visual-wrapper">
              <img src="/landing-dashboard.png" alt="Dashboard do InterceptorSystem" class="sys-img" loading="lazy" />
              <!-- Floating elements to make it dynamic -->
              <div class="float-card fc-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--success-color, #4caf50)" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Escala validada</span>
              </div>
              <div class="float-card fc-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cálculo de DSR: R$ 840,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Problem Statement (O Caos Atual) -->
      <div class="sys-problem reveal-section">
        <div class="sys-container">
          <div class="problem-grid">
            
            <div class="problem-visual">
              <div class="chaos-wrapper">
                <!-- Simulated Spreadsheet -->
                <div class="chaos-window excel-window">
                  <div class="window-header">
                    <span class="dots"><i></i><i></i><i></i></span>
                    <span class="title">Escala_Portaria_vFinal_v3_REAL.xlsx</span>
                  </div>
                  <div class="excel-grid">
                    <div class="cell header">Nome</div><div class="cell header">Dia 15</div><div class="cell header">Dia 16</div>
                    <div class="cell">Carlos M.</div><div class="cell error">Falta!</div><div class="cell">12x36</div>
                    <div class="cell">João P.</div><div class="cell">12x36</div><div class="cell warning">Erro HT</div>
                    <div class="cell">Roberto</div><div class="cell">?</div><div class="cell">Folga</div>
                  </div>
                </div>

                <!-- Simulated WhatsApp Message -->
                <div class="chaos-message wpp-msg-1">
                  <span class="sender">Supervisor Marcos</span>
                  <p>O Carlos não apareceu no Posto Central. Quem cobre? 🚨</p>
                </div>

                <!-- Simulated WhatsApp Message 2 -->
                <div class="chaos-message wpp-msg-2">
                  <span class="sender">RH</span>
                  <p>Alguém calculou o DSR do João desse mês? A planilha corrompeu.</p>
                </div>

                <!-- Simulated Error Notification -->
                <div class="chaos-alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Processo trabalhista: Inconsistência no Adicional Noturno.
                </div>
              </div>
            </div>

            <div class="problem-text">
              <div class="sys-badge error-badge">O Problema</div>
              <h2>O mercado está refém do caos das planilhas.</h2>
              <p>
                Enquanto o setor de facilities tenta operar escalas complexas usando arquivos soltos, mensagens perdidas no WhatsApp e cálculos manuais de folha, o resultado é sempre o mesmo: 
                <strong>erros operacionais, horas extras não planejadas e processos trabalhistas.</strong>
              </p>
              <p>
                Os sistemas "comuns" de gestão ou são genéricos demais (ERPs rígidos) ou simples demais para entender as regras da CLT para portarias 12x36 e 5x2.
              </p>
              <div class="problem-checklist">
                <div class="chk-item"><span class="x-mark">✗</span> Retrabalho infinito no fechamento da folha.</div>
                <div class="chk-item"><span class="x-mark">✗</span> Furos de escala cobertos de última hora.</div>
                <div class="chk-item"><span class="x-mark">✗</span> Zero previsibilidade da margem de lucro por contrato.</div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Funcionalidades (Bento Grid) -->
      <div class="sys-features reveal-section" id="funcionalidades">
        <div class="sys-container">
          <div class="sys-section-header">
            <div class="sys-badge task-badge">A Solução</div>
            <h2>Nossas Tarefas Automatizadas</h2>
            <p>O que o sistema faz por você, eliminando o trabalho manual e os erros humanos.</p>
          </div>

          <div class="bento-grid">
            <!-- Feature 1: Large (Span 2) -->
            <div class="bento-card bg-large">
              <div class="bc-content">
                <div class="bc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3>Escalas e Substituições Inteligentes</h3>
                <p>
                  O motor operacional aloca os funcionários cruzando as disponibilidades do efetivo com as regras rígidas do sindicato (jornadas 12x36, 5x2, 6x1). Em caso de faltas emergenciais, o sistema sugere instantaneamente o melhor reserva disponível, prevenindo furos nos postos e mitigando o risco de pagar horas extras indevidas a quem já estourou a jornada no mês.
                </p>
              </div>
            </div>

            <!-- Feature 2: Medium (Span 1) -->
            <div class="bento-card">
              <div class="bc-content">
                <div class="bc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3>Contratos Dinâmicos</h3>
                <p>
                  Parâmetros financeiros blindados. Quando o piso do sindicato muda, o sistema recalcula os encargos por posto de serviço em tempo real, permitindo reajustes e proteção das suas margens de lucro.
                </p>
              </div>
            </div>

            <!-- Feature 3: Medium (Span 1) -->
            <div class="bento-card">
              <div class="bc-content">
                <div class="bc-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V4.242c0-.754-.727-1.294-1.453-1.096A60.114 60.114 0 002.25 5.25v13.5zm15.978-8.15c.63-.111 1.265-.207 1.906-.29.58-.075 1.054.453 1.054 1.04v5.04c0 .587-.474 1.115-1.054 1.04a62.06 62.06 0 00-1.906-.29V10.6z" />
                  </svg>
                </div>
                <h3>Motor de Pagamentos</h3>
                <p>
                  Total conformidade CLT. O sistema consolida as escalas e aplica descontos, gerando rubricas exatas de Adicional Noturno (Art. 73) e DSR. A folha nasce pronta para exportação fiscal.
                </p>
              </div>
            </div>

            <!-- Feature 4: Large (Span 2) -->
            <div class="bento-card bg-large-alt">
              <div class="bc-content">
                <div class="bc-icon" style="color: #4caf50; background: color-mix(in srgb, #4caf50 10%, transparent);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <h3>Integração e Logística via WhatsApp</h3>
                <p>
                  Comunicação com zero atrito operacional. O Interceptor Bot se conecta aos celulares dos supervisores e porteiros de forma passiva. Permite notificar reservas sobre novos turnos, validar a presença com geolocalização e enviar relatórios ou avisos diretamente no canal que a sua equipe já sabe usar, tudo arquivado com log de auditoria no sistema.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Simulator (Como ele funciona) -->
      <div class="sys-simulator reveal-section" id="simulador">
        <div class="sys-container">
          <div class="sys-section-header center">
            <div class="sys-badge action-badge">A Ação em Tempo Real</div>
            <h2>Veja o Sistema em Ação</h2>
            <p>Simule a experiência de gerenciar uma operação de facilities no painel do Interceptor.</p>
          </div>

          <div class="simulator-layout">
            <!-- Steps Navigation -->
            <div class="sim-sidebar">
              <button class="sim-step-btn" [class.active]="activeSimulatorStep() === 1" (click)="setSimulatorStep(1)">
                <span class="sim-step-num">1</span>
                <div class="sim-step-info">
                  <h4>Parametrização de Contrato</h4>
                  <p>Cadastro do cliente e definição de sindicato.</p>
                </div>
              </button>
              <button class="sim-step-btn" [class.active]="activeSimulatorStep() === 2" (click)="setSimulatorStep(2)">
                <span class="sim-step-num">2</span>
                <div class="sim-step-info">
                  <h4>Gestão de Faltas</h4>
                  <p>Detecção de furo na escala e acionamento da reserva.</p>
                </div>
              </button>
              <button class="sim-step-btn" [class.active]="activeSimulatorStep() === 3" (click)="setSimulatorStep(3)">
                <span class="sim-step-num">3</span>
                <div class="sim-step-info">
                  <h4>Folha de Pagamento</h4>
                  <p>Cálculo instantâneo de horas extras e descontos.</p>
                </div>
              </button>
            </div>

            <!-- Simulator Mock Window -->
            <div class="sim-window">
              <div class="window-header">
                <span class="dots"><i></i><i></i><i></i></span>
                <span class="title">app.interceptorsystem.com/dashboard</span>
              </div>
              
              <div class="window-body">
                @if (activeSimulatorStep() === 1) {
                  <!-- MOCK STEP 1: Contrato -->
                  <div class="mock-ui fade-in">
                    <div class="mock-title">Novo Contrato: Condomínio Villa Real</div>
                    <div class="mock-grid">
                      <div class="mock-field"><label>Sindicato Base</label><div class="mock-input">SINDIPORT - SP</div></div>
                      <div class="mock-field"><label>Efetivo Necessário</label><div class="mock-input">4 Porteiros (12x36)</div></div>
                      <div class="mock-field"><label>Piso Salarial</label><div class="mock-input">R$ 1.850,00</div></div>
                      <div class="mock-field"><label>Valor Faturado/Mês</label><div class="mock-input highlight">R$ 22.000,00</div></div>
                    </div>
                    <div class="mock-footer">
                      <button class="mock-btn">Salvar Contrato</button>
                    </div>
                  </div>
                }
                @if (activeSimulatorStep() === 2) {
                  <!-- MOCK STEP 2: Falta -->
                  <div class="mock-ui fade-in">
                    <div class="mock-title">Escala Operacional - Dia 15</div>
                    <div class="mock-list">
                      <div class="mock-item">
                          <span>Posto 1: Carlos M.</span>
                          <span class="mock-badge success">Presente na base</span>
                      </div>
                      <div class="mock-item error-row">
                          <span>Posto 2: João P.</span>
                          <span class="mock-badge danger">Falta Injustificada</span>
                      </div>
                      <div class="mock-action-box">
                          <p>O Posto 2 do Condomínio Villa Real está descoberto!</p>
                          <button class="mock-btn warning">Acionar Reserva (Roberto - Folga)</button>
                      </div>
                    </div>
                  </div>
                }
                @if (activeSimulatorStep() === 3) {
                  <!-- MOCK STEP 3: Folha -->
                  <div class="mock-ui fade-in">
                    <div class="mock-title">Fechamento de Folha - Competência Atual</div>
                    <div class="table-responsive">
                      <table class="mock-table">
                        <thead><tr><th>Funcionário</th><th>H. Normais</th><th>Adic. Noturno</th><th>Descontos</th><th>Líquido</th></tr></thead>
                        <tbody>
                          <tr><td>Carlos M.</td><td>180h</td><td>+ R$ 240,00</td><td>-</td><td>R$ 2.090,00</td></tr>
                          <tr><td>João P.</td><td>168h</td><td>+ R$ 180,00</td><td class="text-danger">- R$ 123,00 (Falta)</td><td>R$ 1.907,00</td></tr>
                          <tr><td>Roberto (Reserva)</td><td>192h</td><td>+ R$ 260,00</td><td>-</td><td class="text-success">R$ 2.340,00 (+ HE)</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="mock-footer">
                        <button class="mock-btn outline">Exportar para Contabilidade (PDF)</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estrutura / Módulos -->
      <div class="sys-structure reveal-section" id="estrutura">
        <div class="sys-container">
          <div class="struct-grid">
            <div class="struct-text">
              <h2>Estrutura Multi-Tenant</h2>
              <p>
                O InterceptorSystem foi construído com arquitetura avançada de software.
                Seus dados são isolados com segurança em nível de banco de dados.
              </p>
              <ul class="struct-list">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Hospedagem 100% Cloud com AWS
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Design Responsivo (Acesse do celular ou PC)
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Backups diários e criptografia AES-256
                </li>
              </ul>
            </div>
            <div class="struct-cards">
              <div class="s-card">Operacional</div>
              <div class="s-card">Financeiro</div>
              <div class="s-card">RH / Pessoal</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Planos -->
      <div class="sys-plans reveal-section" id="planos">
        <div class="sys-container">
          <div class="sys-section-header center">
            <h2>Planos de Assinatura</h2>
            <p>Escolha o formato ideal para o tamanho da sua operação e escale sem fricção.</p>
          </div>

          <div class="plans-grid">
            <!-- Plano 1 -->
            <div class="plan-card">
              <div class="plan-name">Essencial</div>
              <div class="plan-price">R$ 299<span>/mês</span></div>
              <p class="plan-desc">Ideal para pequenas empresas gerindo até 3 condomínios.</p>
              <ul class="plan-features">
                <li>Até 15 funcionários ativos</li>
                <li>Gestão de escalas básicas</li>
                <li>Relatórios simplificados</li>
              </ul>
              <a routerLink="/cadastro" class="btn-plan-outline">Assinar Essencial</a>
            </div>

            <!-- Plano 2 -->
            <div class="plan-card plan-featured">
              <div class="plan-badge">Mais escolhido</div>
              <div class="plan-name">Profissional</div>
              <div class="plan-price">R$ 599<span>/mês</span></div>
              <p class="plan-desc">A solução completa para empresas em expansão.</p>
              <ul class="plan-features">
                <li>Até 50 funcionários ativos</li>
                <li>Motor de folha de pagamento CLT</li>
                <li>Gestão de contratos e reajustes</li>
                <li>Dashboard financeiro avançado</li>
              </ul>
              <a routerLink="/cadastro" class="btn-plan-solid">Assinar Profissional</a>
            </div>

            <!-- Plano 3 -->
            <div class="plan-card">
              <div class="plan-name">Enterprise</div>
              <div class="plan-price">Sob consulta</div>
              <p class="plan-desc">Para grandes operações que exigem customização.</p>
              <ul class="plan-features">
                <li>Funcionários ilimitados</li>
                <li>Treinamento in-company</li>
                <li>API de integração</li>
                <li>SLA de suporte dedicado</li>
              </ul>
              <a routerLink="/#contato" class="btn-plan-outline">Falar com vendas</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Valores -->
      <div class="sys-values reveal-section">
        <div class="sys-container">
          <div class="values-inner">
            <div class="value-text">
              <div class="sys-badge result-badge">Os Resultados</div>
              <h2>Resultados Esperados e Gerados</h2>
              <p>Reduza passivos trabalhistas com cálculos exatos. Elimine o retrabalho de planilhas. Tenha a previsibilidade financeira que sua empresa precisa para crescer com segurança.</p>
            </div>
            <div class="value-stats">
              <div class="v-stat">
                <h4>-40%</h4>
                <span>Tempo gasto com fechamento de folha</span>
              </div>
              <div class="v-stat">
                <h4>100%</h4>
                <span>Auditoria sobre faltas e substituições</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <app-landing-footer />
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family-base);
    }

    svg { width: 1em; height: 1em; }

    main {
      padding-top: 72px; /* Header height */
    }

    /* Scroll reveal animations */
    .reveal-section {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: opacity, transform;
    }

    .reveal-section.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    @media (prefers-reduced-motion: reduce) {
      .reveal-section {
        opacity: 1;
        transform: none;
        transition: none;
      }
    }

    .sys-landing {
      background: var(--bg-primary);
      position: relative;
    }

    .sys-container {
      max-width: 1200px; margin: 0 auto;
      padding: 0 2rem;
    }

    /* Typography Utilities */
    .sys-section-header { margin-bottom: var(--space-8); max-width: 600px; }
    .sys-section-header.center { margin: 0 auto var(--space-10); text-align: center; }
    .sys-section-header h2 {
      font-size: clamp(2rem, 3vw, var(--text-3xl));
      font-weight: var(--fw-extrabold); color: var(--text-primary);
      letter-spacing: -0.03em; margin-bottom: var(--space-3); line-height: 1.1;
    }
    .sys-section-header p {
      font-size: var(--text-lg); color: var(--text-secondary); line-height: 1.6; margin: 0;
    }

    /* ---------------- HERO ---------------- */
    .sys-hero {
      padding: 6rem 0 6rem;
      background: radial-gradient(circle at top right, color-mix(in srgb, var(--primary-color) 8%, transparent), transparent 50%),
                  radial-gradient(circle at bottom left, color-mix(in srgb, var(--blue-700) 5%, transparent), transparent 50%);
    }

    .sys-hero .sys-container {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 4rem; align-items: center;
    }

    .sys-badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.35rem 0.875rem;
      background: var(--surface-card); border: 1px solid var(--border-strong);
      border-radius: var(--radius-full); font-size: var(--text-xs);
      font-weight: var(--fw-bold); color: var(--text-primary);
      text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: var(--space-6);
    }
    .badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--primary-color);
      box-shadow: 0 0 8px var(--primary-color);
    }

    .sys-title {
      font-size: clamp(2.5rem, 4vw, 4rem); font-weight: var(--fw-extrabold);
      color: var(--text-primary); line-height: 1.05;
      letter-spacing: -0.04em; margin-bottom: var(--space-4);
    }
    .text-gradient {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--blue-600) 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .sys-lead {
      font-size: var(--text-lg); color: var(--text-secondary);
      line-height: 1.7; margin-bottom: var(--space-8); max-width: 500px;
    }

    .btn-sys-primary {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 1rem 2rem; background: var(--text-primary); color: var(--bg-primary);
      font-weight: var(--fw-bold); font-size: var(--text-base);
      border-radius: var(--radius-lg); text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-sys-primary:hover {
      transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      background: var(--primary-color); color: white;
    }

    .sys-hero-visual { position: relative; perspective: 1000px; }
    .visual-wrapper {
      position: relative; border-radius: var(--radius-2xl);
      overflow: visible;
      transform: rotateY(-5deg) rotateX(2deg);
      box-shadow: 20px 20px 60px rgba(0,0,0,0.1);
      transition: transform 0.5s ease;
    }
    .visual-wrapper:hover { transform: rotateY(0) rotateX(0); }
    .sys-img { width: 100%; height: auto; border-radius: var(--radius-xl); border: 1px solid var(--border-strong); display: block; }
    
    .float-card {
      position: absolute; display: flex; align-items: center; gap: 0.5rem;
      background: var(--surface-card); border: 1px solid var(--border-subtle);
      padding: 0.75rem 1.25rem; border-radius: var(--radius-lg);
      font-size: var(--text-sm); font-weight: var(--fw-semibold); color: var(--text-primary);
      box-shadow: var(--shadow-lg); backdrop-filter: blur(10px);
    }
    .fc-1 { top: 20%; right: -2rem; animation: float 4s ease-in-out infinite; }
    .fc-2 { bottom: 15%; left: -2rem; animation: float 5s ease-in-out infinite 1s; }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* ---------------- PROBLEM STATEMENT ---------------- */
    .sys-problem {
      padding: 6rem 0;
      background: var(--bg-primary);
      position: relative;
    }
    
    .sys-problem::before {
      content: ''; position: absolute;
      top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-subtle), transparent);
    }

    .problem-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .problem-text h2 {
      font-size: clamp(2rem, 3vw, 2.75rem); font-weight: var(--fw-extrabold);
      color: var(--text-primary); margin-bottom: var(--space-4); letter-spacing: -0.03em;
      line-height: 1.1;
    }
    .problem-text p {
      font-size: var(--text-lg); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-4);
    }
    .problem-text strong {
      color: var(--text-primary);
    }
    .error-badge {
      background: color-mix(in srgb, var(--danger-color, #f44336) 15%, transparent);
      color: var(--danger-color, #f44336);
      border-color: color-mix(in srgb, var(--danger-color, #f44336) 30%, transparent);
    }
    
    .problem-checklist {
      margin-top: var(--space-6);
      display: flex; flex-direction: column; gap: var(--space-3);
    }
    .chk-item {
      display: flex; align-items: flex-start; gap: var(--space-3);
      font-size: var(--text-base); color: var(--text-secondary);
      background: var(--surface-card); padding: 1rem; border-radius: var(--radius-lg);
      border: 1px solid var(--border-subtle);
    }
    .x-mark {
      color: var(--danger-color, #f44336); font-weight: bold;
    }

    .problem-visual {
      position: relative;
      perspective: 1000px;
    }
    .chaos-wrapper {
      position: relative;
      height: 450px;
      width: 100%;
      background: radial-gradient(circle at center, color-mix(in srgb, var(--danger-color, #f44336) 5%, transparent) 0%, transparent 60%);
    }

    /* Chaos UI Elements */
    .chaos-window {
      position: absolute;
      background: var(--surface-card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      overflow: hidden;
      backdrop-filter: blur(10px);
    }
    .window-header {
      background: var(--bg-primary); padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex; align-items: center; gap: 1rem;
    }
    .window-header .dots { display: flex; gap: 6px; }
    .window-header .dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--border-strong); }
    .window-header .title { font-size: 0.75rem; color: var(--text-secondary); font-family: monospace; }

    .excel-window {
      top: 10%; left: 0; width: 320px;
      transform: rotate(-3deg);
      animation: float 6s ease-in-out infinite;
    }
    .excel-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      font-size: 0.75rem; color: var(--text-primary);
    }
    .excel-grid .cell {
      padding: 0.5rem; border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);
    }
    .excel-grid .header { background: color-mix(in srgb, var(--primary-color) 10%, transparent); font-weight: bold; }
    .excel-grid .error { background: color-mix(in srgb, var(--danger-color, #f44336) 20%, transparent); color: var(--danger-color, #f44336); font-weight: bold; }
    .excel-grid .warning { background: color-mix(in srgb, #ff9800 20%, transparent); color: #ff9800; font-weight: bold; }

    .chaos-message {
      position: absolute;
      background: var(--surface-card);
      border-left: 3px solid var(--primary-color);
      padding: 1rem; border-radius: var(--radius-md);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      width: 260px;
    }
    .chaos-message .sender { font-size: 0.7rem; font-weight: bold; color: var(--primary-color); margin-bottom: 4px; display: block; }
    .chaos-message p { font-size: 0.85rem; color: var(--text-primary); margin: 0; line-height: 1.4; }

    .wpp-msg-1 {
      top: 45%; right: 5%;
      border-left-color: #4caf50;
      transform: rotate(2deg);
      animation: float 5s ease-in-out infinite 1s;
    }
    .wpp-msg-1 .sender { color: #4caf50; }

    .wpp-msg-2 {
      bottom: 5%; left: 15%;
      transform: rotate(-1deg);
      animation: float 7s ease-in-out infinite 2s;
    }

    .chaos-alert {
      position: absolute;
      top: 25%; right: -5%;
      background: color-mix(in srgb, var(--danger-color, #f44336) 10%, var(--surface-card));
      border: 1px solid var(--danger-color, #f44336);
      color: var(--text-primary); font-size: 0.85rem; font-weight: bold;
      padding: 0.75rem 1rem; border-radius: var(--radius-md);
      display: flex; align-items: center; gap: 0.5rem;
      box-shadow: 0 10px 30px color-mix(in srgb, var(--danger-color, #f44336) 20%, transparent);
      animation: pulseAlert 2s infinite;
      z-index: 10; width: 280px; line-height: 1.3;
    }
    .chaos-alert svg { color: var(--danger-color, #f44336); width: 24px; height: 24px; flex-shrink: 0; }

    @keyframes pulseAlert {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    /* ---------------- FEATURES BENTO ---------------- */
    .sys-features { padding: 6rem 0; background: var(--surface-card); border-top: 1px solid var(--border-subtle); }
    
    .bento-grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: var(--space-5);
    }

    .bento-card {
      background: var(--bg-primary); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-2xl); padding: var(--space-6);
      display: flex; flex-direction: column; justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .bento-card:hover { border-color: var(--primary-color); transform: translateY(-4px); box-shadow: var(--shadow-md); }
    
    .bg-large { grid-column: span 2; background: linear-gradient(135deg, var(--bg-primary) 0%, color-mix(in srgb, var(--primary-color) 5%, var(--bg-primary)) 100%); }
    .bg-large-alt { grid-column: span 2; background: linear-gradient(135deg, color-mix(in srgb, var(--primary-color) 3%, var(--bg-primary)) 0%, var(--bg-primary) 100%); }
    
    .bc-icon {
      width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      color: var(--primary-color); border-radius: var(--radius-lg);
      font-size: 1.5rem; margin-bottom: var(--space-6);
    }
    .bento-card h3 { font-size: var(--text-xl); font-weight: var(--fw-bold); color: var(--text-primary); margin-bottom: var(--space-2); }
    .bento-card p { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.6; margin: 0; }
    .bg-large h3 { font-size: var(--text-2xl); }

    .task-badge {
      background: color-mix(in srgb, var(--primary-color) 15%, transparent);
      color: var(--primary-color);
      border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
      margin-bottom: var(--space-4);
    }

    /* ---------------- SIMULATOR (ACTION) ---------------- */
    .sys-simulator { padding: 6rem 0; background: var(--bg-primary); border-top: 1px solid var(--border-subtle); }
    
    .action-badge {
      background: color-mix(in srgb, #00bcd4 15%, transparent);
      color: #00bcd4;
      border-color: color-mix(in srgb, #00bcd4 30%, transparent);
      margin-bottom: var(--space-4);
    }

    .simulator-layout {
      display: grid; grid-template-columns: 350px 1fr; gap: 3rem; margin-top: var(--space-8);
    }

    .sim-sidebar { display: flex; flex-direction: column; gap: var(--space-3); }
    
    .sim-step-btn {
      display: flex; align-items: flex-start; gap: var(--space-4);
      padding: 1.25rem; background: var(--surface-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);
      text-align: left; cursor: pointer; transition: all 0.3s ease;
      color: var(--text-primary);
    }
    .sim-step-btn:hover { border-color: color-mix(in srgb, var(--primary-color) 50%, transparent); }
    .sim-step-btn.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 5%, var(--surface-card));
    }
    .sim-step-btn.active .sim-step-num { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    
    .sim-step-num {
      width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; border: 2px solid var(--border-strong);
      font-weight: var(--fw-bold); font-size: 0.9rem; transition: all 0.3s;
    }
    .sim-step-info h4 { font-size: var(--text-base); font-weight: var(--fw-bold); margin-bottom: 0.25rem; }
    .sim-step-info p { font-size: var(--text-sm); color: var(--text-secondary); margin: 0; line-height: 1.4; }

    .sim-window {
      background: var(--surface-card); border: 1px solid var(--border-strong);
      border-radius: var(--radius-xl); overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column;
    }
    .window-header {
      background: color-mix(in srgb, var(--bg-primary) 50%, var(--surface-card));
      padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-subtle);
      display: flex; align-items: center; gap: 1rem;
    }
    .window-header .dots { display: flex; gap: 6px; }
    .window-header .dots i { width: 12px; height: 12px; border-radius: 50%; background: var(--border-strong); }
    .window-header .dots i:nth-child(1) { background: #ff5f56; }
    .window-header .dots i:nth-child(2) { background: #ffbd2e; }
    .window-header .dots i:nth-child(3) { background: #27c93f; }
    .window-header .title { font-size: 0.75rem; color: var(--text-secondary); font-family: monospace; margin-left: auto; margin-right: auto; }

    .window-body { padding: 2rem; min-height: 380px; display: flex; flex-direction: column; }
    
    .fade-in { animation: fadeIn 0.4s ease forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    /* MOCK UI ELEMENTS */
    .mock-title { font-size: 1.25rem; font-weight: var(--fw-bold); color: var(--text-primary); margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem; }
    .mock-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .mock-field label { display: block; font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .mock-input { padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: 0.9rem; color: var(--text-primary); font-family: monospace; }
    .mock-input.highlight { color: #4caf50; border-color: color-mix(in srgb, #4caf50 50%, transparent); background: color-mix(in srgb, #4caf50 5%, transparent); font-weight: bold; }
    
    .mock-btn { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); font-weight: var(--fw-bold); cursor: pointer; transition: background 0.2s; }
    .mock-btn:hover { background: var(--primary-dark); }
    .mock-btn.warning { background: #ff9800; color: #000; }
    .mock-btn.outline { background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color); }
    .mock-footer { margin-top: auto; display: flex; justify-content: flex-end; }

    .mock-list { display: flex; flex-direction: column; gap: 1rem; }
    .mock-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: 0.9rem; }
    .mock-badge { padding: 0.25rem 0.5rem; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
    .mock-badge.success { background: color-mix(in srgb, #4caf50 15%, transparent); color: #4caf50; }
    .mock-badge.danger { background: color-mix(in srgb, #f44336 15%, transparent); color: #f44336; }
    .error-row { border-color: #f44336; background: color-mix(in srgb, #f44336 5%, transparent); }
    .mock-action-box { background: color-mix(in srgb, #ff9800 10%, transparent); border: 1px solid #ff9800; border-radius: var(--radius-md); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; }
    .mock-action-box p { margin: 0; color: var(--text-primary); font-weight: bold; font-size: 0.9rem; }

    .table-responsive { overflow-x: auto; }
    .mock-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .mock-table th { text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--border-strong); color: var(--text-secondary); text-transform: uppercase; font-size: 0.7rem; }
    .mock-table td { padding: 0.75rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-primary); }
    .text-danger { color: #f44336 !important; font-weight: bold; }
    .text-success { color: #4caf50 !important; font-weight: bold; }

    /* ---------------- STRUCTURE ---------------- */
    .sys-structure { padding: 6rem 0; background: var(--bg-primary); }
    .struct-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .struct-text h2 { font-size: clamp(2rem, 3vw, var(--text-3xl)); font-weight: var(--fw-extrabold); color: var(--text-primary); margin-bottom: var(--space-4); letter-spacing: -0.03em;}
    .struct-text p { font-size: var(--text-lg); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-6); }
    
    .struct-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-4); }
    .struct-list li { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-base); font-weight: var(--fw-semibold); color: var(--text-primary); }
    .struct-list svg { color: var(--primary-color); font-size: 1.25rem; }

    .struct-cards { display: flex; flex-direction: column; gap: var(--space-3); }
    .s-card {
      padding: var(--space-5); background: var(--surface-card);
      border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);
      font-size: var(--text-lg); font-weight: var(--fw-bold); color: var(--text-primary);
      box-shadow: var(--shadow-sm); transition: transform 0.2s;
    }
    .s-card:hover { transform: scale(1.02); border-color: var(--primary-color); }

    /* ---------------- PLANS ---------------- */
    .sys-plans { padding: 6rem 0; background: var(--surface-card); }
    .plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); align-items: start; }
    
    .plan-card {
      background: var(--bg-primary); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-2xl); padding: var(--space-8);
      position: relative; display: flex; flex-direction: column;
      transition: transform 0.3s ease;
    }
    .plan-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    
    .plan-featured { border-color: var(--primary-color); box-shadow: 0 8px 30px color-mix(in srgb, var(--primary-color) 15%, transparent); transform: scale(1.02); }
    .plan-featured:hover { transform: scale(1.02) translateY(-4px); }
    
    .plan-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--primary-color); color: white; font-size: var(--text-xs);
      font-weight: var(--fw-bold); padding: 0.25rem 1rem; border-radius: var(--radius-full);
      text-transform: uppercase; letter-spacing: 0.05em;
    }

    .plan-name { font-size: var(--text-xl); font-weight: var(--fw-bold); color: var(--text-primary); margin-bottom: var(--space-2); }
    .plan-price { font-size: var(--text-4xl); font-weight: var(--fw-extrabold); color: var(--text-primary); letter-spacing: -0.04em; margin-bottom: var(--space-2); }
    .plan-price span { font-size: var(--text-base); font-weight: var(--fw-medium); color: var(--text-secondary); }
    
    .plan-desc { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-6); min-height: 40px; }
    
    .plan-features { list-style: none; padding: 0; margin: 0 0 var(--space-8) 0; display: flex; flex-direction: column; gap: var(--space-3); flex-grow: 1; }
    .plan-features li { display: flex; align-items: flex-start; gap: var(--space-2); font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.4; }
    .plan-features li::before {
      content: '✓'; color: var(--primary-color); font-weight: bold; font-size: 1rem;
    }

    .btn-plan-outline, .btn-plan-solid {
      display: block; text-align: center; padding: 0.875rem; border-radius: var(--radius-lg);
      font-weight: var(--fw-bold); font-size: var(--text-sm); text-decoration: none;
      transition: all 0.2s; width: 100%;
    }
    .btn-plan-outline { border: 1px solid var(--border-strong); color: var(--text-primary); background: transparent; }
    .btn-plan-outline:hover { border-color: var(--primary-color); color: var(--primary-color); }
    
    .btn-plan-solid { background: var(--primary-color); color: white; border: 1px solid var(--primary-color); }
    .btn-plan-solid:hover { background: var(--primary-dark); }

    /* ---------------- VALUES / RESULTS ---------------- */
    .sys-values { padding: 4rem 0; background: var(--bg-primary); border-top: 1px solid var(--border-subtle); }
    
    .result-badge {
      background: color-mix(in srgb, #4caf50 15%, transparent);
      color: #4caf50;
      border-color: color-mix(in srgb, #4caf50 30%, transparent);
      margin-bottom: var(--space-4);
    }
    
    .values-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .value-text h2 { font-size: clamp(1.75rem, 2vw, var(--text-2xl)); font-weight: var(--fw-extrabold); color: var(--text-primary); margin-bottom: var(--space-3); }
    .value-text p { font-size: var(--text-base); color: var(--text-secondary); line-height: 1.7; }
    
    .value-stats { display: flex; gap: var(--space-6); }
    .v-stat h4 { font-size: var(--text-4xl); font-weight: var(--fw-extrabold); color: var(--primary-color); margin-bottom: var(--space-1); letter-spacing: -0.05em;}
    .v-stat span { font-size: var(--text-sm); font-weight: var(--fw-medium); color: var(--text-secondary); line-height: 1.4; display: block;}

    /* ---------------- RESPONSIVE ---------------- */
    @media (max-width: 1024px) {
      .sys-hero .sys-container, .struct-grid, .values-inner, .problem-grid { grid-template-columns: 1fr; gap: 3rem; }
      .bento-grid { grid-template-columns: 1fr 1fr; }
      .bg-large, .bg-large-alt { grid-column: span 2; }
      .plans-grid { grid-template-columns: 1fr; max-width: 500px; margin: 0 auto; }
      .plan-featured { transform: none; }
      .plan-featured:hover { transform: translateY(-4px); }
      .problem-visual { display: none; /* Hide complex chaos on tablet/mobile for simplicity */ }
      .simulator-layout { grid-template-columns: 1fr; }
      .sim-sidebar { flex-direction: row; overflow-x: auto; padding-bottom: 1rem; scroll-snap-type: x mandatory; }
      .sim-step-btn { flex: 0 0 300px; scroll-snap-align: start; }
      .mock-grid { grid-template-columns: 1fr; }
      .mock-action-box { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }

    @media (max-width: 600px) {
      .sys-hero { padding: 4rem 0 4rem; }
      .sys-container { padding: 0 1.5rem; }
      .sys-title { font-size: clamp(2.25rem, 8vw, 2.75rem); }
      .visual-wrapper { transform: none; }
      .float-card { display: none; }
      .bento-grid { grid-template-columns: 1fr; }
      .bg-large, .bg-large-alt { grid-column: span 1; }
      .value-stats { flex-direction: column; }
    }
  `]
})
export class SistemaPageComponent implements OnInit {
  isDarkMode = signal(false);
  isMobileMenuOpen = signal(false);
  isHeaderVisible = signal(true);
  activeSimulatorStep = signal<number>(1);
  
  private lastScrollY = 0;
  private scrollThreshold = 100;
  private observer: IntersectionObserver | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  ngOnInit(): void {
    this.initializeTheme();
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
      // Reset scroll position on route load
      window.scrollTo(0, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => {
      const newValue = !v;
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = newValue ? 'hidden' : '';
      }
      return newValue;
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    if (!isPlatformBrowser(this.platformId) || this.isMobileMenuOpen()) return;

    const currentScrollY = window.scrollY;

    if (currentScrollY < this.scrollThreshold) {
      this.isHeaderVisible.set(true);
    } else if (currentScrollY > this.lastScrollY) {
      this.isHeaderVisible.set(false); // Scrolling down
    } else if (currentScrollY < this.lastScrollY) {
      this.isHeaderVisible.set(true); // Scrolling up
    }

    this.lastScrollY = currentScrollY;
  }

  setSimulatorStep(step: number): void {
    this.activeSimulatorStep.set(step);
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    setTimeout(() => {
      document.querySelectorAll('.reveal-section').forEach(section => {
        this.observer?.observe(section);
      });
    }, 100);
  }

  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('theme');
    if (saved) {
      this.isDarkMode.set(saved === 'dark');
      return;
    }
    this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  private applyTheme(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('light-mode', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
}
