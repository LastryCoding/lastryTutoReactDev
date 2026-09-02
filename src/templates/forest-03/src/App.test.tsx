import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
    expect(await screen.findByText('Boussole')).toBeInTheDocument();
  });
});
