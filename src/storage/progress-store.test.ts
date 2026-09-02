import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/domain/progress';
import {
  CORRUPTED_STORAGE_KEY,
  STORAGE_KEY,
  discardCorruptedQuestState,
  exportQuestState,
  getCorruptedQuestState,
  importQuestState,
  loadQuestState,
  replaceQuestState,
  resetQuestState,
  saveQuestState,
} from './progress-store';

const NOW = '2026-09-02T00:00:00.000Z';

describe('stockage de progression', () => {
  it('sauvegarde et restaure un etat valide', () => {
    const storage = createMemoryStorage();
    const state = createInitialState(NOW);

    saveQuestState(storage, state);

    expect(loadQuestState(storage, NOW)).toEqual({
      state,
      corruptedRaw: null,
    });
    expect(importQuestState(exportQuestState(state), NOW)).toEqual({
      success: true,
      state,
    });
  });

  it('isole un etat corrompu sans faire planter le chargement', () => {
    const storage = createMemoryStorage();
    storage.setItem(STORAGE_KEY, '{invalide');

    const result = loadQuestState(storage, NOW);

    expect(result.corruptedRaw).toBe('{invalide');
    expect(result.state.xp).toBe(0);
    expect(getCorruptedQuestState(storage)).toBe('{invalide');

    discardCorruptedQuestState(storage);
    expect(storage.getItem(CORRUPTED_STORAGE_KEY)).toBeNull();
  });

  it('migre le schema historique v0', () => {
    const result = importQuestState(
      JSON.stringify({
        schemaVersion: 0,
        XP: 120,
        completedExercises: ['camp-01'],
      }),
      NOW,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.state.xp).toBe(120);
      expect(result.state.completedExercises).toEqual(['camp-01']);
      expect(result.state.schemaVersion).toBe(1);
    }
  });

  it('ne remplace jamais un etat valide par un import invalide', () => {
    const storage = createMemoryStorage();
    const state = { ...createInitialState(NOW), xp: 250 };
    saveQuestState(storage, state);

    const result = replaceQuestState(storage, '{invalide', NOW);

    expect(result.success).toBe(false);
    expect(loadQuestState(storage, NOW).state.xp).toBe(250);
  });

  it('remplace et reinitialise toute la progression', () => {
    const storage = createMemoryStorage();
    const imported = { ...createInitialState(NOW), xp: 400 };
    storage.setItem(CORRUPTED_STORAGE_KEY, 'ancienne erreur');

    expect(
      replaceQuestState(storage, exportQuestState(imported), NOW).success,
    ).toBe(true);
    expect(loadQuestState(storage, NOW).state.xp).toBe(400);
    expect(getCorruptedQuestState(storage)).toBeNull();

    const reset = resetQuestState(storage, '2026-09-02T02:00:00.000Z');
    expect(reset.xp).toBe(0);
    expect(reset.exerciseProgress).toEqual({});
    expect(loadQuestState(storage).state).toEqual(reset);
  });
});

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => data.delete(key),
    setItem: (key, value) => data.set(key, value),
  };
}
