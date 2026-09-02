import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    const navigation = screen.getByRole('navigation', {
      name: 'Lieux du camp',
    });
    expect(within(navigation).getAllByRole('listitem')).toHaveLength(3);
  });
});
