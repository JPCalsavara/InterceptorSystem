import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SessaoWhatsappDto {
  id: string;
  telefone: string;
  contaId: string;
  estado: number;
  clienteIdSelecionado?: string;
  postoIdSelecionado?: string;
  dataSelecionada?: string;
  diariaIdParaSubstituir?: string;
  funcionarioSubstitutoId?: string;
  criadoEm: string;
  ultimaAtividade: string;
}

@Injectable({
  providedIn: 'root'
})
export class WhatsappSessoesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/whatsapp/sessoes`;

  getAll(): Observable<SessaoWhatsappDto[]> {
    return this.http.get<SessaoWhatsappDto[]>(this.apiUrl);
  }
}
