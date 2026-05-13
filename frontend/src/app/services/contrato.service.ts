import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Contrato, CreateContratoDto, UpdateContratoDto } from '../models/index';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class ContratoService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/contratos`;
  private apiUrlCalculos = `${environment.apiUrl}/api/contratos/calculos`;

  private _cache = signal<Contrato[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('contrato', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Contrato[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Contrato[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  getById(id: string): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.apiUrl}/${id}`);
  }

  getByClienteId(clienteId: string): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${environment.apiUrl}/api/clientes/${clienteId}/contratos`);
  }

  create(dto: CreateContratoDto): Observable<Contrato> {
    return this.http
      .post<Contrato>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('contrato')));
  }

  update(id: string, dto: UpdateContratoDto): Observable<Contrato> {
    return this.http
      .put<Contrato>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('contrato')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateAll()));
  }

  /**
   * Calcula valor total mensal baseado nos parâmetros do contrato
   * Usa API de cálculos para garantir consistência com backend
   */
  calcularValorTotal(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlCalculos}/calcular-valor-total`, payload);
  }
}
