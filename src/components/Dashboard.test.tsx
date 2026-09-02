import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CurriculumLesson } from '@/domain/curriculum';
import { createInitialState } from '@/domain/progress';
import {
  STORAGE_KEY,
  loadQuestState,
  saveQuestState,
} from '@/storage/progress-store';
import Dashboard from './Dashboard';

const NOW = '2026-09-02T00:00:00.000Z';
const lessons = Array.from({ length: 6 }, (_, world) =>
  lesson(
    world === 0 ? 'camp-01' : `world-${world}`,
    world,
    world === 0 ? [] : [world === 1 ? 'camp-01' : `world-${world - 1}`],
  ),
);

describe('Dashboard', () => {
  beforeEach(() => localStorage.clear());

  it('affiche la prochaine mission et persiste le mode sprint', async () => {
    const user = userEvent.setup();
    render(<Dashboard lessons={lessons} />);

    expect(
      await screen.findByRole('link', { name: /Commencer la quete/ }),
    ).toHaveAttribute('href', '/camp-01');
    await user.click(screen.getByRole('button', { name: 'Activer le sprint' }));

    expect(loadQuestState(localStorage, NOW).state.settings.sprintMode).toBe(
      true,
    );
    expect(
      screen.getByRole('button', { name: 'Sprint actif' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('restitue XP, badge, acquis et mission suivante', async () => {
    const initial = createInitialState(NOW);
    saveQuestState(localStorage, {
      ...initial,
      xp: 50,
      badges: ['premier-pas'],
      completedExercises: ['camp-01'],
    });

    render(<Dashboard lessons={lessons} />);

    expect(await screen.findByText('50 XP')).toBeVisible();
    expect(screen.getByText('Premier pas')).toBeVisible();
    expect(screen.getByText('JSX')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Reprendre world-1/ }),
    ).toHaveAttribute('href', '/world-1');
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});

function lesson(
  id: string,
  world: number,
  prerequisites: string[],
): CurriculumLesson {
  return {
    bonus: false,
    concepts: world === 0 ? ['JSX'] : [`concept-${world}`],
    estimatedMinutes: 15,
    id,
    order: 1,
    prerequisites,
    route: `/${id}`,
    title: id,
    world,
    xp: 50,
  };
}
