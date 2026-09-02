import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Code' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Le code doit contenir 4 caractères',
    );
  });
});
