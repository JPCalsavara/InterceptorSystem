import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';
import { TagListComponent } from './tag-list.component';
import { TagService } from '../../../services/tag.service';

const mockTags = [
  { id: 't1', nome: 'Vigilante', valor: 150, descricao: 'Guarda patrimonial' },
  { id: 't2', nome: 'Supervisor', valor: 200, descricao: null },
];

const buildTagService = (overrides: Partial<Record<string, ReturnType<typeof vi.fn>>> = {}) => ({
  getAll: vi.fn(() => of([...mockTags])),
  create: vi.fn(() => of(mockTags[0])),
  update: vi.fn(() => of(mockTags[0])),
  delete: vi.fn(() => of(undefined)),
  ...overrides,
});

const setup = (serviceOverrides = {}) =>
  render(TagListComponent, {
    providers: [{ provide: TagService, useValue: buildTagService(serviceOverrides) }],
  });

describe('TagListComponent', () => {
  it('renderiza a lista de tags carregadas', async () => {
    await setup();

    expect(screen.getByText('Vigilante')).toBeInTheDocument();
    expect(screen.getByText('Supervisor')).toBeInTheDocument();
  });

  it('exibe o contador de resultados correto', async () => {
    await setup();

    expect(screen.getByText(/Mostrando 2 de 2 tag/)).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando o serviço falha', async () => {
    await setup({
      getAll: vi.fn(() => throwError(() => new Error('Erro de servidor'))),
    });

    expect(screen.getByText(/Erro ao carregar tags/)).toBeInTheDocument();
  });

  it('abre o modal de criação ao clicar em "+ Nova Tag"', async () => {
    await setup();

    await userEvent.click(screen.getByRole('button', { name: /\+ Nova Tag/ }));

    expect(screen.getByRole('heading', { name: 'Nova Tag' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor base/)).toBeInTheDocument();
  });

  it('abre o modal de edição com dados preenchidos ao clicar em Editar', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.openEdit(mockTags[0] as any);
    fixture.detectChanges();

    expect(screen.getByRole('heading', { name: 'Editar Tag' })).toBeInTheDocument();
    const nomeInput = screen.getByLabelText(/Nome/) as HTMLInputElement;
    expect(nomeInput.value).toBe('Vigilante');
  });

  it('fecha o modal ao clicar em Cancelar', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.openCreate();
    fixture.detectChanges();
    expect(screen.queryByRole('heading', { name: 'Nova Tag' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('heading', { name: 'Nova Tag' })).not.toBeInTheDocument();
  });

  it('filtra tags pelo signal filtroNome', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.filtroNome.set('super');
    fixture.detectChanges();

    expect(screen.getByText('Supervisor')).toBeInTheDocument();
    expect(screen.queryByText('Vigilante')).not.toBeInTheDocument();
    expect(screen.getByText(/Mostrando 1 de 2 tag/)).toBeInTheDocument();
  });

  it('limpa o filtro ao clicar em Limpar Filtro', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.filtroNome.set('super');
    fixture.detectChanges();

    await userEvent.click(screen.getByRole('button', { name: /Limpar Filtro/ }));

    expect(screen.getByText('Vigilante')).toBeInTheDocument();
    expect(screen.getByText('Supervisor')).toBeInTheDocument();
  });

  it('exibe modal de confirmação ao excluir uma tag', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.confirmDelete(mockTags[0] as any);
    fixture.detectChanges();

    expect(screen.getByRole('heading', { name: /Confirmar exclusão/ })).toBeInTheDocument();
    expect(screen.getByText(/Deseja excluir a tag/)).toBeInTheDocument();
  });

  it('chama service.delete e recarrega ao confirmar exclusão', async () => {
    const mockService = buildTagService();
    const { fixture } = await render(TagListComponent, {
      providers: [{ provide: TagService, useValue: mockService }],
    });

    fixture.componentInstance.confirmDelete(mockTags[0] as any);
    fixture.detectChanges();

    fixture.componentInstance.executeDelete();
    fixture.detectChanges();

    expect(mockService.delete).toHaveBeenCalledWith('t1');
  });

  it('exibe a mensagem de sucesso após criar uma tag', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.openCreate();
    fixture.componentInstance.form.setValue({ nome: 'Tag Nova', valor: 100, descricao: '' });
    fixture.detectChanges();

    fixture.componentInstance.save();
    fixture.detectChanges();

    expect(screen.getByText(/Tag criada com sucesso/)).toBeInTheDocument();
  });
});
