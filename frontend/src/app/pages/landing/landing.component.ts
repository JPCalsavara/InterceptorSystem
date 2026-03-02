import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Header -->
      <header class="landing-header">
        <div class="header-container">
          <img [src]="logoSrc()" alt="Interceptor Assessoria Inteligente" class="header-logo" />
          <nav class="header-nav">
            <a href="#sobre" class="nav-link">Sobre</a>
            <a href="#servicos" class="nav-link">Serviços</a>
            <a href="#sistema" class="nav-link hide-mobile">Sistema</a>
            <a href="#numeros" class="nav-link hide-mobile">Números</a>
            <a href="#lideranca" class="nav-link hide-mobile">Liderança</a>
            <!-- Theme Toggle -->
            <button
              class="theme-toggle"
              (click)="toggleTheme()"
              [title]="isDarkMode() ? 'Ativar modo claro' : 'Ativar modo escuro'"
            >
              @if (isDarkMode()) {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clip-rule="evenodd"
                  />
                </svg>
              } @else {
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              }
            </button>

            <a routerLink="/login" class="btn-outline">Entrar</a>
            <a routerLink="/cadastro" class="btn-primary">Criar conta</a>
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-badge">
            Segurança Patrimonial · Porto Feliz · Tietê · Tatuí · Boituva · Salto
          </div>
          <h1 class="hero-title">
            Assessoria inteligente em<br />
            <span class="hero-highlight">segurança condominial</span>
          </h1>
          <p class="hero-description">
            A <strong>Interceptor Assessoria Inteligente</strong> oferece segurança terceirizada,
            consultoria especializada e gerenciamento completo — segurança e administrativo — para
            condomínios nas cidades de Porto Feliz, Tietê, Tatuí, Boituva e Salto.
          </p>
          <div class="hero-actions">
            <a href="#servicos" class="btn-hero-primary">Conheça nossos serviços</a>
            <a href="#sobre" class="btn-hero-secondary">Sobre a empresa</a>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="stats" id="numeros">
        <div class="stats-inner">
          <div class="stats-header">
            <div class="section-badge center light">Nossa Empresa em Números</div>
            <h2 class="stats-title">Resultados que falam por si</h2>
          </div>
          <div class="stats-cards">
            <div class="stat-card">
              <span class="stat-number">15+</span>
              <span class="stat-label">Condomínios Atendidos</span>
              <span class="stat-detail">Região metropolitana de Sorocaba</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">120+</span>
              <span class="stat-label">Funcionários Gerenciados</span>
              <span class="stat-detail">Vigilantes, porteiros e supervisores</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">R$ 1M+</span>
              <span class="stat-label">Folha de Pagamento</span>
              <span class="stat-detail">Gerenciamento mensal de custos</span>
            </div>
            <div class="stat-card">
              <span class="stat-number">10+</span>
              <span class="stat-label">Anos de Experiência</span>
              <span class="stat-detail">No mercado de segurança patrimonial</span>
            </div>
          </div>
        </div>
      </section>

      <!-- About -->
      <section class="about" id="sobre">
        <div class="about-inner">
          <div class="about-content">
            <div class="section-badge">Sobre Nós</div>
            <h2 class="section-title">Interceptor Assessoria Inteligente</h2>
            <p class="about-text">
              Somos uma empresa especializada em
              <strong>segurança patrimonial terceirizada</strong>, <strong>consultoria</strong> e
              <strong>gerenciamento operacional e administrativo</strong> para condomínios.
              Atualmente atendemos <strong>7 condomínios</strong> nas cidades de
              <strong>Porto Feliz, Tietê, Tatuí, Boituva e Salto</strong>.
            </p>
            <p class="about-text">
              Com mais de uma década de experiência no setor, desenvolvemos soluções sob medida para
              cada condomínio — desde a alocação de profissionais de segurança até a gestão completa
              da operação administrativa. Nossa metodologia garante proteção eficiente,
              transparência total e tranquilidade para síndicos e moradores.
            </p>
          </div>
          <div class="about-values">
            <div class="value-item">
              <div class="value-icon">🛡️</div>
              <div class="value-content">
                <h4>Segurança Terceirizada</h4>
                <p>
                  Profissionais qualificados e treinados, escalas cobertas e supervisão contínua
                </p>
              </div>
            </div>
            <div class="value-item">
              <div class="value-icon">🎯</div>
              <div class="value-content">
                <h4>Consultoria Especializada</h4>
                <p>Análise e otimização da operação de segurança com foco em resultados reais</p>
              </div>
            </div>
            <div class="value-item">
              <div class="value-icon">📊</div>
              <div class="value-content">
                <h4>Gerenciamento Completo</h4>
                <p>
                  Administração de contratos, folha de pagamento e controle operacional integrado
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services -->
      <section class="features" id="servicos">
        <div class="features-inner">
          <div class="section-badge center">Nossos Serviços</div>
          <h2 class="features-title">Soluções completas para sua operação</h2>
          <p class="features-subtitle">
            Da vigilância terceirizada à gestão financeira — tudo que seu condomínio precisa
          </p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">🛡️</div>
              <h3>Vigilância Terceirizada</h3>
              <p>
                Profissionais qualificados e treinados para segurança patrimonial de condomínios.
                Escalas 12x36 e comercial com cobertura completa nas cidades atendidas.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🧭</div>
              <h3>Consultoria Operacional</h3>
              <p>
                Análise de dimensionamento de equipe, otimização de turnos, redução de custos e
                implantação de processos de segurança personalizados.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📋</div>
              <h3>Gerenciamento Administrativo</h3>
              <p>
                Controle de contratos, folha de pagamento, documentação e compliance — tudo
                gerenciado com transparência e precisão.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>Gestão de Equipes</h3>
              <p>
                Seleção, treinamento, supervisão e gestão completa de vigilantes, porteiros e
                equipes de segurança patrimonial.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📍</div>
              <h3>Cobertura Regional</h3>
              <p>
                Presença consolidada em Porto Feliz, Tietê, Tatuí, Boituva e Salto — atendimento
                presencial com resposta rápida a qualquer demanda.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">💰</div>
              <h3>Controle Financeiro</h3>
              <p>
                Gestão de custos operacionais, apuração de encargos, margens contratuais e
                relatórios financeiros detalhados por condomínio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- InterceptorSystem Product -->
      <section class="product" id="sistema">
        <div class="product-inner">
          <div class="product-content">
            <div class="section-badge">Nosso Produto Digital</div>
            <h2 class="section-title">InterceptorSystem</h2>
            <p class="product-lead">
              A plataforma digital desenvolvida pela própria Interceptor para revolucionar a gestão
              de segurança condominial.
            </p>
            <p class="product-text">
              O <strong>InterceptorSystem</strong> centraliza toda a operação: escalas de trabalho,
              contratos com cálculo automático de custos, folha de pagamento com adicionais CLT,
              controle de alocações e um dashboard financeiro em tempo real. Tudo que antes era
              feito em planilhas, agora está integrado em uma única plataforma.
            </p>
            <div class="product-highlights">
              <div class="product-highlight-item">
                <span class="product-highlight-icon">📅</span>
                <div>
                  <strong>Gestão de Escalas</strong>
                  <span>Alocações diárias com calendário, kanban e substituições automáticas</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="product-highlight-icon">📄</span>
                <div>
                  <strong>Contratos Inteligentes</strong>
                  <span>Cálculo automático de impostos, margens e alertas de vencimento</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="product-highlight-icon">💵</span>
                <div>
                  <strong>Folha de Pagamento</strong>
                  <span>Cálculo de salários, adicionais noturnos (CLT Art. 73) e encargos</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="product-highlight-icon">📊</span>
                <div>
                  <strong>Dashboard Financeiro</strong>
                  <span>Custos, margens e indicadores operacionais em tempo real</span>
                </div>
              </div>
            </div>
            <div class="product-actions">
              <a routerLink="/cadastro" class="btn-hero-primary">Começar agora — é gratuito</a>
              <a routerLink="/login" class="btn-hero-secondary">Já tenho uma conta</a>
            </div>
          </div>
          <div class="product-visual">
            <div class="product-badge-visual">
              <div class="pv-icon">⚡</div>
              <div class="pv-title">InterceptorSystem</div>
              <div class="pv-subtitle">Gestão inteligente em uma plataforma</div>
              <div class="pv-stats">
                <div class="pv-stat">
                  <span class="pv-stat-number">120+</span>
                  <span class="pv-stat-label">Funcionários</span>
                </div>
                <div class="pv-stat">
                  <span class="pv-stat-number">15+</span>
                  <span class="pv-stat-label">Condomínios</span>
                </div>
                <div class="pv-stat">
                  <span class="pv-stat-number">R$1M+</span>
                  <span class="pv-stat-label">Folha/mês</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Leadership / About Founder -->
      <section class="leadership" id="lideranca">
        <div class="leadership-inner">
          <div class="leader-info">
            <div class="section-badge">Liderança</div>
            <h2 class="section-title">Luciano Calsavara</h2>
            <p class="leader-role">Fundador & Diretor Operacional</p>
            <p class="leader-bio">
              Com mais de <strong>10 anos de experiência</strong> na gestão de segurança
              patrimonial, Luciano Calsavara fundou a Interceptor Assessoria Inteligente com foco em
              excelência operacional e inovação no atendimento a condomínios.
            </p>
            <p class="leader-bio">
              Sua vivência direta no campo — desde a alocação de vigilantes até a negociação de
              contratos — trouxe a visão de transformar a gestão manual em processos digitais
              eficientes, capazes de escalar without perder a qualidade e o atendimento
              personalizado.
            </p>
            <div class="leader-highlights">
              <div class="highlight-item">
                <span class="highlight-icon">🏆</span>
                <span>+10 anos no setor de segurança</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon">🏘️</span>
                <span>7 condomínios atendidos ativamente</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon">👥</span>
                <span>120+ funcionários sob gestão</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon">📍</span>
                <span>Porto Feliz, Tietê, Tatuí, Boituva e Salto</span>
              </div>
            </div>
          </div>
          <div class="leader-quote-card">
            <div class="quote-mark">"</div>
            <blockquote class="leader-quote">
              Nosso objetivo é oferecer segurança com a mesma eficiência e transparência que
              esperamos de qualquer serviço de excelência. Cada condomínio que atendemos recebe
              atenção personalizada porque entendemos que segurança não é commodity — é confiança.
            </blockquote>
            <div class="quote-author">— Luciano Calsavara</div>
          </div>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="cta-banner">
        <div class="cta-inner">
          <h2>Seu condomínio merece a melhor assessoria</h2>
          <p>
            Entre em contato e descubra como a Interceptor Assessoria Inteligente pode transformar a
            segurança e a gestão do seu condomínio.
          </p>
          <div class="cta-actions">
            <a routerLink="/cadastro" class="btn-cta">Criar conta no InterceptorSystem</a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="footer-inner">
          <div class="footer-left">
            <img [src]="logoSrc()" alt="Interceptor Assessoria Inteligente" class="footer-logo" />
            <p class="footer-company">Interceptor Assessoria Inteligente</p>
          </div>
          <div class="footer-center">
            <p class="footer-location">📍 Porto Feliz · Tietê · Tatuí · Boituva · Salto — SP</p>
          </div>
          <div class="footer-right">
            <p class="footer-text">
              © 2026 Interceptor Assessoria Inteligente. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        --header-height: 72px;
      }

      .landing-page {
        min-height: 100vh;
        background: var(--bg-primary);
        color: var(--text-primary);
      }

      /* Header */
      .landing-header {
        border-bottom: 1px solid var(--border-subtle);
        background: var(--surface-card);
        padding: 0 2rem;
        height: var(--header-height);
        display: flex;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 50;
        backdrop-filter: blur(12px);
      }

      .header-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .header-logo {
        height: 52px;
      }

      .header-nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .nav-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 500;
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          color: var(--primary-color);
          background: rgba(33, 150, 243, 0.08);
        }
      }

      .theme-toggle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: var(--theme-toggle-bg);
        color: var(--theme-toggle-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--theme-toggle-hover-bg);
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }

      .btn-outline {
        padding: 0.5rem 1.25rem;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-color);
          color: white;
        }
      }

      .btn-primary {
        padding: 0.5rem 1.25rem;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.95rem;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-dark);
        }
      }

      /* Hero */
      .hero {
        min-height: calc(100vh - var(--header-height));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;
        background: linear-gradient(180deg, var(--surface-card) 0%, var(--bg-primary) 100%);
      }

      .hero-inner {
        max-width: 780px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
      }

      .hero-badge {
        display: inline-block;
        background: rgba(33, 150, 243, 0.12);
        color: var(--primary-color);
        border: 1px solid rgba(33, 150, 243, 0.3);
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .hero-title {
        font-size: 3.25rem;
        font-weight: 800;
        line-height: 1.15;
        color: var(--text-primary);
      }

      .hero-highlight {
        color: var(--primary-color);
      }

      .hero-description {
        font-size: 1.1rem;
        color: var(--text-secondary);
        line-height: 1.7;
        max-width: 640px;

        strong {
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn-hero-primary {
        padding: 0.875rem 2rem;
        background: var(--primary-color);
        color: white;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.2s;

        &:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
        }
      }

      .btn-hero-secondary {
        padding: 0.875rem 2rem;
        border: 2px solid var(--border-strong);
        color: var(--text-primary);
        border-radius: 10px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1rem;
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      }

      /* Stats */
      .stats {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        background: linear-gradient(135deg, #1565c0 0%, #1976d2 40%, #42a5f5 100%);
      }

      .stats-inner {
        max-width: 1100px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
      }

      .stats-header {
        text-align: center;
      }

      .stats-title {
        font-size: 2rem;
        font-weight: 800;
        color: white;
        margin-top: 0.5rem;
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 2rem;
        width: 100%;
      }

      .stat-card {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        padding: 2.5rem 1.5rem;
        backdrop-filter: blur(4px);
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateY(-4px);
        }
      }

      .stat-number {
        font-size: 3rem;
        font-weight: 900;
        color: white;
        line-height: 1.1;
        letter-spacing: -0.02em;
      }

      .stat-label {
        font-size: 0.95rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.95);
        margin-top: 0.35rem;
      }

      .stat-detail {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.65);
        margin-top: 0.1rem;
      }

      /* Section badges & titles (shared) */
      .section-badge {
        display: inline-block;
        background: rgba(33, 150, 243, 0.12);
        color: var(--primary-color);
        border: 1px solid rgba(33, 150, 243, 0.25);
        padding: 0.35rem 0.9rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 0.75rem;

        &.center {
          display: block;
          width: fit-content;
          margin: 0 auto 0.75rem;
        }

        &.light {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        }
      }

      .section-title {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      /* About */
      .about {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        background: var(--surface-card);
      }

      .about-inner {
        max-width: 1100px;
        width: 100%;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: center;
      }

      .about-text {
        font-size: 1rem;
        color: var(--text-secondary);
        line-height: 1.75;
        margin-bottom: 1rem;

        strong {
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .about-values {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .value-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.25rem;
        background: var(--bg-primary);
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
          transform: translateX(4px);
        }
      }

      .value-icon {
        font-size: 1.75rem;
        line-height: 1;
        flex-shrink: 0;
        margin-top: 0.1rem;
      }

      .value-content h4 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.3rem;
      }

      .value-content p {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      /* Features */
      .features {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        background: var(--bg-primary);
      }

      .features-inner {
        max-width: 1100px;
        width: 100%;
        margin: 0 auto;
      }

      .features-title {
        font-size: 2rem;
        font-weight: 800;
        text-align: center;
        color: var(--text-primary);
        margin-bottom: 0.75rem;
      }

      .features-subtitle {
        text-align: center;
        color: var(--text-secondary);
        font-size: 1rem;
        margin-bottom: 3rem;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .feature-card {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: 16px;
        padding: 2rem;
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 20px rgba(33, 150, 243, 0.1);
          transform: translateY(-2px);
        }
      }

      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        line-height: 1;
      }

      .feature-card h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.6rem;
      }

      .feature-card p {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.6;
      }

      /* Product (InterceptorSystem) */
      .product {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        background: var(--surface-card);
      }

      .product-inner {
        max-width: 1100px;
        width: 100%;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 4rem;
        align-items: center;
      }

      .product-lead {
        font-size: 1.15rem;
        color: var(--primary-color);
        font-weight: 600;
        line-height: 1.5;
        margin-bottom: 1rem;
      }

      .product-text {
        font-size: 1rem;
        color: var(--text-secondary);
        line-height: 1.75;
        margin-bottom: 1.5rem;

        strong {
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .product-highlights {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .product-highlight-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem 1.25rem;
        background: var(--bg-primary);
        border-radius: 10px;
        border: 1px solid var(--border-subtle);

        div {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        strong {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        span {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
      }

      .product-highlight-icon {
        font-size: 1.5rem;
        line-height: 1;
        flex-shrink: 0;
        margin-top: 0.1rem;
      }

      .product-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .product-visual {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .product-badge-visual {
        background: linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%);
        border-radius: 24px;
        padding: 3rem 2.5rem;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 12px 40px rgba(21, 101, 192, 0.35);
        width: 100%;
        max-width: 340px;
      }

      .pv-icon {
        font-size: 3.5rem;
        line-height: 1;
      }

      .pv-title {
        font-size: 1.5rem;
        font-weight: 800;
        color: white;
        letter-spacing: -0.01em;
      }

      .pv-subtitle {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.75);
        line-height: 1.4;
      }

      .pv-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-top: 0.5rem;
        width: 100%;
      }

      .pv-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.2rem;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 0.75rem 0.5rem;
      }

      .pv-stat-number {
        font-size: 1.1rem;
        font-weight: 800;
        color: white;
        white-space: nowrap;
      }

      .pv-stat-label {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.7);
        text-align: center;
      }

      /* Leadership */
      .leadership {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        background: var(--bg-primary);
      }

      .leadership-inner {
        max-width: 1100px;
        width: 100%;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        align-items: center;
      }

      .leader-role {
        font-size: 1.05rem;
        color: var(--primary-color);
        font-weight: 600;
        margin-bottom: 1.25rem;
      }

      .leader-bio {
        font-size: 1rem;
        color: var(--text-secondary);
        line-height: 1.75;
        margin-bottom: 1rem;

        strong {
          color: var(--text-primary);
          font-weight: 600;
        }
      }

      .leader-highlights {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      .highlight-item {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
        padding: 0.5rem 0.75rem;
        background: var(--surface-card);
        border-radius: 8px;
        border: 1px solid var(--border-subtle);
      }

      .highlight-icon {
        font-size: 1.1rem;
        line-height: 1;
      }

      .leader-quote-card {
        background: linear-gradient(
          135deg,
          rgba(33, 150, 243, 0.08) 0%,
          rgba(33, 150, 243, 0.03) 100%
        );
        border: 1px solid rgba(33, 150, 243, 0.2);
        border-radius: 20px;
        padding: 2.5rem;
        position: relative;
      }

      .quote-mark {
        font-size: 5rem;
        line-height: 1;
        color: var(--primary-color);
        opacity: 0.3;
        font-family: Georgia, serif;
        position: absolute;
        top: 0.5rem;
        left: 1.5rem;
      }

      .leader-quote {
        font-size: 1.1rem;
        color: var(--text-primary);
        line-height: 1.8;
        font-style: italic;
        margin: 0;
        padding-top: 1.5rem;
        position: relative;
        z-index: 1;
      }

      .quote-author {
        margin-top: 1.25rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--primary-color);
      }

      /* CTA Banner */
      .cta-banner {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5rem 2rem;
        background: linear-gradient(135deg, #1565c0 0%, #1976d2 40%, #42a5f5 100%);
      }

      .cta-inner {
        max-width: 650px;
        margin: 0 auto;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
      }

      .cta-inner h2 {
        font-size: 2.25rem;
        font-weight: 800;
        color: white;
        line-height: 1.2;
      }

      .cta-inner p {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.85);
        line-height: 1.6;
      }

      .cta-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 0.5rem;
      }

      .btn-cta {
        padding: 1rem 2.5rem;
        background: white;
        color: #1976d2;
        border-radius: 10px;
        text-decoration: none;
        font-weight: 700;
        font-size: 1rem;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
      }

      /* Footer */
      .landing-footer {
        padding: 2rem;
        border-top: 1px solid var(--border-subtle);
        background: var(--surface-card);
      }

      .footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .footer-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .footer-logo {
        height: 40px;
        opacity: 0.7;
      }

      .footer-company {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 500;
      }

      .footer-location {
        font-size: 0.85rem;
        color: var(--text-tertiary);
      }

      .footer-text {
        font-size: 0.85rem;
        color: var(--text-tertiary);
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .stats-cards {
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .about-inner,
        .leadership-inner {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .product-inner {
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }

        .product-visual {
          order: -1;
        }

        .product-badge-visual {
          max-width: 400px;
        }
      }

      @media (max-width: 900px) {
        .hero-title {
          font-size: 2.5rem;
        }

        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .hide-mobile {
          display: none;
        }
      }

      @media (max-width: 600px) {
        :host {
          --header-height: 64px;
        }

        .hero {
          padding: 3rem 1.5rem;
        }

        .hero-title {
          font-size: 2rem;
        }

        .hero-description {
          font-size: 1rem;
        }

        .stats-cards {
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-number {
          font-size: 2.25rem;
        }

        .features-grid {
          grid-template-columns: 1fr;
        }

        .section-title {
          font-size: 1.6rem;
        }

        .leader-highlights {
          grid-template-columns: 1fr;
        }

        .leader-quote-card {
          padding: 1.5rem;
        }

        .footer-inner {
          flex-direction: column;
          text-align: center;
        }

        .footer-left {
          flex-direction: column;
        }

        .btn-outline {
          display: none;
        }

        .nav-link {
          display: none;
        }

        .cta-inner h2 {
          font-size: 1.75rem;
        }

        .product-actions {
          flex-direction: column;
          align-items: stretch;
        }

        .product-actions a {
          text-align: center;
        }
      }
    `,
  ],
})
export class LandingComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isDarkMode = signal(false);
  logoSrc = computed(() => (this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png'));

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.initializeTheme();
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

  toggleTheme(): void {
    this.isDarkMode.update((v) => !v);
  }
}
