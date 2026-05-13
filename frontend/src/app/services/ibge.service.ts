import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

export interface IbgeEstado {
  id: number;
  sigla: string;
  nome: string;
}

export interface IbgeMunicipio {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class IbgeService {
  private http = inject(HttpClient);

  // Cached states
  private estadosCache$?: Observable<IbgeEstado[]>;
  private municipiosCache: { [uf: string]: Observable<IbgeMunicipio[]> } = {};

  getEstados(): Observable<IbgeEstado[]> {
    if (!this.estadosCache$) {
      this.estadosCache$ = this.http
        .get<
          IbgeEstado[]
        >('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
        .pipe(shareReplay(1));
    }
    return this.estadosCache$;
  }

  getMunicipiosPorEstado(uf: string): Observable<IbgeMunicipio[]> {
    if (!this.municipiosCache[uf]) {
      this.municipiosCache[uf] = this.http
        .get<
          IbgeMunicipio[]
        >(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
        .pipe(shareReplay(1));
    }
    return this.municipiosCache[uf];
  }
}
