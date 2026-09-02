import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    const button = screen.getByRole('button', { name: 'Cristaux : 0' });
    await userEvent.click(button);
    await userEvent.click(button);
    expect(button).toHaveTextContent('Cristaux : 2');
  });
});
