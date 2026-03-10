import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Diaria, CreateDiariaDto, UpdateDiariaDto } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class DiariaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/diarias`;

  getAll(): Observable<Diaria[]> {
    return this.http.get<Diaria[]>(this.apiUrl);
  }

  getById(id: string): Observable<Diaria> {
    return this.http.get<Diaria>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateDiariaDto): Observable<Diaria> {
    return this.http.post<Diaria>(this.apiUrl, dto);
  }

  /**
   * Cria múltiplas diárias em lote (batch)
   * Usado ao cadastrar funcionário para criar todas as diárias de uma vez
   */
  createBatch(diarias: CreateDiariaDto[]): Observable<Diaria[]> {
    return this.http.post<Diaria[]>(`${this.apiUrl}/batch`, { diarias });
  }

  update(id: string, dto: UpdateDiariaDto): Observable<Diaria> {
    return this.http.put<Diaria>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
