import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Ouvrir la porte')).toBeInTheDocument();
  });
});
