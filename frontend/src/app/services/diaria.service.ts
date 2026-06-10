import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Diaria,
  CreateDiariaDto,
  UpdateDiariaDto,
  DiariasContratoResumo,
  ContratoResumoFinanceiro,
  DiariaSubstituicaoDto,
} from '../models/index';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';

@Injectable({
  providedIn: 'root',
})
export class DiariaService {
  private http = inject(HttpClient);
  private cacheCoordinator = inject(EntityCacheCoordinatorService);
  private apiUrl = `${environment.apiUrl}/api/diarias`;

  private _cache = signal<Diaria[] | null>(null);

  constructor() {
    this.cacheCoordinator.registerInvalidator('diaria', () => this.invalidateCache());
  }

  private invalidateCache(): void {
    this._cache.set(null);
  }

  getAll(): Observable<Diaria[]> {
    const cached = this._cache();
    if (cached !== null) return of(cached);
    return this.http.get<Diaria[]>(this.apiUrl).pipe(tap((data) => this._cache.set(data)));
  }

  getById(id: string): Observable<Diaria> {
    return this.http.get<Diaria>(`${this.apiUrl}/${id}`);
  }

  getByClienteId(clienteId: string): Observable<Diaria[]> {
    return this.http.get<Diaria[]>(`${environment.apiUrl}/api/clientes/${clienteId}/diarias`);
  }

  create(dto: CreateDiariaDto): Observable<Diaria> {
    return this.http
      .post<Diaria>(this.apiUrl, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('diaria')));
  }

  /**
   * Cria múltiplas diárias em lote (batch)
   * Usado ao cadastrar funcionário para criar todas as diárias de uma vez
   */
  createBatch(diarias: CreateDiariaDto[]): Observable<Diaria[]> {
    return this.http
      .post<Diaria[]>(`${this.apiUrl}/batch`, { diarias })
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('diaria')));
  }

  update(id: string, dto: UpdateDiariaDto): Observable<Diaria> {
    return this.http
      .put<Diaria>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.cacheCoordinator.invalidateWithDependencies('diaria')));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.cacheCoordinator.invalidateAll()));
  }

  getResumoByContrato(
    contratoId: string,
    ano: number,
    mes: number,
  ): Observable<DiariasContratoResumo> {
    return this.http.get<DiariasContratoResumo>(`${this.apiUrl}/contrato/${contratoId}/resumo`, {
      params: { ano: ano.toString(), mes: mes.toString() },
    });
  }

  getResumoFinanceiroByContrato(
    contratoId: string,
    ano: number,
    mes: number,
  ): Observable<ContratoResumoFinanceiro> {
    return this.http.get<ContratoResumoFinanceiro>(
      `${this.apiUrl}/contrato/${contratoId}/resumo-financeiro`,
      {
        params: { ano: ano.toString(), mes: mes.toString() },
      },
    );
  }

  getSubstituicoes(): Observable<DiariaSubstituicaoDto[]> {
    return this.http.get<DiariaSubstituicaoDto[]>(`${this.apiUrl}/substituicoes`);
  }
}
