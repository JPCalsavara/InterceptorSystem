import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TagPickerComponent } from './tag-picker.component';

const mockTags = [
  { id: 't1', nome: 'Vigilante', valor: 150, descricao: 'Guarda patrimonial' },
  { id: 't2', nome: 'Supervisor', valor: 200, descricao: 'Líder de equipe' },
  { id: 't3', nome: 'Porteiro', valor: 120, descricao: null },
];

describe('TagPickerComponent', () => {
  const setup = (componentInputs: Record<string, unknown> = {}) =>
    render(TagPickerComponent, {
      componentInputs: {
        tags: mockTags,
        selectedIds: [],
        lockedIds: [],
        disabled: false,
        ...componentInputs,
      },
    });

  it('renderiza os botões de seleção para cada tag', async () => {
    await setup();

    expect(screen.getByRole('button', { name: /Vigilante/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Supervisor/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Porteiro/ })).toBeInTheDocument();
  });

  it('exibe texto vazio quando não há tags disponíveis', async () => {
    await setup({ tags: [], emptyText: 'Sem funções disponíveis.' });

    expect(screen.getByText('Sem funções disponíveis.')).toBeInTheDocument();
  });

  it('exibe chips das tags já selecionadas', async () => {
    await setup({ selectedIds: ['t1', 't2'] });

    const chips = document.querySelectorAll('.tag-chip');
    const chipTexts = Array.from(chips).map((c) => c.textContent?.trim());

    expect(chipTexts.some((t) => t?.includes('Vigilante'))).toBe(true);
    expect(chipTexts.some((t) => t?.includes('Supervisor'))).toBe(true);
  });

  it('exibe tag travada com indicador "fixa"', async () => {
    await setup({ selectedIds: ['t1'], lockedIds: ['t1'] });

    expect(screen.getByText('fixa')).toBeInTheDocument();
  });

  it('filtra tags ao digitar no campo de busca', async () => {
    const { fixture } = await setup();

    fixture.componentInstance.searchTerm.set('super');
    fixture.detectChanges();

    expect(screen.getByRole('button', { name: /Supervisor/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Vigilante/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Porteiro/ })).not.toBeInTheDocument();
  });

  it('emite selectionChange ao clicar em uma tag não selecionada', async () => {
    const { fixture } = await setup({ selectedIds: [] });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);

    await userEvent.click(screen.getByRole('button', { name: /Vigilante/ }));

    expect(spy).toHaveBeenCalledWith(['t1']);
  });

  it('emite selectionChange removendo ao clicar em tag já selecionada', async () => {
    const { fixture } = await setup({ selectedIds: ['t1'] });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);

    await userEvent.click(screen.getByRole('button', { name: /Vigilante/ }));

    expect(spy).toHaveBeenCalledWith([]);
  });

  it('não emite selectionChange em tag travada', async () => {
    const { fixture } = await setup({ selectedIds: ['t1'], lockedIds: ['t1'] });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);

    await userEvent.click(screen.getByRole('button', { name: /Vigilante/ }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('não emite selectionChange quando disabled', async () => {
    const { fixture } = await setup({ disabled: true });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);

    const btn = screen.getByRole('button', { name: /Vigilante/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('usa label customizado quando fornecido', async () => {
    await setup({ label: 'Especialidades' });

    expect(screen.getByText('Especialidades')).toBeInTheDocument();
  });
});
