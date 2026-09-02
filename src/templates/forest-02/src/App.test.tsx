import { render, screen, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 777,
    });
    act(() => window.dispatchEvent(new Event('resize')));
    expect(screen.getByText('Largeur : 777')).toBeInTheDocument();
  });
});
