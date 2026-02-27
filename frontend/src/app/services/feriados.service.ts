import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeriadosService {
  private cache = new Map<number, Map<string, string>>();

  private calcularPascoa(ano: number): Date {
    // Meeus/Jones/Butcher algorithm
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31); // 1-based
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(ano, mes - 1, dia);
  }

  private addDias(date: Date, dias: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + dias);
    return d;
  }

  private toISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private buildFeriadosDoAno(ano: number): Map<string, string> {
    const map = new Map<string, string>();

    // Feriados fixos nacionais
    map.set(`${ano}-01-01`, 'Confraternização Universal');
    map.set(`${ano}-04-21`, 'Tiradentes');
    map.set(`${ano}-05-01`, 'Dia do Trabalhador');
    map.set(`${ano}-09-07`, 'Independência do Brasil');
    map.set(`${ano}-10-12`, 'Nossa Sra. Aparecida');
    map.set(`${ano}-11-02`, 'Finados');
    map.set(`${ano}-11-15`, 'Proclamação da República');
    map.set(`${ano}-11-20`, 'Consciência Negra');
    map.set(`${ano}-12-25`, 'Natal');

    // Feriados móveis baseados na Páscoa
    const pascoa = this.calcularPascoa(ano);
    map.set(this.toISO(this.addDias(pascoa, -48)), 'Carnaval (segunda)');
    map.set(this.toISO(this.addDias(pascoa, -47)), 'Carnaval (terça)');
    map.set(this.toISO(this.addDias(pascoa, -2)), 'Sexta-feira Santa');
    map.set(this.toISO(pascoa), 'Páscoa');
    map.set(this.toISO(this.addDias(pascoa, 60)), 'Corpus Christi');

    return map;
  }

  private getFeriadosMap(ano: number): Map<string, string> {
    if (!this.cache.has(ano)) {
      this.cache.set(ano, this.buildFeriadosDoAno(ano));
    }
    return this.cache.get(ano)!;
  }

  isFeriado(dateStr: string): boolean {
    const ano = parseInt(dateStr.substring(0, 4), 10);
    return this.getFeriadosMap(ano).has(dateStr);
  }

  getFeriadoNome(dateStr: string): string | null {
    const ano = parseInt(dateStr.substring(0, 4), 10);
    return this.getFeriadosMap(ano).get(dateStr) ?? null;
  }

  getDayCellClasses(date: Date, dateStr: string): Record<string, boolean> {
    const dow = date.getDay();
    return {
      'dia-domingo': dow === 0,
      'dia-sabado': dow === 6,
      'dia-feriado': this.isFeriado(dateStr),
    };
  }
}
