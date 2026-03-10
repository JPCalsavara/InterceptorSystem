import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Alocacao, CreateAlocacaoDto, UpdateAlocacaoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AlocacaoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/alocacao`;

  getAll(): Observable<Alocacao[]> {
    return this.http.get<Alocacao[]>(this.apiUrl);
  }

  getById(id: string): Observable<Alocacao> {
    return this.http.get<Alocacao>(`${this.apiUrl}/${id}`);
  }

  getByPostoId(postoId: string): Observable<Alocacao[]> {
    return this.http.get<Alocacao[]>(`${this.apiUrl}/posto/${postoId}`);
  }

  getByContratoId(contratoId: string): Observable<Alocacao[]> {
    return this.http.get<Alocacao[]>(`${this.apiUrl}/contrato/${contratoId}`);
  }

  create(dto: CreateAlocacaoDto): Observable<Alocacao> {
    return this.http.post<Alocacao>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateAlocacaoDto): Observable<Alocacao> {
    return this.http.put<Alocacao>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
