import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DiariaService } from './diaria.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { Diaria, StatusDiaria, TipoDiaria } from '../models/index';

describe('DiariaService', () => {
  let service: DiariaService;
  let httpMock: HttpTestingController;

  const apiBase = 'http://localhost';
  const mockDiarias: Diaria[] = [
    {
      id: 'd1',
      alocacaoId: 'al1',
      funcionarioId: 'f1',
      data: '2026-03-01',
      statusDiaria: StatusDiaria.CONFIRMADA,
      tipoDiaria: TipoDiaria.REGULAR,
      valorDiaria: 150,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DiariaService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DiariaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reutiliza cache em getAll sem nova HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectOne(`${apiBase}/api/diarias`).flush(mockDiarias);

    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectNone(`${apiBase}/api/diarias`);
  });

  it('invalida cache após create e refaz getAll', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/diarias`).flush(mockDiarias);

    service
      .create({ alocacaoId: 'al1', funcionarioId: 'f1', data: '2026-03-02' } as any)
      .subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/diarias`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockDiarias[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/diarias`).flush(mockDiarias);
  });

  it('createBatch envia POST para /api/diarias/batch e invalida cache', () => {
    const batch = [
      { alocacaoId: 'al1', funcionarioId: 'f1', data: '2026-03-01' } as any,
      { alocacaoId: 'al1', funcionarioId: 'f1', data: '2026-03-02' } as any,
    ];

    service.createBatch(batch).subscribe((result) => expect(result.length).toBe(2));

    const req = httpMock.expectOne(`${apiBase}/api/diarias/batch`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ diarias: batch });
    req.flush([mockDiarias[0], { ...mockDiarias[0], id: 'd2', data: '2026-03-02' }]);
  });

  it('getResumoByContrato usa GET com query params de ano e mês', () => {
    const mockResumo = { contratoId: 'ct1', diarias: [] };

    service.getResumoByContrato('ct1', 2026, 3).subscribe((r) => {
      expect(r.contratoId).toBe('ct1');
    });

    const req = httpMock.expectOne((r) => r.url === `${apiBase}/api/diarias/contrato/ct1/resumo`);
    expect(req.request.params.get('ano')).toBe('2026');
    expect(req.request.params.get('mes')).toBe('3');
    req.flush(mockResumo);
  });

  it('getByClienteId usa endpoint /api/clientes/:id/diarias', () => {
    service.getByClienteId('c1').subscribe((data) => expect(data.length).toBe(1));

    const req = httpMock.expectOne(`${apiBase}/api/clientes/c1/diarias`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDiarias);
  });

  it('chama invalidateAll após delete', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/diarias`).flush(mockDiarias);

    service.delete('d1').subscribe();
    httpMock.expectOne(`${apiBase}/api/diarias/d1`).flush(null);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/diarias`).flush(mockDiarias);
  });
});
