import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgxMaskDirective } from 'ngx-mask';
import { cnpjValidator } from '../../shared/validators/br-documents.validators';

import { FormInputComponent } from '../../shared/components/form-input/form-input.component';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormInputComponent],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent implements OnInit {
  private fb = new FormBuilder();
  form: FormGroup;
  erro = signal<string | null>(null);
  carregando = signal(false);
  mostrarSenha = signal(false);
  isDarkMode = signal(false);
  logoSrc = computed(() => this.isDarkMode() ? '/logo-branca.png' : '/logo-preta.png');

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      nomeEmpresa: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [cnpjValidator]],
      email: ['', [Validators.required, Validators.email]],
      senha: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
      ],
      termos: [false, Validators.requiredTrue],
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

    const { nomeEmpresa, cnpj, email, senha } = this.form.value;

    this.authService
      .registrar({
        nomeEmpresa,
        cnpj: cnpj || undefined,
        email,
        senha,
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.carregando.set(false);
          const msg = err?.error?.mensagem;
          this.erro.set(msg ?? 'Erro ao criar conta. Tente novamente.');
        },
      });
  }
}
