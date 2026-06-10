import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-termos-uso',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <header class="landing-header">
        <div class="header-container">
          <img [src]="logoSrc()" alt="Interceptor System" class="header-logo" />
          <a
            routerLink="/cadastro"
            class="btn-primary"
            style="padding: var(--space-2) var(--space-4); text-decoration: none; border-radius: var(--radius-md);"
            >Criar Conta</a
          >
        </div>
      </header>

      <main class="terms-main">
        <a routerLink="/cadastro" class="back-link">
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Voltar para cadastro
        </a>

        <article class="terms-content">
          <h1>Termos de Uso e Política de Privacidade</h1>
          <p class="last-updated">Última atualização: 10 de Junho de 2026</p>

          <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta e utilizar o <strong>Interceptor System</strong> (referido como "Software", "Nós", "Nossa"), você concorda integralmente com estes Termos de Uso e nossa Política de Privacidade. Caso não concorde com qualquer disposição aqui presente, você não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2>2. Descrição do Serviço</h2>
            <p>
              O Interceptor System é uma plataforma Software as a Service (SaaS) voltada para a gestão de facilities e operações condominiais. Oferecemos ferramentas para controle de funcionários, postos de trabalho, gestão de diárias e relatórios financeiros associados. O sistema é operado em um modelo de assinatura empresarial (B2B).
            </p>
          </section>

          <section>
            <h2>3. Privacidade e Proteção de Dados (LGPD)</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), declaramos nosso compromisso com a privacidade e segurança dos seus dados:
            </p>
            <ul>
              <li><strong>Coleta e Finalidade:</strong> Coletamos apenas os dados estritamente necessários para a execução dos serviços contratados (ex: nome da empresa, CNPJ, e-mail de acesso e dados cadastrais de funcionários gerenciados por sua empresa na plataforma).</li>
              <li><strong>Controlador vs Operador:</strong> Sua empresa atua como <em>Controladora</em> dos dados dos seus funcionários e clientes. O Interceptor System atua estritamente como <em>Operador</em>, processando as informações unicamente sob suas instruções e para a finalidade da plataforma.</li>
              <li><strong>Segurança:</strong> Empregamos criptografia em trânsito (HTTPS/TLS) e em repouso. O banco de dados opera sob arquitetura de inquilino isolado (Multi-Tenant seguro), garantindo que seus dados nunca sejam mesclados ou acessados por outros clientes.</li>
              <li><strong>Direitos do Titular:</strong> Garantimos aos titulares dos dados o direito de acesso, correção, anonimização e exclusão de seus dados, que poderão ser solicitados via sistema ou diretamente ao e-mail de suporte.</li>
            </ul>
          </section>

          <section>
            <h2>4. Obrigações do Usuário</h2>
            <p>
              Ao utilizar o Software, você se compromete a:
            </p>
            <ul>
              <li>Fornecer informações cadastrais precisas e mantê-las atualizadas.</li>
              <li>Garantir a confidencialidade das suas credenciais de acesso (senhas e tokens). A responsabilidade pelo uso da conta é integralmente do usuário.</li>
              <li>Possuir a base legal necessária (como consentimento ou legítimo interesse) para inserir dados de terceiros (como seus funcionários e clientes) em nosso sistema.</li>
              <li>Não realizar engenharia reversa, sublicenciar, vender, ou tentar burlar as medidas de segurança e limitação do SaaS.</li>
            </ul>
          </section>

          <section>
            <h2>5. Propriedade Intelectual</h2>
            <p>
              Todos os direitos de propriedade intelectual relativos ao Software, incluindo código-fonte, design, interfaces, logotipos e textos, são de propriedade exclusiva do Interceptor System. A assinatura do serviço não concede nenhuma transferência de propriedade, mas apenas uma licença revogável, não-exclusiva e intransferível de uso.
            </p>
          </section>

          <section>
            <h2>6. Limitação de Responsabilidade</h2>
            <p>
              O Software é fornecido "no estado em que se encontra" (<em>as is</em>). Não nos responsabilizamos por indisponibilidades temporárias causadas por fatores externos (ex: falhas de infraestrutura de nuvem, ataques DDoS) ou por eventuais multas trabalhistas e encargos financeiros oriundos de inconsistências na inserção manual de dados pelo próprio usuário.
            </p>
          </section>

          <section>
            <h2>7. Rescisão e Exclusão de Dados</h2>
            <p>
              Você pode solicitar o cancelamento da sua conta a qualquer momento. Após o cancelamento, seus dados poderão ser retidos por até 60 dias para eventuais auditorias de billing ou restaurabilidade. Após esse prazo, todas as informações sensíveis e pessoais (PII) serão devidamente expurgadas de nossos bancos de dados de forma irrecuperável, conforme diretrizes da LGPD.
            </p>
          </section>

          <section>
            <h2>8. Alterações aos Termos</h2>
            <p>
              Podemos modificar estes Termos ocasionalmente para refletir mudanças na lei ou no Software. Notificaremos os usuários sobre alterações substanciais por meio do e-mail cadastrado ou de avisos na própria plataforma.
            </p>
          </section>

          <section>
            <h2>9. Contato e Encarregado de Dados (DPO)</h2>
            <p>
              Em caso de dúvidas sobre estes termos, solicitações LGPD ou assuntos relacionados a privacidade, entre em contato com nosso DPO (Data Protection Officer) através do e-mail: <strong>dpo&#64;interceptorsystem.com</strong>.
            </p>
          </section>

          <div class="terms-footer">
            <p>Interceptor System &copy; 2026. Todos os direitos reservados.</p>
          </div>
        </article>
      </main>
    </div>
  `,
  styles: [
    `
      .landing-page {
        min-height: 100vh;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: var(--font-sans);
      }

      /* Header */
      .landing-header {
        border-bottom: 1px solid var(--border-subtle);
        background: color-mix(in srgb, var(--surface-card) 85%, transparent);
        padding: 0 2rem;
        height: 72px;
        display: flex;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 10;
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
        height: 6rem;
      }

      /* Main Content */
      .terms-main {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--space-8) var(--space-4) var(--space-16);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-secondary);
        text-decoration: none;
        font-size: var(--text-sm);
        font-weight: var(--fw-medium);
        margin-bottom: var(--space-8);
        transition: color 0.2s;

        &:hover {
          color: var(--primary-color);
        }

        svg {
          flex-shrink: 0;
          font-size: var(--text-lg);
        }
      }

      .terms-content {
        background: var(--surface-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: clamp(var(--space-6), 5vw, var(--space-12));
        box-shadow: var(--shadow-sm);

        h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: var(--fw-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
          line-height: 1.2;
        }

        .last-updated {
          color: var(--text-tertiary);
          font-size: var(--text-sm);
          margin-bottom: var(--space-10);
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: var(--space-6);
        }

        section {
          margin-bottom: var(--space-8);

          h2 {
            font-size: var(--text-lg);
            font-weight: var(--fw-semibold);
            color: var(--text-primary);
            margin-bottom: var(--space-4);
          }

          p {
            font-size: var(--text-base);
            color: var(--text-secondary);
            line-height: 1.7;
            margin-bottom: var(--space-4);
          }

          ul {
            list-style-type: disc;
            padding-left: var(--space-6);
            margin-bottom: var(--space-4);

            li {
              font-size: var(--text-base);
              color: var(--text-secondary);
              line-height: 1.7;
              margin-bottom: var(--space-2);

              strong {
                color: var(--text-primary);
                font-weight: var(--fw-medium);
              }
            }
          }
        }

        .terms-footer {
          margin-top: var(--space-12);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-subtle);
          text-align: center;
          
          p {
            color: var(--text-tertiary);
            font-size: var(--text-sm);
          }
        }
      }
    `
  ]
})
export class TermosUsoComponent implements OnInit {
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode.set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }
}
