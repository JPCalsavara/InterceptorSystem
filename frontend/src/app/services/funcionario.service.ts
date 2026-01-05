import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Funcionario, CreateFuncionarioDto, UpdateFuncionarioDto } from '../models/index';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/funcionarios`;

  getAll(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(this.apiUrl);
  }

  getById(id: string): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateFuncionarioDto): Observable<Funcionario> {
    return this.http.post<Funcionario>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateFuncionarioDto): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
