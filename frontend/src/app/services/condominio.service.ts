import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Condominio, CreateCondominioDto, UpdateCondominioDto } from '../models/condominio.model';

@Injectable({
  providedIn: 'root',
})
export class CondominioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/condominios`;

  getAll(): Observable<Condominio[]> {
    return this.http.get<Condominio[]>(this.apiUrl);
  }

  getById(id: string): Observable<Condominio> {
    return this.http.get<Condominio>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateCondominioDto): Observable<Condominio> {
    return this.http.post<Condominio>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateCondominioDto): Observable<Condominio> {
    return this.http.put<Condominio>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
