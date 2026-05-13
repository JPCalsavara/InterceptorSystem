import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AlocacaoService } from './alocacao.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { TipoEscala } from '../models';

describe('AlocacaoService cache behavior', () => {
  let service: AlocacaoService;
  let httpMock: HttpTestingController;

  const apiBase = '';
  const mockList = [
    {
      id: 'a1',
      postoId: 'p1',
      contratoId: 'c1',
      horarioInicio: '06:00:00',
      horarioFim: '18:00:00',
      tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
      permiteDobrarEscala: true,
      temHorarioNoturno: false,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AlocacaoService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AlocacaoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('reuses cached getAll response without second HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(1));

    const req1 = httpMock.expectOne(`${apiBase}/api/alocacao`);
    expect(req1.request.method).toBe('GET');
    req1.flush(mockList);

    service.getAll().subscribe((data) => expect(data.length).toBe(1));

    httpMock.expectNone(`${apiBase}/api/alocacao`);
  });

  it('invalidates cache after create and fetches fresh getAll', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/alocacao`).flush(mockList);

    service
      .create({
        postoId: 'p1',
        contratoId: 'c1',
        horarioInicio: '08:00:00',
        horarioFim: '20:00:00',
        tipoEscala: TipoEscala.DOZE_POR_TRINTA_SEIS,
        permiteDobrarEscala: false,
      })
      .subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/alocacao`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockList[0]);

    service.getAll().subscribe();
    const reqAfterInvalidate = httpMock.expectOne(`${apiBase}/api/alocacao`);
    expect(reqAfterInvalidate.request.method).toBe('GET');
    reqAfterInvalidate.flush(mockList);
  });

  it('uses cliente-scoped endpoint when requested', () => {
    service.getByClienteId('cliente-123').subscribe((data) => expect(data.length).toBe(1));

    const req = httpMock.expectOne(`${apiBase}/api/clientes/cliente-123/alocacoes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockList);
  });
});
