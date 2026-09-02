import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', () => {
    render(<App />);
    act(() => window.dispatchEvent(new Event('offline')));
    expect(screen.getByText('Hors ligne')).toBeInTheDocument();
  });
});
