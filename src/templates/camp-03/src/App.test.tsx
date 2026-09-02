import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: 'Ouvrir la carte' });
    expect(button).toHaveClass('primary');
  });
});
