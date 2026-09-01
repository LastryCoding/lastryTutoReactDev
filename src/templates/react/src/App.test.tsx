import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('premiere mission', () => {
  it('affiche le titre attendu', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Bienvenue dans React Quest !' }),
    ).toBeInTheDocument();
  });
});
