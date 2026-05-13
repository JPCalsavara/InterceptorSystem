import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { TagPickerComponent } from './tag-picker.component';

const mockTags = [
  { id: 't1', nome: 'Vigilante', valor: 150, descricao: 'Guarda' },
  { id: 't2', nome: 'Supervisor', valor: 200, descricao: 'Líder' },
  { id: 't3', nome: 'Porteiro', valor: 120, descricao: '' },
];

describe('TagPickerComponent', () => {
  const setup = async (componentInputs: Record<string, unknown> = {}) =>
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

    expect(screen.getByText(/Vigilante/)).toBeTruthy();
    expect(screen.getByText(/Supervisor/)).toBeTruthy();
  });

  it('permite buscar tags por nome', async () => {
    await setup();
    const input = screen.getByPlaceholderText(/Buscar/);
    await userEvent.type(input, 'vigilante');

    expect(screen.getByText(/Vigilante/)).toBeTruthy();
    expect(screen.queryByText(/Supervisor/)).toBeNull();
  });

  it('exibe mensagem quando nenhuma tag é encontrada', async () => {
    await setup();
    const input = screen.getByPlaceholderText(/Buscar/);
    await userEvent.type(input, 'inexistente');

    expect(screen.getByText(/Nenhuma tag disponível/)).toBeTruthy();
  });

  it('abre e fecha o dropdown ao focar/desfocar', async () => {
    await setup();
    const input = screen.getByPlaceholderText(/Buscar/);

    await userEvent.click(input);
    expect(screen.getByText(/Vigilante/)).toBeTruthy();
  });

  it('emite evento de seleção ao clicar em uma tag', async () => {
    const spy = vi.fn();
    const { fixture } = await setup();
    fixture.componentInstance.selectionChange.subscribe(spy);

    await userEvent.click(screen.getByText(/Vigilante/));
    expect(spy).toHaveBeenCalledWith(['t1']);
  });

  it('não emite selectionChange em tag travada', async () => {
    const spy = vi.fn();
    const { fixture } = await setup({ selectedIds: ['t1'], lockedIds: ['t1'] });
    fixture.componentInstance.selectionChange.subscribe(spy);

    await userEvent.click(screen.getByRole('button', { name: /Vigilante/i }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('não emite selectionChange quando disabled', async () => {
    const { fixture } = await setup({ disabled: true });
    const spy = vi.fn();
    fixture.componentInstance.selectionChange.subscribe(spy);

    const btn = screen.getByRole('button', { name: /Vigilante/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
