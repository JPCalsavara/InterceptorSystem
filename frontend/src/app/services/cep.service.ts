import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface CepAddress {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
}

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private http = inject(HttpClient);

  buscarCep(cep: string): Observable<CepAddress> {
    const cepDigits = this.onlyDigits(cep);

    return this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cepDigits}/json/`).pipe(
      map((response) => {
        if (response.erro) {
          throw new Error('CEP nao encontrado.');
        }

        return {
          cep: response.cep,
          logradouro: response.logradouro,
          complemento: response.complemento,
          bairro: response.bairro,
          cidade: response.localidade,
          estado: response.uf,
        };
      }),
    );
  }

  onlyDigits(value: string): string {
    return (value || '').replace(/\D/g, '');
  }

  formatCep(value: string): string {
    const digits = this.onlyDigits(value).slice(0, 8);
    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  isCepValido(value: string): boolean {
    return this.onlyDigits(value).length === 8;
  }
}
