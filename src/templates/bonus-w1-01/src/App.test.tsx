import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    const card = screen.getByRole('article');
    expect(
      within(card).getByRole('heading', { name: 'Inventaire' }),
    ).toBeInTheDocument();
    expect(within(card).getByText('3 potions')).toBeInTheDocument();
  });
});
