import {
  CONTENT_VERSION,
  SCHEMA_VERSION,
  createInitialState,
  questStateSchema,
  type QuestState,
} from '@/domain/progress';

export const STORAGE_KEY = 'reactquest:state:v1';

export type LoadStateResult =
  | { state: QuestState; corruptedRaw: null }
  | { state: QuestState; corruptedRaw: string };

export type ImportStateResult =
  | { success: true; state: QuestState }
  | { success: false; message: string; raw: string };

export function loadQuestState(
  storage: Storage,
  now = new Date().toISOString(),
): LoadStateResult {
  const raw = storage.getItem(STORAGE_KEY);

  if (raw === null) {
    return { state: createInitialState(now), corruptedRaw: null };
  }

  const imported = importQuestState(raw, now);

  if (!imported.success) {
    return { state: createInitialState(now), corruptedRaw: raw };
  }

  return { state: imported.state, corruptedRaw: null };
}

export function saveQuestState(storage: Storage, state: QuestState): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(questStateSchema.parse(state)));
}

export function exportQuestState(state: QuestState): string {
  return JSON.stringify(questStateSchema.parse(state), null, 2);
}

export function importQuestState(
  raw: string,
  now = new Date().toISOString(),
): ImportStateResult {
  try {
    const parsed: unknown = JSON.parse(raw);
    const migrated = migrateState(parsed, now);
    const result = questStateSchema.safeParse(migrated);

    if (!result.success) {
      return {
        success: false,
        message: 'La sauvegarde ne correspond pas au format React Quest.',
        raw,
      };
    }

    return { success: true, state: result.data };
  } catch {
    return {
      success: false,
      message: "Le fichier n'est pas un JSON valide.",
      raw,
    };
  }
}

function migrateState(value: unknown, now: string): unknown {
  if (!isRecord(value)) {
    return value;
  }

  if (value.schemaVersion === SCHEMA_VERSION) {
    return value;
  }

  if (value.schemaVersion === 0) {
    const initial = createInitialState(now);
    const legacyXp = typeof value.XP === 'number' ? value.XP : 0;
    const completedExercises = Array.isArray(value.completedExercises)
      ? value.completedExercises.filter(
          (exercise): exercise is string => typeof exercise === 'string',
        )
      : [];

    return {
      ...initial,
      contentVersion: CONTENT_VERSION,
      xp: Math.max(0, Math.floor(legacyXp)),
      completedExercises,
    };
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
