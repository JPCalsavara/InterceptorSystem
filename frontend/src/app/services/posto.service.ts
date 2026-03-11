import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Posto,
  CreatePostoDto,
  UpdatePostoDto,
} from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class PostoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/postos`;

  getAll(): Observable<Posto[]> {
    return this.http.get<Posto[]>(this.apiUrl);
  }

  getById(id: string): Observable<Posto> {
    return this.http.get<Posto>(`${this.apiUrl}/${id}`);
  }

  getByClienteId(clienteId: string): Observable<Posto[]> {
    return this.http.get<Posto[]>(`${environment.apiUrl}/api/clientes/${clienteId}/postos`);
  }



  create(dto: CreatePostoDto): Observable<Posto> {
    return this.http.post<Posto>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdatePostoDto): Observable<Posto> {
    return this.http.put<Posto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
