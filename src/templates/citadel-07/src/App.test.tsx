import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    localStorage.setItem('zone', 'Citadelle');
    render(<App />);
    expect(screen.getByRole('textbox', { name: 'Zone' })).toHaveValue(
      'Citadelle',
    );
  });
});
