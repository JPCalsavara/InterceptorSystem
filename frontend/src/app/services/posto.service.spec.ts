import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PostoService } from './posto.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { Posto } from '../models/index';

describe('PostoService', () => {
  let service: PostoService;
  let httpMock: HttpTestingController;

  const apiBase = 'http://localhost';
  const mockPostos: Posto[] = [
    {
      id: 'p1',
      clienteId: 'c1',
      nome: 'Portaria Principal',
      cep: '01310-100',
      endereco: 'Av. Paulista',
      numero: '1000',
      cidade: 'São Paulo',
      estado: 'SP',
      ativo: true,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PostoService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PostoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reutiliza cache em getAll sem nova HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);

    service.getAll().subscribe((data) => expect(data.length).toBe(1));
    httpMock.expectNone(`${apiBase}/api/postos`);
  });

  it('invalida cache após create e refaz getAll', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);

    service.create({ clienteId: 'c1', nome: 'Novo Posto', endereco: 'Rua X' } as any).subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/postos`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockPostos[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);
  });

  it('invalida cache após update', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);

    service.update('p1', { nome: 'Portaria Atualizada' } as any).subscribe();
    httpMock.expectOne(`${apiBase}/api/postos/p1`).flush(mockPostos[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);
  });

  it('chama invalidateAll após delete', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);

    service.delete('p1').subscribe();
    httpMock.expectOne(`${apiBase}/api/postos/p1`).flush(null);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/postos`).flush(mockPostos);
  });

  it('getByClienteId usa endpoint /api/clientes/:id/postos', () => {
    service.getByClienteId('c1').subscribe((data) => expect(data.length).toBe(1));

    const req = httpMock.expectOne(`${apiBase}/api/clientes/c1/postos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPostos);
  });
});
