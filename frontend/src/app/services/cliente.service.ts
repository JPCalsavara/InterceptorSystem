import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '../models/cliente.model';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/clientes`;
  private apiUrlCompleto = `${environment.apiUrl}/api/clientes-completos`;

  private _cache = signal<Cliente[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('cliente', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Cliente[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Cliente[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  /** Força busca via HTTP ignorando o cache local. Usar após operações de delete. */
  forceRefresh(): Observable<Cliente[]> {
    this._cache.set(null);
    return this.http.get<Cliente[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateClienteDto): Observable<Cliente> {
    return this.http
      .post<Cliente>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('cliente')));
  }

  createCompleto(dto: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrlCompleto, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('cliente')));
  }

  update(id: string, dto: UpdateClienteDto): Observable<Cliente> {
    return this.http
      .put<Cliente>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('cliente')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateAll()));
  }
}
