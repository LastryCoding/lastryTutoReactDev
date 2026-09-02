import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Mission' }),
      'Sceller le portail',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    const quest = screen.getByRole('button', { name: 'Sceller le portail' });
    await userEvent.click(quest);
    expect(quest).toHaveAttribute('aria-pressed', 'true');
  });
});
