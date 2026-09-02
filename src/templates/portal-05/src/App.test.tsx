import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Lieu' }), 'for');
    expect(screen.getByRole('textbox', { name: 'Lieu' })).toHaveValue('for');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Forêt')).toBeInTheDocument();
  });
});
