import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PostoDeTrabalho,
  CreatePostoDeTrabalhoDto,
  UpdatePostoDeTrabalhoDto,
} from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class PostoDeTrabalhoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/postos-de-trabalho`;

  getAll(): Observable<PostoDeTrabalho[]> {
    return this.http.get<PostoDeTrabalho[]>(this.apiUrl);
  }

  getById(id: string): Observable<PostoDeTrabalho> {
    return this.http.get<PostoDeTrabalho>(`${this.apiUrl}/${id}`);
  }

  getByCondominioId(condominioId: string): Observable<PostoDeTrabalho[]> {
    return this.http.get<PostoDeTrabalho[]>(`${this.apiUrl}/condominio/${condominioId}`);
  }

  create(dto: CreatePostoDeTrabalhoDto): Observable<PostoDeTrabalho> {
    return this.http.post<PostoDeTrabalho>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdatePostoDeTrabalhoDto): Observable<PostoDeTrabalho> {
    return this.http.put<PostoDeTrabalho>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
