import { describe, expect, it } from 'vitest';
import { createInitialState } from '@/domain/progress';
import {
  STORAGE_KEY,
  exportQuestState,
  importQuestState,
  loadQuestState,
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
