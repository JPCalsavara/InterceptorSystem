import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Alocacao, CreateAlocacaoDto, UpdateAlocacaoDto } from '../models';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class AlocacaoService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/alocacao`;

  private _cache = signal<Alocacao[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('alocacao', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Alocacao[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Alocacao[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
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

  getByClienteId(clienteId: string): Observable<Alocacao[]> {
    return this.http.get<Alocacao[]>(`${environment.apiUrl}/api/clientes/${clienteId}/alocacoes`);
  }

  create(dto: CreateAlocacaoDto): Observable<Alocacao> {
    return this.http
      .post<Alocacao>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('alocacao')));
  }

  update(id: string, dto: UpdateAlocacaoDto): Observable<Alocacao> {
    return this.http
      .put<Alocacao>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('alocacao')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('alocacao')));
  }
}
