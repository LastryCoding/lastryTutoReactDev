import { describe, expect, it } from 'vitest';
import {
  completeExercise,
  createInitialState,
  openExercise,
  saveExerciseFiles,
  updateSettings,
} from './progress';

const NOW = '2026-09-02T00:00:00.000Z';

describe('progression', () => {
  it('attribue les XP une seule fois', () => {
    const opened = openExercise(createInitialState(NOW), 'camp-01', 1, NOW);
    const completed = completeExercise(opened, 'camp-01', 50, NOW);
    const completedAgain = completeExercise(completed, 'camp-01', 50, NOW);

    expect(completedAgain.xp).toBe(50);
    expect(completedAgain.completedExercises).toEqual(['camp-01']);
    expect(completedAgain.badges).toContain('premier-pas');
  });

  it('archive le code lors d une version de contenu incompatible', () => {
    const opened = openExercise(createInitialState(NOW), 'camp-01', 1, NOW);
    const edited = saveExerciseFiles(
      opened,
      'camp-01',
      { 'src/App.tsx': 'ancien code' },
      NOW,
    );
    const upgraded = openExercise(edited, 'camp-01', 2, NOW);

    expect(upgraded.exerciseProgress['camp-01']?.files).toEqual({});
    expect(
      upgraded.exerciseProgress['camp-01']?.archivedFiles[0]?.files,
    ).toEqual({ 'src/App.tsx': 'ancien code' });
  });

  it('conserve les XP mais exige une revalidation du contenu mis a jour', () => {
    const opened = openExercise(createInitialState(NOW), 'camp-01', 1, NOW);
    const completed = completeExercise(opened, 'camp-01', 50, NOW);
    const upgraded = openExercise(
      completed,
      'camp-01',
      2,
      '2026-09-02T01:00:00.000Z',
    );

    expect(upgraded.xp).toBe(50);
    expect(upgraded.completedExercises).toEqual(['camp-01']);
    expect(upgraded.exerciseProgress['camp-01']).toMatchObject({
      contentVersion: 2,
      status: 'in-progress',
      completedAt: null,
      lastValidation: null,
    });

    const reopened = openExercise(
      upgraded,
      'camp-01',
      2,
      '2026-09-02T02:00:00.000Z',
    );
    expect(reopened.exerciseProgress['camp-01']?.status).toBe('in-progress');
  });

  it('repare une progression terminee incomplete sans doubler les XP', () => {
    const opened = openExercise(createInitialState(NOW), 'camp-01', 1, NOW);
    const inconsistent = {
      ...opened,
      xp: 50,
      completedExercises: ['camp-01'],
    };
    const repaired = completeExercise(inconsistent, 'camp-01', 50, NOW);

    expect(repaired.xp).toBe(50);
    expect(repaired.exerciseProgress['camp-01']?.status).toBe('completed');
  });

  it('valide et persiste les preferences', () => {
    const initial = createInitialState(NOW);
    const updated = updateSettings(
      initial,
      {
        ...initial.settings,
        theme: 'dark',
        fontSize: 18,
        reducedMotion: 'reduce',
        sprintMode: true,
      },
      '2026-09-02T01:00:00.000Z',
    );

    expect(updated.settings).toMatchObject({
      theme: 'dark',
      fontSize: 18,
      reducedMotion: 'reduce',
      sprintMode: true,
    });
    expect(updated.timestamps.updatedAt).toBe('2026-09-02T01:00:00.000Z');
    expect(() =>
      updateSettings(initial, { ...initial.settings, fontSize: 40 }),
    ).toThrow();
  });
});
