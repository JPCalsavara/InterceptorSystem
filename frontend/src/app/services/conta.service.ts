import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContaPerfilOutput {
  empresaId: string;
  nomeEmpresa: string;
  email: string;
  cnpj: string | null;
  plano: string;
  createdAt: string;
}

export interface AtualizarContaInput {
  nomeEmpresa?: string;
  email?: string;
  senhaAtual?: string;
  novaSenha?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/conta`;

  getPerfil(): Observable<ContaPerfilOutput> {
    return this.http.get<ContaPerfilOutput>(this.apiUrl);
  }

  atualizarPerfil(input: AtualizarContaInput): Observable<ContaPerfilOutput> {
    return this.http.put<ContaPerfilOutput>(this.apiUrl, input);
  }
}
