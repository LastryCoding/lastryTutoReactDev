import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    const section = screen.getByRole('region');
    expect(
      within(section).getByRole('heading', { name: 'Sac' }),
    ).toBeInTheDocument();
    expect(within(section).getByText('Corde et torche')).toBeInTheDocument();
  });
});
