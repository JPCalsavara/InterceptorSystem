import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Tag } from '../models/index';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

export interface CreateTagDto {
  nome: string;
  valor: number;
  descricao?: string;
}

export interface UpdateTagDto {
  nome: string;
  valor: number;
  descricao?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/tags`;

  private _cache = signal<Tag[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('tag', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Tag[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Tag[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  getById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateTagDto): Observable<Tag> {
    return this.http
      .post<Tag>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('tag')));
  }

  update(id: string, dto: UpdateTagDto): Observable<Tag> {
    return this.http
      .put<Tag>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('tag')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateAll()));
  }
}
