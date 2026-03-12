import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Funcionario, CreateFuncionarioDto, UpdateFuncionarioDto } from '../models/index';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/funcionarios`;

  private _cache = signal<Funcionario[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('funcionario', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Funcionario[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Funcionario[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  getById(id: string): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/${id}`);
  }

  getByClienteId(clienteId: string): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(
      `${environment.apiUrl}/api/clientes/${clienteId}/funcionarios`,
    );
  }

  create(dto: CreateFuncionarioDto): Observable<Funcionario> {
    return this.http
      .post<Funcionario>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('funcionario')));
  }

  update(id: string, dto: UpdateFuncionarioDto): Observable<Funcionario> {
    return this.http
      .put<Funcionario>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('funcionario')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('funcionario')));
  }
}
