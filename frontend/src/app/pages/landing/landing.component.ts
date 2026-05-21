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
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  // HttpClient provided via provideHttpClient() in app.config.ts
  template: `
    <div class="landing-page">
      <!-- Header -->
      <header class="landing-header" [class.header-hidden]="!isHeaderVisible()">
        <div class="header-container">
          <img [src]="logoSrc()" alt="Interceptor Assessoria Inteligente" class="header-logo" />
          <nav class="header-nav">
            <a href="#sobre" class="nav-link">Sobre</a>
            <a href="#servicos" class="nav-link">Serviços</a>
            <a href="#sistema" class="nav-link hide-mobile">Sistema</a>
            <a href="#numeros" class="nav-link hide-mobile">Números</a>
            <a href="#lideranca" class="nav-link hide-mobile">Liderança</a>
            <a href="#contato" class="nav-link hide-mobile">Contato</a>

            <button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Menu" data-cy="landing-mobile-menu">
              @if (isMobileMenuOpen()) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              }
            </button>

            <button
              class="theme-toggle"
              (click)="toggleTheme()"
              data-cy="landing-theme-toggle"
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

            <a routerLink="/login" class="btn-outline hide-on-mobile btn-login-mobile" data-cy="landing-login-nav">Entrar</a>
            <a routerLink="/cadastro" class="btn-primary hide-on-mobile" data-cy="landing-cadastro-nav">Criar conta</a>
          </nav>
        </div>
      </header>

      <!-- Mobile Overlay -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-menu-overlay">
          <nav class="mobile-nav">
            <a href="#sobre" class="mobile-link" (click)="toggleMobileMenu()">Sobre</a>
            <a href="#servicos" class="mobile-link" (click)="toggleMobileMenu()">Serviços</a>
            <a href="#sistema" class="mobile-link" (click)="toggleMobileMenu()">Sistema</a>
            <a href="#numeros" class="mobile-link" (click)="toggleMobileMenu()">Números</a>
            <a href="#lideranca" class="mobile-link" (click)="toggleMobileMenu()">Liderança</a>
            <a href="#contato" class="mobile-link" (click)="toggleMobileMenu()">Contato</a>
            <div class="mobile-actions">
              <a routerLink="/login" class="btn-outline mobile-btn" data-cy="landing-login-mobile" (click)="toggleMobileMenu()"
                >Entrar</a
              >
              <a routerLink="/cadastro" class="btn-primary mobile-btn" data-cy="landing-cadastro-mobile" (click)="toggleMobileMenu()"
                >Criar conta</a
              >
            </div>
          </nav>
        </div>
      }

      <!-- ─── HERO ─────────────────────────────────────────────────── -->
      <section class="hero">
        <div class="hero-bg-grid"></div>
        <div class="hero-inner">
          <div class="hero-text">
            <div class="hero-eyebrow">
              <span class="eyebrow-dot"></span>
              Porto Feliz · Tietê · Tatuí · Boituva · Salto
            </div>
            <h1 class="hero-title">
              Assessoria<br />
              <span class="hero-title-accent">inteligente</span><br />
              em Associação<br />Condominial
            </h1>
            <p class="hero-description">
              A <strong>Interceptor Assessoria Inteligente</strong> e uma
              <strong>Empresa de Gestao e Facilities em Associacoes Condominiais</strong>, com
              consultoria especializada e gerenciamento operacional e administrativo completo para
              clientes nas cidades de Porto Feliz, Tietê, Tatuí, Boituva e Salto.
            </p>
            <div class="hero-actions">
              <a href="#servicos" class="btn-hero-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
                Conheça nossos serviços
              </a>
              <a href="#sobre" class="btn-hero-ghost">Sobre a empresa</a>
            </div>
            <div class="hero-scroll-hint hero-scroll-hint-mobile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                />
              </svg>
            </div>
          </div>

          <div class="hero-visual">
            <div class="hv-ring hv-ring-outer"></div>
            <div class="hv-ring hv-ring-mid"></div>
            <div class="hv-shield">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div class="hv-float hv-float-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
              <span>50+ equipe</span>
            </div>
            <div class="hv-float hv-float-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                />
              </svg>
              <span>7+ clientes</span>
            </div>
            <div class="hv-float hv-float-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>R$ 400k+/mês</span>
            </div>
          </div>
        </div>

        <div class="hero-scroll-hint hero-scroll-hint-desktop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
            />
          </svg>
        </div>
      </section>

      <!-- ─── STATS ──────────────────────────────────────────────────────── -->
      <section class="stats" id="numeros">
        <div class="stats-inner">
          <div class="stats-label">Nossa Empresa em Números</div>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-n">7+</span>
              <span class="stat-l">Clientes Atendidos</span>
              <span class="stat-d">Região metropolitana de Sorocaba</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <span class="stat-n">50+</span>
              <span class="stat-l">Funcionários Gerenciados</span>
              <span class="stat-d">Vigias, porteiros e supervisores</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <span class="stat-n">R$400k+</span>
              <span class="stat-l">Folha de Pagamento</span>
              <span class="stat-d">Gerenciamento mensal de custos</span>
            </div>
            <div class="stat-div"></div>
            <div class="stat-item">
              <span class="stat-n">10+</span>
              <span class="stat-l">Anos de Experiência</span>
              <span class="stat-d">No mercado de gestão e facilities condominiais</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── ABOUT ──────────────────────────────────────────────────────── -->
      <section class="about" id="sobre">
        <div class="about-inner">
          <div class="about-content">
            <div class="section-eyebrow">Sobre Nós</div>
            <h2 class="section-title">Interceptor<br />Assessoria Inteligente</h2>
            <p class="about-text">
              Somos uma
              <strong>Empresa de Gestao e Facilities em Associacoes Condominiais</strong>, com
              <strong>consultoria</strong> e
              <strong>gerenciamento operacional e administrativo</strong> para clientes. Atualmente
              atendemos <strong>7 clientes</strong> nas cidades de
              <strong>Porto Feliz, Tietê, Tatuí, Boituva e Salto</strong>.
            </p>
            <p class="about-text">
              Com mais de uma década de experiência no setor, desenvolvemos soluções sob medida para
              cada cliente — da operação de facilities à gestão completa administrativa. Nossa
              metodologia garante eficiência operacional, transparência total e tranquilidade para
              síndicos e moradores.
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
                <h4>Operacao de Facilities</h4>
                <p>Profissionais qualificados, escalas cobertas e supervisão contínua</p>
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
                <p>Análise e otimização da operação com foco em resultados reais</p>
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

      <!-- ─── SERVICES ──────────────────────────────────────────────────── -->
      <section class="features" id="servicos">
        <div class="features-inner">
          <div class="features-header">
            <div class="section-eyebrow center">Nossos Serviços</div>
            <h2 class="features-title">Soluções completas<br />para sua operação</h2>
            <p class="features-subtitle">
              Da operacao de facilities à gestão financeira — tudo que seu cliente precisa
            </p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <span class="fc-number">01</span>
              <div class="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3>Facilities Operacionais</h3>
              <p>
                Profissionais qualificados para operação condominial de campo. Escalas 12x36 e
                comercial com cobertura completa.
              </p>
            </div>
            <div class="feature-card">
              <span class="fc-number">02</span>
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
                implantação de processos personalizados.
              </p>
            </div>
            <div class="feature-card">
              <span class="fc-number">03</span>
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
                Controle de contratos, folha de pagamento, documentação e compliance — gerenciado
                com transparência e precisão.
              </p>
            </div>
            <div class="feature-card">
              <span class="fc-number">04</span>
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
                Seleção, treinamento, supervisão e gestão completa de equipes operacionais para
                associações condominiais.
              </p>
            </div>
            <div class="feature-card">
              <span class="fc-number">05</span>
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
              <span class="fc-number">06</span>
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
                relatórios financeiros detalhados por cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── PRODUCT ────────────────────────────────────────────────────── -->
      <section class="product" id="sistema">
        <div class="product-inner">
          <div class="product-content">
            <div class="section-eyebrow">Nosso Produto Digital</div>
            <h2 class="section-title">InterceptorSystem</h2>
            <p class="product-lead">
              A plataforma digital desenvolvida pela própria Interceptor para revolucionar a gestão
              de associacoes condominiais.
            </p>
            <p class="product-text">
              O <strong>InterceptorSystem</strong> centraliza toda a operação: escalas de trabalho,
              contratos com cálculo automático de custos, folha de pagamento com adicionais CLT,
              controle de diárias e um dashboard financeiro em tempo real.
            </p>

            <div class="product-highlights">
              <div class="product-highlight-item">
                <span class="phi-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Gestão de Escalas</strong>
                  <span>Diárias diárias com calendário, kanban e substituições automáticas</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="phi-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Contratos Inteligentes</strong>
                  <span>Cálculo automático de impostos, margens e alertas de vencimento</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="phi-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V4.242c0-.754-.727-1.294-1.453-1.096A60.114 60.114 0 002.25 5.25v13.5zm15.978-8.15c.63-.111 1.265-.207 1.906-.29.58-.075 1.054.453 1.054 1.04v5.04c0 .587-.474 1.115-1.054 1.04a62.06 62.06 0 00-1.906-.29V10.6z"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Folha de Pagamento</strong>
                  <span>Cálculo de salários, adicionais noturnos (CLT Art. 73) e encargos</span>
                </div>
              </div>
              <div class="product-highlight-item">
                <span class="phi-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </span>
                <div>
                  <strong>Dashboard Financeiro</strong>
                  <span>Custos, margens e indicadores operacionais em tempo real</span>
                </div>
              </div>
            </div>

            <div class="product-actions">
              <a routerLink="/cadastro" class="btn-hero-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
                Começar agora — é gratuito
              </a>
              <a routerLink="/login" class="btn-hero-ghost">Já tenho uma conta</a>
            </div>
          </div>

          <!-- Dashboard mockup -->
          <div class="product-visual">
            <div class="mock-window">
              <div class="mock-bar">
                <span class="mock-dot red"></span>
                <span class="mock-dot yellow"></span>
                <span class="mock-dot green"></span>
                <span class="mock-title">InterceptorSystem — Dashboard</span>
              </div>
              <div class="mock-body">
                <div class="mock-sidebar">
                  <div class="mss-item active">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                    Dashboard
                  </div>
                  <div class="mss-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                    Escalas
                  </div>
                  <div class="mss-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                    Funcionários
                  </div>
                  <div class="mss-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    Contratos
                  </div>
                </div>
                <div class="mock-main">
                  <div class="mock-kpis">
                    <div class="mock-kpi">
                      <span class="mk-label">Folha do Mês</span>
                      <span class="mk-value">R$ 1.02M</span>
                      <span class="mk-badge up">+2.4%</span>
                    </div>
                    <div class="mock-kpi">
                      <span class="mk-label">Postos Ativos</span>
                      <span class="mk-value">87</span>
                      <span class="mk-badge stable">estável</span>
                    </div>
                    <div class="mock-kpi">
                      <span class="mk-label">Contratos</span>
                      <span class="mk-value">15</span>
                      <span class="mk-badge up">+1 novo</span>
                    </div>
                  </div>
                  <div class="mock-chart">
                    <div class="mock-chart-label">Custo Mensal (últimos 6 meses)</div>
                    <div class="mock-bars">
                      <div class="mb-col">
                        <div class="mb-bar" style="height:55%"></div>
                        <span>Ago</span>
                      </div>
                      <div class="mb-col">
                        <div class="mb-bar" style="height:68%"></div>
                        <span>Set</span>
                      </div>
                      <div class="mb-col">
                        <div class="mb-bar" style="height:60%"></div>
                        <span>Out</span>
                      </div>
                      <div class="mb-col">
                        <div class="mb-bar" style="height:74%"></div>
                        <span>Nov</span>
                      </div>
                      <div class="mb-col">
                        <div class="mb-bar" style="height:85%"></div>
                        <span>Dez</span>
                      </div>
                      <div class="mb-col">
                        <div class="mb-bar active" style="height:100%"></div>
                        <span>Jan</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── LEADERSHIP ────────────────────────────────────────────────── -->
      <section class="leadership" id="lideranca">
        <div class="leadership-inner">
          <div class="leadership-quote-area">
            <div class="big-quote-mark">"</div>
            <blockquote class="leader-quote">
              Nosso objetivo é oferecer gestão e facilities com a mesma eficiência e transparência
              que esperamos de qualquer serviço de excelência. Cada cliente que atendemos recebe
              atenção personalizada porque entendemos que gestão condominial exige confiança.
            </blockquote>
            <div class="quote-author-info">
              <div class="qa-name">Luciano Calsavara</div>
              <div class="qa-role">
                Fundador & Diretor Operacional · Interceptor Assessoria Inteligente
              </div>
            </div>
          </div>

          <div class="leader-info">
            <div class="section-eyebrow">Liderança</div>
            <h2 class="section-title">Luciano Calsavara</h2>
            <p class="leader-bio">
              Com mais de <strong>10 anos de experiência</strong> em gestão operacional, Luciano
              fundou a Interceptor com foco em excelência e inovação no atendimento a associações
              condominiais.
            </p>
            <p class="leader-bio">
              Sua vivência direta no campo — desde a diária de vigilantes até a negociação de
              contratos — trouxe a visão de transformar a gestão manual em processos digitais
              eficientes, capazes de escalar sem perder a qualidade e o atendimento personalizado.
            </p>
            <div class="leader-highlights">
              <div class="lh-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972m0 0a8.001 8.001 0 00-10.582 0m10.582 0L14.25 10.5m-10.582 0L10.5 10.5"
                  />
                </svg>
                <span>+10 anos no setor de gestao e facilities</span>
              </div>
              <div class="lh-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                  />
                </svg>
                <span>7 clientes atendidos ativamente</span>
              </div>
              <div class="lh-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
                <span>120+ funcionários sob gestão</span>
              </div>
              <div class="lh-item">
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
                <span>Porto Feliz, Tietê, Tatuí, Boituva e Salto</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── CTA ───────────────────────────────────────────────────────── -->
      <section class="cta-banner">
        <div class="cta-bg-accent"></div>
        <div class="cta-inner">
          <div class="cta-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h2>Seu cliente merece<br />a melhor gestão e facilities</h2>
          <p>
            Entre em contato e descubra como a Interceptor Assessoria Inteligente pode transformar a
            gestão e as operações do seu cliente.
          </p>
          <a routerLink="/cadastro" class="btn-cta">
            Criar conta no InterceptorSystem
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </a>
        </div>
      </section>

      <!-- ─── CONTATO ────────────────────────────────────────────────────── -->
      <section class="contact-section" id="contato">
        <div class="contact-inner">
          <div class="contact-header">
            <div class="section-eyebrow">Contato</div>
            <h2 class="section-title">Fale com a Nossa Equipe</h2>
            <p class="contact-subtitle">
              Envie sua mensagem e retornaremos para apresentar como nossa
              <strong>Empresa de Gestao e Facilities em Associacoes Condominiais</strong>
              pode apoiar sua operação.
            </p>
          </div>

          <form class="contact-form" (ngSubmit)="onContactSubmit()" #contactForm="ngForm">
            <div class="contact-grid">
              <div class="contact-field">
                <label for="contactName">Nome</label>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  [(ngModel)]="contactName"
                  required
                  placeholder="Seu nome completo"
                />
              </div>

              <div class="contact-field">
                <label for="contactCity">Cidade</label>
                <input
                  id="contactCity"
                  name="contactCity"
                  type="text"
                  [(ngModel)]="contactCity"
                  required
                  placeholder="Ex: Porto Feliz"
                />
              </div>

              <div class="contact-field">
                <label for="contactState">Estado</label>
                <input
                  id="contactState"
                  name="contactState"
                  type="text"
                  maxlength="2"
                  [(ngModel)]="contactState"
                  required
                  placeholder="SP"
                />
              </div>

              <div class="contact-field">
                <label for="contactEmail">Email</label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  [(ngModel)]="contactEmail"
                  required
                  placeholder="voce@empresa.com"
                />
              </div>
            </div>

            <div class="contact-field full">
              <label for="contactDescription">Descricao</label>
              <textarea
                id="contactDescription"
                name="contactDescription"
                rows="5"
                [(ngModel)]="contactDescription"
                required
                placeholder="Descreva sua necessidade"
              ></textarea>
            </div>

            @if (contactMessage()) {
              <div class="contact-feedback success">{{ contactMessage() }}</div>
            }

            <button
              type="submit"
              class="btn-contact"
              [disabled]="!contactForm.form.valid || isContactSubmitting()"
            >
              {{ isContactSubmitting() ? 'Enviando...' : 'Enviar Contato' }}
            </button>
          </form>
        </div>
      </section>

      <!-- ─── FOOTER ─────────────────────────────────────────────────────── -->
      <footer class="landing-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <img [src]="logoSrc()" alt="Interceptor Assessoria Inteligente" class="footer-logo" />
            <p class="footer-tagline">Gestao e Facilities com excelencia e transparencia.</p>
          </div>
          <div class="footer-location">
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
          </div>
          <div class="footer-copy">
            © 2026 Interceptor Assessoria Inteligente.<br />Todos os direitos reservados.
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

      svg {
        width: 1em;
        height: 1em;
      }

      .landing-page {
        min-height: 100vh;
        background: var(--bg-primary);
        color: var(--text-primary);
        overflow-x: hidden;
      }

      /* ── HEADER ──────────────────────────────────────────────── */
      .landing-header {
        border-bottom: 1px solid var(--border-subtle);
        background: var(--surface-card);
        padding: 0 2rem;
        height: var(--header-height);
        display: flex;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        backdrop-filter: blur(16px);
        transition: transform 0.3s ease-in-out;
        transform: translateY(0);
      }

      .landing-header.header-hidden {
        transform: translateY(-100%);
      }

      .landing-page {
        padding-top: var(--header-height);
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
        height: 7rem;
      }

      .header-nav {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .nav-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        padding: 0.4rem 0.75rem;
        border-radius: var(--radius-md);
        transition: all 0.2s;

        &:hover {
          color: var(--primary-color);
          background: rgba(33, 150, 243, 0.08);
        }
      }

      .mobile-menu-btn {
        display: none;
        background: transparent;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        padding: var(--space-2);
        font-size: 1.5rem;
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
        padding: var(--space-8);
        animation: slideDown 0.25s ease-out forwards;
        overflow-y: auto;
      }

      .landing-header {
        border-bottom: 1px solid var(--border-subtle);
        background: var(--surface-card);
        padding: 0 2rem;
        height: var(--header-height);
        display: flex;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        backdrop-filter: blur(16px);
        transition: transform 0.3s ease-in-out;
        transform: translateY(0);
      }

      body.menu-open .landing-header {
        transform: translateY(0) !important;
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
        font-size: var(--text-xl);
        font-weight: var(--fw-semibold);
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
        gap: var(--space-4);
        margin-top: var(--space-8);
      }

      .mobile-btn {
        text-align: center;
        width: 100%;
        padding: 0.875rem;
      }

      .theme-toggle {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        border: none;
        background: var(--theme-toggle-bg);
        color: var(--theme-toggle-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.25rem;
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
        border-radius: var(--radius-md);
        text-decoration: none;
        font-weight: var(--fw-semibold);
        font-size: var(--text-sm);
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
        border-radius: var(--radius-md);
        text-decoration: none;
        font-weight: var(--fw-semibold);
        font-size: var(--text-sm);
        transition: all 0.2s;
        &:hover {
          background: var(--primary-dark);
        }
      }

      /* ── HERO ────────────────────────────────────────────────── */
      .hero {
        min-height: calc(100vh - var(--header-height));
        position: relative;
        display: flex;
        align-items: center;
        padding: var(--space-20) 2rem;
        background: var(--surface-card);
        overflow: hidden;
      }

      .hero-bg-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
          linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px);
        background-size: 48px 48px;
        opacity: 0.5;
        pointer-events: none;
      }

      .hero-inner {
        position: relative;
        max-width: 1200px;
        width: 100%;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4rem;
        align-items: center;
      }

      .hero-text {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .hero-eyebrow {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-xs);
        font-weight: var(--fw-semibold);
        color: var(--primary-color);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .eyebrow-dot {
        width: 8px;
        height: 8px;
        border-radius: var(--radius-full);
        background: var(--primary-color);
        flex-shrink: 0;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.3);
        }
      }

      .hero-title {
        font-size: clamp(2.5rem, 5vw, 4rem);
        font-weight: var(--fw-extrabold);
        line-height: 1.1;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .hero-title-accent {
        color: var(--primary-color);
        position: relative;
        &::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--primary-color);
          border-radius: var(--radius-full);
          opacity: 0.35;
        }
      }

      .hero-description {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.75;
        max-width: 540px;
        strong {
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }
      }

      .hero-actions {
        display: flex;
        gap: var(--space-4);
        flex-wrap: wrap;
        align-items: center;
      }

      .btn-hero-primary {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 0.875rem 1.75rem;
        background: var(--primary-color);
        color: white;
        border-radius: var(--radius-lg);
        text-decoration: none;
        font-weight: var(--fw-bold);
        font-size: var(--text-base);
        transition: all 0.2s;
        svg {
          font-size: 1rem;
        }
        &:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(33, 150, 243, 0.35);
        }
      }

      .btn-hero-ghost {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: 0.875rem 1.75rem;
        color: var(--text-secondary);
        border-radius: var(--radius-lg);
        text-decoration: none;
        font-weight: var(--fw-semibold);
        font-size: var(--text-base);
        border: 1.5px solid var(--border-strong);
        transition: all 0.2s;
        &:hover {
          color: var(--primary-color);
          border-color: var(--primary-color);
          background: rgba(33, 150, 243, 0.05);
        }
      }

      /* Hero visual (right side) */
      .hero-visual {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 420px;
      }

      .hv-ring {
        position: absolute;
        border-radius: var(--radius-full);
        border: 1.5px solid var(--border-subtle);
        animation: rotate 20s linear infinite;
      }

      .hv-ring-outer {
        width: 380px;
        height: 380px;
        animation-direction: normal;
      }

      .hv-ring-mid {
        width: 260px;
        height: 260px;
        border-style: dashed;
        border-color: var(--border-strong);
        animation-direction: reverse;
        animation-duration: 14s;
      }

      @keyframes rotate {
        to {
          transform: rotate(360deg);
        }
      }

      .hv-shield {
        width: 140px;
        height: 140px;
        background: var(--primary-color);
        border-radius: var(--radius-2xl);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 80px;
        box-shadow: 0 20px 60px rgba(33, 150, 243, 0.45);
        z-index: 2;
      }

      .hv-float {
        position: absolute;
        display: flex;
        align-items: center;
        gap: var(--space-2);
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
        box-shadow: var(--shadow-md);
        z-index: 3;
        animation: float 3s ease-in-out infinite;
        svg {
          color: var(--primary-color);
          font-size: 1.1rem;
        }
      }

      .hv-float-1 {
        top: 40px;
        right: 20px;
        animation-delay: 0s;
      }
      .hv-float-2 {
        bottom: 60px;
        right: 10px;
        animation-delay: 1s;
      }
      .hv-float-3 {
        bottom: 40px;
        left: 20px;
        animation-delay: 0.5s;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-8px);
        }
      }

      .hero-scroll-hint {
        position: absolute;
        bottom: var(--space-8);
        left: 50%;
        transform: translateX(-50%);
        color: var(--text-tertiary);
        font-size: 1.5rem;
        animation: bounce 2s ease-in-out infinite;
      }

      .hero-scroll-hint-mobile {
        display: none;
      }

      .hero-scroll-hint-desktop {
        display: block;
      }

      @keyframes bounce {
        0%,
        100% {
          transform: translateX(-50%) translateY(0);
          opacity: 0.5;
        }
        50% {
          transform: translateX(-50%) translateY(6px);
          opacity: 1;
        }
      }

      /* ── STATS ───────────────────────────────────────────────── */
      .stats {
        background: linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%);
        padding: 5rem 2rem;
        position: relative;
        overflow: hidden;
        &::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.04);
        }
        &::after {
          content: '';
          position: absolute;
          bottom: -60px;
          left: -60px;
          width: 240px;
          height: 240px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.04);
        }
      }

      .stats-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-8);
        position: relative;
      }

      .stats-label {
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .stats-row {
        display: flex;
        align-items: center;
        gap: 0;
        width: 100%;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: var(--radius-2xl);
        overflow: hidden;
        backdrop-filter: blur(8px);
      }

      .stat-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5rem 1.5rem;
        gap: var(--space-1);
        transition: background 0.2s;
        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      }

      .stat-div {
        width: 1px;
        height: 70px;
        background: rgba(255, 255, 255, 0.18);
        flex-shrink: 0;
      }

      .stat-n {
        font-size: clamp(2.25rem, 4vw, 3.5rem);
        font-weight: var(--fw-extrabold);
        color: white;
        letter-spacing: -0.03em;
        line-height: 1;
      }

      .stat-l {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: rgba(255, 255, 255, 0.9);
        margin-top: var(--space-2);
      }

      .stat-d {
        font-size: var(--text-xs);
        color: rgba(255, 255, 255, 0.55);
        margin-top: 2px;
      }

      /* ── SHARED ──────────────────────────────────────────────── */
      .section-eyebrow {
        display: inline-block;
        font-size: var(--text-xs);
        font-weight: var(--fw-bold);
        color: var(--primary-color);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: var(--space-4);
        &.center {
          display: block;
          text-align: center;
        }
      }

      .section-title {
        font-size: clamp(1.75rem, 3vw, var(--text-4xl));
        font-weight: var(--fw-extrabold);
        color: var(--text-primary);
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin-bottom: var(--space-4);
      }

      /* ── ABOUT ───────────────────────────────────────────────── */
      .about {
        padding: 6rem 2rem;
        background: var(--bg-primary);
      }

      .about-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
        align-items: center;
      }

      .about-text {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.8;
        margin-bottom: var(--space-4);
        strong {
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }
      }

      .about-values {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .value-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-4);
        padding: var(--space-6);
        background: var(--surface-card);
        border-radius: var(--radius-xl);
        border: 1px solid var(--border-subtle);
        border-left: 3px solid var(--primary-color);
        transition: all 0.2s;
        &:hover {
          box-shadow: var(--shadow-md);
          transform: translateX(4px);
        }
      }

      .value-icon {
        font-size: 2rem;
        color: var(--primary-color);
        line-height: 1;
        flex-shrink: 0;
        padding-top: 2px;
      }

      .value-content {
        h4 {
          font-size: var(--text-base);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }
        p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }
      }

      /* ── SERVICES ────────────────────────────────────────────── */
      .features {
        padding: 6rem 2rem;
        background: var(--surface-card);
      }

      .features-inner {
        max-width: 1200px;
        margin: 0 auto;
      }

      .features-header {
        text-align: center;
        margin-bottom: var(--space-12);
      }

      .features-title {
        font-size: clamp(1.75rem, 3vw, var(--text-4xl));
        font-weight: var(--fw-extrabold);
        color: var(--text-primary);
        line-height: 1.15;
        letter-spacing: -0.02em;
        margin-bottom: var(--space-4);
      }

      .features-subtitle {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        margin: 0;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);
      }

      .feature-card {
        position: relative;
        padding: var(--space-8);
        background: var(--bg-primary);
        border-radius: var(--radius-2xl);
        border: 1px solid var(--border-subtle);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        overflow: hidden;
        transition: all 0.25s;

        &::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 3px;
          background: var(--primary-color);
          transition: width 0.3s ease;
        }

        &:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
          &::before {
            width: 100%;
          }
        }
      }

      .fc-number {
        position: absolute;
        top: var(--space-6);
        right: var(--space-6);
        font-size: var(--text-4xl);
        font-weight: var(--fw-extrabold);
        color: var(--border-subtle);
        line-height: 1;
        letter-spacing: -0.04em;
        user-select: none;
      }

      .feature-icon {
        font-size: 2rem;
        color: var(--primary-color);
        line-height: 1;
      }

      .feature-card h3 {
        font-size: var(--text-lg);
        font-weight: var(--fw-bold);
        color: var(--text-primary);
        margin: 0;
      }

      .feature-card p {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.7;
        margin: 0;
      }

      /* ── PRODUCT ─────────────────────────────────────────────── */
      .product {
        padding: 6rem 2rem;
        background: var(--bg-primary);
      }

      .product-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
        align-items: center;
      }

      .product-lead {
        font-size: var(--text-xl);
        color: var(--primary-color);
        font-weight: var(--fw-semibold);
        line-height: 1.5;
        margin-bottom: var(--space-4);
      }

      .product-text {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.8;
        margin-bottom: var(--space-8);
        strong {
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }
      }

      .product-highlights {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        margin-bottom: var(--space-8);
      }

      .product-highlight-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-4);
        div {
          display: flex;
          flex-direction: column;
          gap: 2px;
          strong {
            font-size: var(--text-sm);
            font-weight: var(--fw-bold);
            color: var(--text-primary);
          }
          span {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            line-height: 1.5;
          }
        }
      }

      .phi-icon {
        width: 36px;
        height: 36px;
        min-width: 36px;
        background: rgba(33, 150, 243, 0.1);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        font-size: 1.1rem;
        margin-top: 1px;
      }

      .product-actions {
        display: flex;
        gap: var(--space-4);
        flex-wrap: wrap;
        align-items: center;
      }

      /* Mock window */
      .product-visual {
        position: relative;
      }

      .mock-window {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-lg);
      }

      .mock-bar {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-subtle);
      }

      .mock-dot {
        width: 11px;
        height: 11px;
        border-radius: var(--radius-full);
        flex-shrink: 0;
        &.red {
          background: #ef4444;
        }
        &.yellow {
          background: #f59e0b;
        }
        &.green {
          background: #10b981;
        }
      }

      .mock-title {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        font-weight: var(--fw-medium);
        margin-left: var(--space-2);
      }

      .mock-body {
        display: grid;
        grid-template-columns: 140px 1fr;
        min-height: 300px;
      }

      .mock-sidebar {
        background: var(--bg-primary);
        border-right: 1px solid var(--border-subtle);
        padding: var(--space-3) 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .mss-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-xs);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.15s;
        svg {
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        &.active {
          background: rgba(33, 150, 243, 0.12);
          color: var(--primary-color);
          border-right: 2px solid var(--primary-color);
          font-weight: var(--fw-semibold);
        }
        &:hover:not(.active) {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
      }

      .mock-main {
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }

      .mock-kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-3);
      }

      .mock-kpi {
        background: var(--bg-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-3);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .mk-label {
        font-size: 10px;
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .mk-value {
        font-size: var(--text-lg);
        font-weight: var(--fw-extrabold);
        color: var(--text-primary);
        line-height: 1.2;
      }

      .mk-badge {
        font-size: 10px;
        font-weight: var(--fw-bold);
        padding: 1px 6px;
        border-radius: var(--radius-sm);
        display: inline-block;
        align-self: flex-start;
        &.up {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }
        &.stable {
          background: rgba(59, 130, 246, 0.12);
          color: #2563eb;
        }
      }

      .mock-chart {
        background: var(--bg-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        flex: 1;
      }

      .mock-chart-label {
        font-size: 10px;
        font-weight: var(--fw-semibold);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: var(--space-3);
      }

      .mock-bars {
        display: flex;
        align-items: flex-end;
        gap: var(--space-2);
        height: 80px;
      }

      .mb-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
        height: 100%;
        justify-content: flex-end;
        span {
          font-size: 9px;
          color: var(--text-secondary);
          font-weight: var(--fw-medium);
        }
      }

      .mb-bar {
        width: 100%;
        background: var(--bg-secondary);
        border-radius: var(--radius-sm) var(--radius-sm) 0 0;
        transition: all 0.2s;
        &.active {
          background: var(--primary-color);
        }
      }

      /* ── LEADERSHIP ──────────────────────────────────────────── */
      .leadership {
        padding: 6rem 2rem;
        background: var(--surface-card);
      }

      .leadership-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5rem;
        align-items: center;
      }

      .leadership-quote-area {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
        padding: var(--space-8);
        background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
        border-radius: var(--radius-2xl);
        position: relative;
        overflow: hidden;
        &::after {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 160px;
          height: 160px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.05);
        }
      }

      .big-quote-mark {
        font-size: 8rem;
        font-weight: var(--fw-extrabold);
        color: rgba(255, 255, 255, 0.15);
        line-height: 0.8;
        font-family: Georgia, serif;
        user-select: none;
      }

      .leader-quote {
        font-size: var(--text-lg);
        color: rgba(255, 255, 255, 0.92);
        line-height: 1.75;
        font-style: italic;
        margin: 0;
        position: relative;
        z-index: 1;
      }

      .quote-author-info {
        position: relative;
        z-index: 1;
      }

      .qa-name {
        font-size: var(--text-base);
        font-weight: var(--fw-bold);
        color: white;
      }

      .qa-role {
        font-size: var(--text-sm);
        color: rgba(255, 255, 255, 0.6);
        margin-top: 2px;
      }

      .leader-info {
        display: flex;
        flex-direction: column;
      }

      .leader-bio {
        font-size: var(--text-base);
        color: var(--text-secondary);
        line-height: 1.8;
        margin-bottom: var(--space-4);
        strong {
          color: var(--text-primary);
          font-weight: var(--fw-semibold);
        }
      }

      .leader-highlights {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-3);
        margin-top: var(--space-4);
      }

      .lh-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        color: var(--text-secondary);
        svg {
          font-size: 1.2rem;
          color: var(--primary-color);
          flex-shrink: 0;
        }
      }

      /* ── CTA ─────────────────────────────────────────────────── */
      .cta-banner {
        padding: 7rem 2rem;
        background: var(--primary-color);
        position: relative;
        overflow: hidden;
        text-align: center;
        clip-path: polygon(0 7%, 100% 0, 100% 93%, 0 100%);
        margin: -2rem 0;
      }

      .cta-bg-accent {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse at 30% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 50%, rgba(0, 0, 0, 0.15) 0%, transparent 60%);
        pointer-events: none;
      }

      .cta-inner {
        position: relative;
        z-index: 1;
        max-width: 700px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
      }

      .cta-icon {
        width: 72px;
        height: 72px;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: var(--radius-2xl);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2.5rem;
      }

      .cta-inner h2 {
        font-size: clamp(2rem, 4vw, 2.75rem);
        font-weight: var(--fw-extrabold);
        color: white;
        line-height: 1.2;
        letter-spacing: -0.02em;
        margin: 0;
      }

      .cta-inner p {
        font-size: var(--text-lg);
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.7;
        margin: 0;
      }

      .btn-cta {
        display: inline-flex;
        align-items: center;
        gap: var(--space-3);
        padding: 1rem 2.25rem;
        background: white;
        color: #1565c0;
        border-radius: var(--radius-lg);
        text-decoration: none;
        font-weight: var(--fw-bold);
        font-size: var(--text-base);
        transition: all 0.2s;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        svg {
          font-size: 1rem;
        }
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
      }

      /* ── CONTATO ─────────────────────────────────────────────── */
      .contact-section {
        padding: 5rem 2rem;
        background: linear-gradient(180deg, var(--bg-primary) 0%, var(--surface-card) 100%);
      }

      .contact-inner {
        max-width: 960px;
        margin: 0 auto;
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-2xl);
        padding: 2rem;
        box-shadow: 0 8px 28px rgba(10, 25, 47, 0.08);
      }

      .contact-header {
        margin-bottom: var(--space-6);
      }

      .contact-subtitle {
        color: var(--text-secondary);
        line-height: 1.7;
        margin: var(--space-3) 0 0;
      }

      .contact-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-4);
      }

      .contact-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .contact-field.full {
        margin-top: var(--space-4);
      }

      .contact-field label {
        font-size: var(--text-sm);
        font-weight: var(--fw-semibold);
        color: var(--text-primary);
      }

      .contact-field input,
      .contact-field textarea {
        width: 100%;
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        background: var(--bg-primary);
        color: var(--text-primary);
        padding: 0.875rem 1rem;
        font-size: var(--text-sm);
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
      }

      .contact-field input:focus,
      .contact-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(21, 101, 192, 0.15);
      }

      .contact-feedback {
        margin-top: var(--space-4);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
      }

      .contact-feedback.success {
        background: rgba(46, 125, 50, 0.12);
        border: 1px solid rgba(46, 125, 50, 0.35);
        color: #2e7d32;
      }

      .btn-contact {
        margin-top: var(--space-5);
        border: none;
        border-radius: var(--radius-lg);
        background: var(--primary-color);
        color: white;
        padding: 0.9rem 1.4rem;
        font-weight: var(--fw-semibold);
        font-size: var(--text-sm);
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .btn-contact:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(21, 101, 192, 0.22);
      }

      .btn-contact:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      /* ── FOOTER ──────────────────────────────────────────────── */
      .landing-footer {
        padding: var(--space-12) 2rem;
        background: var(--bg-primary);
        border-top: 1px solid var(--border-subtle);
        margin-top: 2rem;
      }

      .footer-inner {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--space-8);
      }

      .footer-logo {
        height: 40px;
        margin-bottom: var(--space-2);
      }

      .footer-tagline {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin: 0;
      }

      .footer-location {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        svg {
          font-size: 1.1rem;
          color: var(--primary-color);
          flex-shrink: 0;
        }
      }

      .footer-copy {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        text-align: right;
        line-height: 1.6;
      }

      /* ── RESPONSIVE ──────────────────────────────────────────── */
      @media (max-width: 1024px) {
        .hero-inner,
        .about-inner,
        .product-inner,
        .leadership-inner {
          grid-template-columns: 1fr;
          gap: 3rem;
        }

        .hero-visual {
          height: 320px;
        }
        .hv-ring-outer {
          width: 280px;
          height: 280px;
        }
        .hv-ring-mid {
          width: 200px;
          height: 200px;
        }
        .hv-shield {
          width: 110px;
          height: 110px;
          font-size: 60px;
        }

        .stats-row {
          flex-wrap: wrap;
          .stat-div {
            display: none;
          }
          .stat-item {
            flex: 0 0 50%;
          }
        }
      }

      @media (max-width: 900px) {
        .features-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .hide-mobile {
          display: none;
        }
        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .header-nav .hide-on-mobile {
          display: none;
        }
        .header-nav .btn-login-mobile {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
      }

      @media (max-width: 600px) {
        :host {
          --header-height: 72px;
        }

        .contact-section {
          padding: 3.5rem 1.5rem;
        }

        .contact-inner {
          padding: 1.25rem;
        }

        .contact-grid {
          grid-template-columns: 1fr;
        }

        .hero {
          min-height: 100vh;
          height: 100vh;
          padding: 2rem 1.5rem 1rem;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .hero-visual {
          display: none;
        }
        .hero-text {
          gap: var(--space-3);
          text-align: center;
          align-items: center;
        }
        .hero-eyebrow {
          display: none;
        }
        .hero-title {
          font-size: clamp(2.25rem, 9vw, 3rem);
          margin-bottom: 0;
          line-height: 1.15;
        }
        .hero-description {
          font-size: 1.063rem;
          line-height: 1.5;
          margin-bottom: 0;
        }
        .hero-actions {
          margin-top: var(--space-2);
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .hero-actions a {
          width: 100%;
          justify-content: center;
        }
        .hero-scroll-hint-mobile {
          display: block;
          position: static;
          transform: none;
          margin-top: var(--space-1);
          animation: bounceVertical 2s ease-in-out infinite;
        }
        .hero-scroll-hint-desktop {
          display: none;
        }

        .hero-inner {
          grid-template-columns: 1fr;
          width: 100%;
        }

        @keyframes bounceVertical {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(6px);
            opacity: 1;
          }
        }

        .stats {
          clip-path: none;
          margin: 0;
          padding: 3rem 1.5rem;
        }
        .stats-row {
          flex-direction: column;
          border-radius: var(--radius-xl);
        }
        .stat-item {
          flex: 1;
        }

        .about,
        .features,
        .product,
        .leadership {
          padding: 4rem 1.5rem;
        }

        .about-inner,
        .product-inner,
        .leadership-inner {
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        .features-grid {
          grid-template-columns: 1fr;
        }

        .leader-highlights {
          grid-template-columns: 1fr;
        }

        .mock-body {
          grid-template-columns: 1fr;
        }
        .mock-sidebar {
          display: none;
        }

        .cta-banner {
          clip-path: none;
          margin: 0;
          padding: 5rem 1.5rem;
        }

        .footer-inner {
          flex-direction: column;
          text-align: center;
          align-items: center;
        }
        .footer-copy {
          text-align: center;
        }

        .nav-link {
          display: none;
        }

        .header-nav .btn-login-mobile {
          padding: 0.4rem 0.75rem;
          font-size: 0.813rem;
        }

        .product-actions {
          flex-direction: column;
          align-items: stretch;
        }
        .product-actions a {
          text-align: center;
          justify-content: center;
        }

        .hero-actions {
          flex-direction: column;
          align-items: stretch;
        }
        .hero-actions a {
          text-align: center;
          justify-content: center;
        }
      }
    `,
  ],
})
export class LandingComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isDarkMode = signal(false);
  isMobileMenuOpen = signal(false);
  isHeaderVisible = signal(true);
  contactMessage = signal<string | null>(null);

  contactName = '';
  contactCity = '';
  contactState = '';
  contactEmail = '';
  contactDescription = '';

  private lastScrollY = 0;
  private scrollThreshold = 100;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => {
      const newValue = !v;
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = newValue ? 'hidden' : '';
        document.body.classList.toggle('menu-open', newValue);
      }
      return newValue;
    });
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
    this.setupScrollListener();
  }

  isContactSubmitting = signal(false);

  onContactSubmit(): void {
    if (this.isContactSubmitting()) return;
    this.isContactSubmitting.set(true);
    this.contactMessage.set(null);

    const payload = {
      nome: this.contactName,
      cidade: this.contactCity,
      estado: this.contactState,
      email: this.contactEmail,
      descricao: this.contactDescription,
    };

    this.http.post(`${environment.apiUrl}/api/contato`, payload).subscribe({
      next: () => {
        this.contactMessage.set('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        this.contactName = '';
        this.contactCity = '';
        this.contactState = '';
        this.contactEmail = '';
        this.contactDescription = '';
        this.isContactSubmitting.set(false);
      },
      error: () => {
        this.contactMessage.set(
          'Erro ao enviar mensagem. Tente novamente ou entre em contato pelo e-mail.',
        );
        this.isContactSubmitting.set(false);
      },
    });
  }

  private setupScrollListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('scroll', () => {
      // Don't hide header when mobile menu is open
      if (this.isMobileMenuOpen()) return;

      const currentScrollY = window.scrollY;

      if (currentScrollY < this.scrollThreshold) {
        this.isHeaderVisible.set(true);
      } else if (currentScrollY > this.lastScrollY) {
        // Scrolling down
        this.isHeaderVisible.set(false);
      } else if (currentScrollY < this.lastScrollY) {
        // Scrolling up
        this.isHeaderVisible.set(true);
      }

      this.lastScrollY = currentScrollY;
    });
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
