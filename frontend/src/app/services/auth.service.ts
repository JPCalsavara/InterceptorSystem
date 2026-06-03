import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface RegistrarContaDto {
  email: string;
  senha: string;
  nomeEmpresa: string;
  cnpj?: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export interface AuthResult {
  empresaId: string;
  nomeEmpresa: string;
  email: string;
  plano: string;
  token: string;
  emailVerificado: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  currentUser = signal<AuthResult | null>(this.getUser());

  registrar(dto: RegistrarContaDto): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/registrar`, dto)
      .pipe(tap((result) => this.armazenarSessao(result)));
  }

  login(dto: LoginDto): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/login`, dto)
      .pipe(tap((result) => this.armazenarSessao(result)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AuthResult | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isEmailVerificado(): boolean {
    return this.currentUser()?.emailVerificado ?? false;
  }

  isAdmin(): boolean {
    return this.currentUser()?.email === 'admin@gmail.com';
  }

  atualizarEmailVerificado(emailVerificado: boolean): void {
    this.atualizarUser({ emailVerificado });
  }

  atualizarUser(
    dados: Partial<Pick<AuthResult, 'nomeEmpresa' | 'email' | 'plano' | 'emailVerificado'>>,
  ): void {
    const user = this.currentUser();
    if (!user) return;
    const updated = { ...user, ...dados };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
    this.currentUser.set(updated);
  }

  confirmarEmail(token: string): Observable<{ mensagem: string }> {
    return this.http
      .post<{ mensagem: string }>(`${this.apiUrl}/email/confirmar`, { token })
      .pipe(tap(() => this.atualizarEmailVerificado(true)));
  }

  reenviarVerificacaoEmail(): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/email/reenviar`, {});
  }

  solicitarResetSenha(email: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/senha/solicitar-reset`, { email });
  }

  confirmarResetSenha(token: string, novaSenha: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/senha/confirmar-reset`, {
      token,
      novaSenha,
    });
  }

  solicitarAlteracaoEmail(novoEmail: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/email/solicitar-alteracao`, {
      novoEmail,
    });
  }

  confirmarAlteracaoEmail(token: string): Observable<{ mensagem: string }> {
    return this.http.post<{ mensagem: string }>(`${this.apiUrl}/email/confirmar-alteracao`, {
      token,
    });
  }

  private armazenarSessao(result: AuthResult): void {
    localStorage.setItem(this.TOKEN_KEY, result.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(result));
    this.currentUser.set(result);
  }
}
