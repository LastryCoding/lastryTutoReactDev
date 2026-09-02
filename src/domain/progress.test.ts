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
