import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Alocacao, CreateAlocacaoDto, UpdateAlocacaoDto } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class AlocacaoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/alocacoes`;

  getAll(): Observable<Alocacao[]> {
    return this.http.get<Alocacao[]>(this.apiUrl);
  }

  getById(id: string): Observable<Alocacao> {
    return this.http.get<Alocacao>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateAlocacaoDto): Observable<Alocacao> {
    return this.http.post<Alocacao>(this.apiUrl, dto);
  }

  /**
   * Cria múltiplas alocações em lote (batch)
   * Usado ao cadastrar funcionário para criar todas as alocações de uma vez
   */
  createBatch(alocacoes: CreateAlocacaoDto[]): Observable<Alocacao[]> {
    return this.http.post<Alocacao[]>(`${this.apiUrl}/batch`, { alocacoes });
  }

  update(id: string, dto: UpdateAlocacaoDto): Observable<Alocacao> {
    return this.http.put<Alocacao>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
