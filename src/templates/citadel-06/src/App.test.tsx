import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Démarrer' }));
    expect(screen.getByText('État : loading')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Terminer' }));
    expect(screen.getByText('État : success')).toBeInTheDocument();
  });
});
