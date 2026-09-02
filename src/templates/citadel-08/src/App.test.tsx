import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Recherche' }),
      'tour',
    );
    expect(
      await screen.findByText('Résultat : tour', {}, { timeout: 700 }),
    ).toBeInTheDocument();
  });
});
