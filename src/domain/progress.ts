import { z } from 'zod';

export const SCHEMA_VERSION = 1;
export const CONTENT_VERSION = '2026.09.1';

const validationConditionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.enum(['passed', 'failed']),
  message: z.string().min(1),
  technicalDetails: z.string().optional(),
});

export const validationResultSchema = z.object({
  status: z.enum(['success', 'failure']),
  conditions: z.array(validationConditionSchema).min(1),
  pedagogicalMessage: z.string().min(1),
  technicalDetails: z.string(),
  validatedAt: z.string().datetime(),
});

const archivedFilesSchema = z.object({
  contentVersion: z.number().int().positive(),
  files: z.record(z.string()),
  savedAt: z.string().datetime(),
});

export const exerciseProgressSchema = z.object({
  files: z.record(z.string()),
  status: z.enum(['not-started', 'in-progress', 'completed']),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  attempts: z.number().int().nonnegative(),
  hintsRevealed: z.array(z.number().int().min(0).max(2)).max(3),
  solutionRevealed: z.boolean(),
  lastValidation: validationResultSchema.nullable(),
  contentVersion: z.number().int().positive(),
  archivedFiles: z.array(archivedFilesSchema),
});

export const questSettingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  ideLayout: z.object({
    lesson: z.number().min(15).max(60),
    editor: z.number().min(20).max(70),
    result: z.number().min(15).max(60),
  }),
  fontSize: z.number().int().min(12).max(24),
  reducedMotion: z.enum(['system', 'reduce', 'allow']),
  sprintMode: z.boolean(),
});

export const questStateSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  contentVersion: z.string().min(1),
  activeExerciseId: z.string().nullable(),
  xp: z.number().int().nonnegative(),
  badges: z.array(z.string()),
  completedExercises: z.array(z.string()),
  exerciseProgress: z.record(exerciseProgressSchema),
  settings: questSettingsSchema,
  timestamps: z.object({
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ExerciseProgress = z.infer<typeof exerciseProgressSchema>;
export type QuestSettings = z.infer<typeof questSettingsSchema>;
export type QuestState = z.infer<typeof questStateSchema>;

export function createInitialState(now = new Date().toISOString()): QuestState {
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    activeExerciseId: null,
    xp: 0,
    badges: [],
    completedExercises: [],
    exerciseProgress: {},
    settings: {
      theme: 'system',
      ideLayout: { lesson: 32, editor: 38, result: 30 },
      fontSize: 15,
      reducedMotion: 'system',
      sprintMode: false,
    },
    timestamps: { createdAt: now, updatedAt: now },
  };
}

export function openExercise(
  state: QuestState,
  exerciseId: string,
  contentVersion: number,
  now = new Date().toISOString(),
): QuestState {
  const current = state.exerciseProgress[exerciseId];
  let exercise = current ?? createExerciseProgress(contentVersion, now);

  if (current && current.contentVersion !== contentVersion) {
    exercise = {
      ...createExerciseProgress(contentVersion, now),
      archivedFiles:
        Object.keys(current.files).length > 0
          ? [
              ...current.archivedFiles,
              {
                contentVersion: current.contentVersion,
                files: current.files,
                savedAt: now,
              },
            ]
          : current.archivedFiles,
    };
  }

  return touch(
    {
      ...state,
      activeExerciseId: exerciseId,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: exercise,
      },
    },
    now,
  );
}

export function saveExerciseFiles(
  state: QuestState,
  exerciseId: string,
  files: Record<string, string>,
  now = new Date().toISOString(),
): QuestState {
  const exercise = requireExercise(state, exerciseId);

  return touch(
    {
      ...state,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: { ...exercise, files },
      },
    },
    now,
  );
}

export function recordValidation(
  state: QuestState,
  exerciseId: string,
  result: ValidationResult,
): QuestState {
  const exercise = requireExercise(state, exerciseId);

  return touch(
    {
      ...state,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: {
          ...exercise,
          attempts: exercise.attempts + 1,
          lastValidation: result,
        },
      },
    },
    result.validatedAt,
  );
}

export function completeExercise(
  state: QuestState,
  exerciseId: string,
  earnedXp: number,
  now = new Date().toISOString(),
): QuestState {
  const exercise = requireExercise(state, exerciseId);

  if (state.completedExercises.includes(exerciseId)) {
    return state;
  }

  const completedExercises = [...state.completedExercises, exerciseId];
  const badges =
    completedExercises.length === 1 && !state.badges.includes('premier-pas')
      ? [...state.badges, 'premier-pas']
      : state.badges;

  return touch(
    {
      ...state,
      xp: state.xp + earnedXp,
      badges,
      completedExercises,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: {
          ...exercise,
          status: 'completed',
          completedAt: now,
        },
      },
    },
    now,
  );
}

export function revealHint(
  state: QuestState,
  exerciseId: string,
  hintIndex: number,
  now = new Date().toISOString(),
): QuestState {
  const exercise = requireExercise(state, exerciseId);

  if (exercise.hintsRevealed.includes(hintIndex)) {
    return state;
  }

  return touch(
    {
      ...state,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: {
          ...exercise,
          hintsRevealed: [...exercise.hintsRevealed, hintIndex].sort(),
        },
      },
    },
    now,
  );
}

export function revealSolution(
  state: QuestState,
  exerciseId: string,
  now = new Date().toISOString(),
): QuestState {
  const exercise = requireExercise(state, exerciseId);

  return touch(
    {
      ...state,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: { ...exercise, solutionRevealed: true },
      },
    },
    now,
  );
}

export function resetExerciseCode(
  state: QuestState,
  exerciseId: string,
  now = new Date().toISOString(),
): QuestState {
  const exercise = requireExercise(state, exerciseId);

  return touch(
    {
      ...state,
      exerciseProgress: {
        ...state.exerciseProgress,
        [exerciseId]: {
          ...exercise,
          files: {},
          lastValidation: null,
          status: state.completedExercises.includes(exerciseId)
            ? 'completed'
            : 'in-progress',
        },
      },
    },
    now,
  );
}

export function updateSettings(
  state: QuestState,
  settings: QuestSettings,
  now = new Date().toISOString(),
): QuestState {
  return touch(
    { ...state, settings: questSettingsSchema.parse(settings) },
    now,
  );
}

function createExerciseProgress(
  contentVersion: number,
  now: string,
): ExerciseProgress {
  return {
    files: {},
    status: 'in-progress',
    startedAt: now,
    completedAt: null,
    attempts: 0,
    hintsRevealed: [],
    solutionRevealed: false,
    lastValidation: null,
    contentVersion,
    archivedFiles: [],
  };
}

function requireExercise(
  state: QuestState,
  exerciseId: string,
): ExerciseProgress {
  const exercise = state.exerciseProgress[exerciseId];

  if (!exercise) {
    throw new Error(
      `L'exercice ${exerciseId} doit etre ouvert avant sa mise a jour.`,
    );
  }

  return exercise;
}

function touch(state: QuestState, now: string): QuestState {
  return {
    ...state,
    timestamps: { ...state.timestamps, updatedAt: now },
  };
}
