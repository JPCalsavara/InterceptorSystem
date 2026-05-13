import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TagService } from './tag.service';
import { EntityCacheCoordinatorService } from './entity-cache-coordinator.service';
import { Tag } from '../models/index';

describe('TagService', () => {
  let service: TagService;
  let httpMock: HttpTestingController;

  const apiBase = '';
  const mockTags: Tag[] = [
    { id: 't1', nome: 'Vigilante', valor: 150, descricao: 'Guarda patrimonial' },
    { id: 't2', nome: 'Supervisor', valor: 200 },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TagService,
        EntityCacheCoordinatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('reutiliza cache em getAll sem nova HTTP call', () => {
    service.getAll().subscribe((data) => expect(data.length).toBe(2));
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);

    service.getAll().subscribe((data) => expect(data.length).toBe(2));
    httpMock.expectNone(`${apiBase}/api/tags`);
  });

  it('invalida cache e dependentes após create', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);

    service.create({ nome: 'Nova Tag', valor: 100 }).subscribe();

    const createReq = httpMock.expectOne(`${apiBase}/api/tags`);
    expect(createReq.request.method).toBe('POST');
    createReq.flush(mockTags[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);
  });

  it('invalida cache e dependentes após update', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);

    service.update('t1', { nome: 'Vigilante Atualizado', valor: 160 }).subscribe();
    httpMock.expectOne(`${apiBase}/api/tags/t1`).flush(mockTags[0]);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);
  });

  it('chama invalidateAll após delete', () => {
    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);

    service.delete('t1').subscribe();
    httpMock.expectOne(`${apiBase}/api/tags/t1`).flush(null);

    service.getAll().subscribe();
    httpMock.expectOne(`${apiBase}/api/tags`).flush(mockTags);
  });

  it('getById busca diretamente sem cache', () => {
    service.getById('t1').subscribe((t) => expect(t.nome).toBe('Vigilante'));
    const req = httpMock.expectOne(`${apiBase}/api/tags/t1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTags[0]);
  });
});
