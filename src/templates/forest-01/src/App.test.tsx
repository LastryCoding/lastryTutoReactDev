import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    await userEvent.clear(screen.getByRole('textbox', { name: 'Zone' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Zone' }),
      'Bosquet',
    );
    expect(document.title).toBe('Bosquet');
  });
});
