import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContatoInput {
  nome: string;
  cidade: string;
  estado: string;
  email: string;
  descricao: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContatoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/contato`;

  enviar(input: ContatoInput): Observable<void> {
    return this.http.post<void>(this.apiUrl, input);
  }
}
