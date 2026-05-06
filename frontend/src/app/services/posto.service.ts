import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Posto, CreatePostoDto, UpdatePostoDto } from '../models/index';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class PostoService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/postos`;

  private _cache = signal<Posto[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('posto', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Posto[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Posto[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  getById(id: string): Observable<Posto> {
    return this.http.get<Posto>(`${this.apiUrl}/${id}`);
  }

  getByClienteId(clienteId: string): Observable<Posto[]> {
    return this.http.get<Posto[]>(`${environment.apiUrl}/api/clientes/${clienteId}/postos`);
  }

  create(dto: CreatePostoDto): Observable<Posto> {
    return this.http
      .post<Posto>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('posto')));
  }

  update(id: string, dto: UpdatePostoDto): Observable<Posto> {
    return this.http
      .put<Posto>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('posto')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateAll()));
  }
}
