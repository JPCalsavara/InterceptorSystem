import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  signal,
  computed,
  effect,
  inject,
  HostListener
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ContatoService, ContatoInput } from '../../services/contato.service';

// Components
import { LandingHeaderComponent } from './components/landing-header.component';
import { LandingHeroComponent } from './components/landing-hero.component';
import { LandingAboutComponent } from './components/landing-about.component';
import { LandingServicesComponent } from './components/landing-services.component';
import { LandingSystemComponent } from './components/landing-system.component';
import { LandingStatsComponent } from './components/landing-stats.component';
import { LandingLeaderComponent } from './components/landing-leader.component';
import { LandingCtaComponent } from './components/landing-cta.component';
import { LandingContactComponent } from './components/landing-contact.component';
import { LandingFooterComponent } from './components/landing-footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    LandingHeaderComponent,
    LandingHeroComponent,
    LandingAboutComponent,
    LandingServicesComponent,
    LandingSystemComponent,
    LandingStatsComponent,
    LandingLeaderComponent,
    LandingCtaComponent,
    LandingContactComponent,
    LandingFooterComponent
  ],
  template: `
    <app-landing-header
      [isDarkMode]="isDarkMode()"
      [isMobileMenuOpen]="isMobileMenuOpen()"
      [isHeaderVisible]="isHeaderVisible()"
      (menuToggle)="toggleMobileMenu()"
      (themeToggle)="toggleTheme()"
    />

    <main>
      <app-landing-hero class="reveal-section" />
      <app-landing-about class="reveal-section" />
      <app-landing-services class="reveal-section" />
      <app-landing-stats class="reveal-section" />
      <app-landing-system class="reveal-section" />
      <app-landing-leader class="reveal-section" />
      <app-landing-cta class="reveal-section" />
      
      <app-landing-contact
        class="reveal-section"
        [isSubmitting]="isContactSubmitting()"
        [message]="contactMessage()"
        (submitForm)="onContactSubmit($event)"
      />
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
  `]
})
export class LandingComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private contatoService = inject(ContatoService);

  // State
  isDarkMode = signal(false);
  isMobileMenuOpen = signal(false);
  isHeaderVisible = signal(true);
  
  // Contact State
  isContactSubmitting = signal(false);
  contactMessage = signal<string | null>(null);

  private lastScrollY = 0;
  private scrollThreshold = 100;
  private observer: IntersectionObserver | null = null;

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
    
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Header Handlers
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

  // Form Handler
  onContactSubmit(formData: ContatoInput): void {
    if (this.isContactSubmitting()) return;
    
    this.isContactSubmitting.set(true);
    this.contactMessage.set(null);

    this.contatoService.enviar(formData).subscribe({
      next: () => {
        this.contactMessage.set('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        this.isContactSubmitting.set(false);
      },
      error: () => {
        this.contactMessage.set('Erro ao enviar mensagem. Tente novamente ou entre em contato pelo e-mail.');
        this.isContactSubmitting.set(false);
      }
    });
  }

  // Performance optimized scroll using HostListener and passive flag instead of direct event listener attachment
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

  // Visual effects
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

  // Theme Management
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
