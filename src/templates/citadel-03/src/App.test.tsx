import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('contrat de la mission', () => {
  it('valide le comportement attendu', async () => {
    render(<App />);
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filtre' }),
      'done',
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.queryByText('Tour')).not.toBeInTheDocument();
  });
});
