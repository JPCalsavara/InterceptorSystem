import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contrato, CreateContratoDto, UpdateContratoDto } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class ContratoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/contratos`;

  getAll(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(this.apiUrl);
  }

  getById(id: string): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateContratoDto): Observable<Contrato> {
    return this.http.post<Contrato>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateContratoDto): Observable<Contrato> {
    return this.http.put<Contrato>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
