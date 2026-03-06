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
            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Menu">
              @if (isMobileMenuOpen()) {
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              } @else {
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              }
            </button>

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

      <!-- Mobile Overlay Menu -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-menu-overlay">
          <nav class="mobile-nav">
            <a href="#sobre" class="mobile-link" (click)="toggleMobileMenu()">Sobre</a>
            <a href="#servicos" class="mobile-link" (click)="toggleMobileMenu()">Serviços</a>
            <a href="#sistema" class="mobile-link" (click)="toggleMobileMenu()">Sistema</a>
            <a href="#numeros" class="mobile-link" (click)="toggleMobileMenu()">Números</a>
            <a href="#lideranca" class="mobile-link" (click)="toggleMobileMenu()">Liderança</a>
            <div class="mobile-actions">
              <a routerLink="/login" class="btn-outline mobile-btn" (click)="toggleMobileMenu()"
                >Entrar</a
              >
              <a routerLink="/cadastro" class="btn-primary mobile-btn" (click)="toggleMobileMenu()"
                >Criar conta</a
              >
            </div>
          </nav>
        </div>
      }

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
              <div class="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="value-content">
                <h4>Segurança Terceirizada</h4>
                <p>
                  Profissionais qualificados e treinados, escalas cobertas e supervisão contínua
                </p>
              </div>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0H4.5M13.5 12h6.75M13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 0H4.5m0 6h15"
                  />
                </svg>
              </div>
              <div class="value-content">
                <h4>Consultoria Especializada</h4>
                <p>Análise e otimização da operação de segurança com foco em resultados reais</p>
              </div>
            </div>
            <div class="value-item">
              <div class="value-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
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
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3>Vigilância Terceirizada</h3>
              <p>
                Profissionais qualificados e treinados para segurança patrimonial de condomínios.
                Escalas 12x36 e comercial com cobertura completa nas cidades atendidas.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                  />
                </svg>
              </div>
              <h3>Consultoria Operacional</h3>
              <p>
                Análise de dimensionamento de equipe, otimização de turnos, redução de custos e
                implantação de processos de segurança personalizados.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
              </div>
              <h3>Gerenciamento Administrativo</h3>
              <p>
                Controle de contratos, folha de pagamento, documentação e compliance — tudo
                gerenciado com transparência e precisão.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h3>Gestão de Equipes</h3>
              <p>
                Seleção, treinamento, supervisão e gestão completa de vigilantes, porteiros e
                equipes de segurança patrimonial.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
              <h3>Cobertura Regional</h3>
              <p>
                Presença consolidada em Porto Feliz, Tietê, Tatuí, Boituva e Salto — atendimento
                presencial com resposta rápida a qualquer demanda.
              </p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
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
                <span class="product-highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    /></svg
                ></span>
                <div>
                  <strong>Gestão de Escalas</strong>
                  <span>Alocações diárias com calendário, kanban e substituições automáticas</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="product-highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    /></svg
                ></span>
                <div>
                  <strong>Contratos Inteligentes</strong>
                  <span>Cálculo automático de impostos, margens e alertas de vencimento</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="product-highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V4.242c0-.754-.727-1.294-1.453-1.096A60.114 60.114 0 002.25 5.25v13.5zm15.978-8.15c.63-.111 1.265-.207 1.906-.29.58-.075 1.054.453 1.054 1.04v5.04c0 .587-.474 1.115-1.054 1.04a62.06 62.06 0 00-1.906-.29V10.6z"
                    /></svg
                ></span>
                <div>
                  <strong>Folha de Pagamento</strong>
                  <span>Cálculo de salários, adicionais noturnos (CLT Art. 73) e encargos</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="product-highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    /></svg
                ></span>
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
              <div class="pv-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
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
                <span class="highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972m0 0a8.001 8.001 0 00-10.582 0m10.582 0L14.25 10.5m-10.582 0L10.5 10.5"
                    /></svg
                ></span>
                <span>+10 anos no setor de segurança</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                    /></svg
                ></span>
                <span>7 condomínios atendidos ativamente</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    /></svg
                ></span>
                <span>120+ funcionários sob gestão</span>
              </div>
              <div class="highlight-item">
                <span class="highlight-icon"
                  ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    /></svg
                ></span>
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
            <p class="footer-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              Porto Feliz · Tietê · Tatuí · Boituva · Salto — SP
            </p>
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

      .mobile-menu-btn {
        display: none; /* hidden desktop */
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        padding: 0.5rem;
      }

      .mobile-menu-overlay {
        position: fixed;
        top: var(--header-height);
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary);
        z-index: 40;
        display: flex;
        flex-direction: column;
        padding: 2rem;
        animation: slideDown 0.3s ease-out forwards;
      }

      @keyframes slideDown {
        from {
          transform: translateY(-10px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .mobile-nav {
        display: flex;
        flex-direction: column;
      }

      .mobile-link {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        text-decoration: none;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border-subtle);

        &:last-of-type {
          border-bottom: none;
        }
      }

      .mobile-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
      }

      .mobile-btn {
        text-align: center;
        width: 100%;
        padding: 0.875rem;
      }

      svg {
        width: 1em;
        height: 1em;
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
        font-size: clamp(2rem, 5vw, 3.5rem);
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
        font-size: 2.25rem;
        color: var(--primary-color);
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
        font-size: 3rem;
        color: var(--primary-color);
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
        font-size: 1.75rem;
        color: var(--primary-color);
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
        font-size: 1.25rem;
        color: var(--primary-color);
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

      @media (max-width: 900px) {
        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-nav .btn-outline,
        .header-nav .btn-primary {
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
  isMobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }
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
