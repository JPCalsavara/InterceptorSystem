import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { NgZone } from '@angular/core';

declare var google: any;

import { FormInputComponent } from '../../shared/components/form-input/form-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'

})
export class LoginComponent implements OnInit {
  private fb = new FormBuilder();
  form!: FormGroup;
  erro = signal<string | null>(null);
  carregando = signal(false);
  mostrarSenha = signal(false);
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    this.isDarkMode.set(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    const { email, senha } = this.form.value;

    this.authService.login({ email, senha }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        this.carregando.set(false);
        const msg = err?.error?.mensagem;
        this.erro.set(msg ?? 'Erro ao entrar. Verifique seus dados.');
      },
    });
  }

  loginComGoogle(): void {
    this.carregando.set(true);
    if (typeof google === 'undefined') {
      this.erro.set('O Google Identity Services não pôde ser carregado. Verifique sua conexão.');
      this.carregando.set(false);
      return;
    }

    if (!environment.googleClientId || environment.googleClientId.startsWith('COLOQUE_SEU_CLIENT_ID')) {
      this.erro.set('O Client ID do Google não está configurado no arquivo environment.ts.');
      this.carregando.set(false);
      return;
    }

    // Inicializa o prompt de login do Google
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.ngZone.run(() => this.handleGoogleCredentialResponse(response))
    });

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        this.erro.set('O pop-up de login do Google foi bloqueado pelo navegador ou ignorado.');
        this.carregando.set(false);
      }
    });
  }

  private handleGoogleCredentialResponse(response: any): void {
    if (response.credential) {
      this.authService.loginGoogle({ idToken: response.credential }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err: any) => {
          this.carregando.set(false);
          const msg = err?.error?.mensagem;
          this.erro.set(msg ?? 'Erro ao autenticar com o Google.');
        }
      });
    } else {
      this.carregando.set(false);
      this.erro.set('Falha ao obter credenciais do Google.');
    }
  }
}
