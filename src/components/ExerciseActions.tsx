import { useEffect, useRef, useState } from 'react';
import { webcontainer } from 'tutorialkit:core';
import tutorialStore from 'tutorialkit:store';
import {
  completeExercise,
  openExercise,
  recordValidation,
  resetExerciseCode,
  revealHint,
  revealSolution,
  saveExerciseFiles,
  type ExerciseProgress,
  type QuestState,
  type ValidationResult,
} from '@/domain/progress';
import { loadQuestState, saveQuestState } from '@/storage/progress-store';
import './ExerciseActions.css';

interface ExerciseActionsProps {
  exerciseId: string;
  xp: number;
  contentVersion: number;
  hints: [string, string, string];
}

interface ProcessResult {
  exitCode: number;
  output: string;
}

type Activity =
  | { status: 'idle'; message: string }
  | { status: 'running'; message: string }
  | { status: 'success'; message: string }
  | { status: 'failure'; message: string };

const SAVE_DELAY_MS = 450;

export default function ExerciseActions({
  exerciseId,
  xp,
  contentVersion,
  hints,
}: ExerciseActionsProps) {
  const [activity, setActivity] = useState<Activity>({
    status: 'idle',
    message: 'Modifiez le code, puis lancez une verification.',
  });
  const [progress, setProgress] = useState<ExerciseProgress | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [corruptedState, setCorruptedState] = useState(false);
  const baselineFiles = useRef<Record<string, string>>({});

  function persist(transform: (state: QuestState) => QuestState): QuestState {
    const loaded = loadQuestState(localStorage);
    const next = transform(loaded.state);
    saveQuestState(localStorage, next);
    setProgress(next.exerciseProgress[exerciseId] ?? null);
    setTotalXp(next.xp);
    return next;
  }

  function saveCurrentFiles() {
    const snapshot = tutorialStore.takeSnapshot().files;
    const modifiedFiles = selectModifiedFiles(snapshot, baselineFiles.current);
    persist((state) => saveExerciseFiles(state, exerciseId, modifiedFiles));
    setActivity({ status: 'success', message: 'Code sauvegarde localement.' });
  }

  async function runExercise() {
    if (!runtimeReady) {
      setActivity({
        status: 'failure',
        message: "L'atelier termine encore sa preparation.",
      });
      return;
    }

    setActivity({ status: 'running', message: 'Compilation TypeScript...' });
    const result = await runProcess('npm', [
      'run',
      'typecheck',
      '--',
      '--pretty',
      'false',
    ]);

    setActivity(
      result.exitCode === 0
        ? {
            status: 'success',
            message: 'Compilation reussie. La previsualisation est a jour.',
          }
        : {
            status: 'failure',
            message:
              'TypeScript a detecte une erreur. Lancez Verifier pour obtenir les conditions et les details techniques.',
          },
    );
  }

  async function formatCurrentFile() {
    const document = tutorialStore.currentDocument.get();

    if (!runtimeReady || !document) {
      setActivity({
        status: 'failure',
        message: "Aucun fichier pret a etre formate pour l'instant.",
      });
      return;
    }

    setActivity({ status: 'running', message: 'Formatage avec Prettier...' });
    try {
      const [prettier, typescriptPlugin, estreePlugin] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/typescript'),
        import('prettier/plugins/estree'),
      ]);
      const source =
        typeof document.value === 'string'
          ? document.value
          : new TextDecoder().decode(document.value);
      const formatted = await prettier.format(source, {
        parser: 'typescript',
        plugins: [typescriptPlugin, estreePlugin],
        singleQuote: true,
        trailingComma: 'all',
      });
      tutorialStore.updateFile(document.filePath, formatted);
      saveCurrentFiles();
      setActivity({
        status: 'success',
        message: `${document.filePath} a ete formate avec Prettier.`,
      });
    } catch (error) {
      setActivity({
        status: 'failure',
        message: `Prettier n'a pas pu formater le fichier actif. ${error instanceof Error ? error.message : 'Erreur inconnue.'}`,
      });
    }
  }

  async function verifyExercise() {
    if (!runtimeReady) {
      setActivity({
        status: 'failure',
        message: "L'atelier termine encore sa preparation.",
      });
      return;
    }

    saveCurrentFiles();
    setActivity({
      status: 'running',
      message: 'Verification TypeScript, ESLint et tests fonctionnels...',
    });

    const typecheck = await runProcess('npm', [
      'run',
      'typecheck',
      '--',
      '--pretty',
      'false',
    ]);
    const lint = await runProcess('npm', ['run', 'lint']);
    const tests = await runProcess('npm', [
      'run',
      'test',
      '--',
      '--reporter=basic',
    ]);
    const success =
      typecheck.exitCode === 0 && lint.exitCode === 0 && tests.exitCode === 0;
    const now = new Date().toISOString();
    const result: ValidationResult = {
      status: success ? 'success' : 'failure',
      conditions: [
        createCondition(
          'typescript',
          'TypeScript',
          typecheck,
          'Le code est correctement type et compile.',
          'TypeScript signale encore une erreur de syntaxe ou de type.',
        ),
        createCondition(
          'eslint',
          'ESLint',
          lint,
          'Les regles ESLint sont respectees.',
          'ESLint a trouve un probleme dans le code.',
        ),
        createCondition(
          'functional-test',
          'Resultat attendu',
          tests,
          'Le titre attendu est bien rendu dans le DOM.',
          "Le composant fonctionne, mais le titre exact n'est pas encore affiche. Verifiez le texte entre <h1> et </h1>.",
        ),
      ],
      pedagogicalMessage: success
        ? `Mission reussie : ${xp} XP attribues.`
        : 'Une partie est deja correcte. Utilisez les conditions ci-dessous pour identifier la prochaine modification.',
      technicalDetails: formatTechnicalDetails({ typecheck, lint, tests }),
      validatedAt: now,
    };

    let next = persist((state) => recordValidation(state, exerciseId, result));

    if (success) {
      next = persist((state) => completeExercise(state, exerciseId, xp, now));
    }

    setProgress(next.exerciseProgress[exerciseId] ?? null);
    setActivity({
      status: success ? 'success' : 'failure',
      message: result.pedagogicalMessage,
    });
  }

  function showNextHint() {
    const nextHint = progress?.hintsRevealed.length ?? 0;

    if (nextHint >= hints.length) {
      setActivity({
        status: 'idle',
        message: 'Tous les indices ont deja ete reveles.',
      });
      return;
    }

    persist((state) => revealHint(state, exerciseId, nextHint));
  }

  function resetExercise() {
    if (!window.confirm('Reinitialiser le code de cet exercice ?')) {
      return;
    }

    tutorialStore.reset();
    setActivity({
      status: 'idle',
      message: 'Le code de depart a ete restaure.',
    });
  }

  function showSolution() {
    if (!window.confirm('Afficher la solution complete de cet exercice ?')) {
      return;
    }

    tutorialStore.solve();
  }

  function openLargePreview() {
    const preview = tutorialStore.previews.get().find((item) => item.ready);

    if (!preview?.url) {
      setActivity({
        status: 'failure',
        message: "La previsualisation n'est pas encore disponible.",
      });
      return;
    }

    window.open(preview.url, '_blank', 'noopener,noreferrer');
  }

  useEffect(() => {
    const loaded = loadQuestState(localStorage);
    const opened = openExercise(loaded.state, exerciseId, contentVersion);
    saveQuestState(localStorage, opened);
    setCorruptedState(loaded.corruptedRaw !== null);
    setProgress(opened.exerciseProgress[exerciseId] ?? null);
    setTotalXp(opened.xp);

    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let documentCleanups: Array<() => void> = [];
    let restored = false;
    let readyAnnounced = false;
    const originalSolve = tutorialStore.solve.bind(tutorialStore);
    const originalReset = tutorialStore.reset.bind(tutorialStore);

    function persistFromEffect(
      transform: (state: QuestState) => QuestState,
    ): void {
      const current = loadQuestState(localStorage).state;
      const next = transform(current);
      saveQuestState(localStorage, next);
      setProgress(next.exerciseProgress[exerciseId] ?? null);
      setTotalXp(next.xp);
    }

    tutorialStore.solve = () => {
      persistFromEffect((state) => revealSolution(state, exerciseId));
      originalSolve();
    };
    tutorialStore.reset = () => {
      originalReset();
      persistFromEffect((state) => resetExerciseCode(state, exerciseId));
    };

    const unsubscribeLoaded = tutorialStore.lessonFullyLoaded.subscribe(
      (isLoaded) => {
        if (!isLoaded || restored) {
          return;
        }

        restored = true;
        baselineFiles.current = tutorialStore.takeSnapshot().files;
        const current = loadQuestState(localStorage).state;
        const savedFiles = current.exerciseProgress[exerciseId]?.files ?? {};

        for (const [path, content] of Object.entries(savedFiles)) {
          tutorialStore.updateFile(`/${path.replace(/^\//, '')}`, content);
        }

        documentCleanups = Object.keys(tutorialStore.documents.get()).map(
          (path) =>
            tutorialStore.onDocumentChanged(path, () => {
              clearTimeout(saveTimer);
              saveTimer = setTimeout(() => {
                const snapshot = tutorialStore.takeSnapshot().files;
                const modifiedFiles = selectModifiedFiles(
                  snapshot,
                  baselineFiles.current,
                );
                persistFromEffect((state) =>
                  saveExerciseFiles(state, exerciseId, modifiedFiles),
                );
              }, SAVE_DELAY_MS);
            }),
        );
      },
    );
    const unsubscribePreviews = tutorialStore.previews.subscribe((previews) => {
      if (!readyAnnounced && previews.some((preview) => preview.ready)) {
        readyAnnounced = true;
        setRuntimeReady(true);
        setActivity({ status: 'idle', message: 'Atelier pret.' });
      }
    });

    return () => {
      unsubscribeLoaded();
      unsubscribePreviews();
      documentCleanups.forEach((cleanup) => cleanup());
      clearTimeout(saveTimer);
      tutorialStore.solve = originalSolve;
      tutorialStore.reset = originalReset;
    };
  }, [contentVersion, exerciseId]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const modifier = event.ctrlKey || event.metaKey;
      let action: string | null = null;

      if (modifier && event.shiftKey && event.key === 'Enter') {
        action = 'verify';
      } else if (modifier && event.key === 'Enter') {
        action = 'run';
      } else if (modifier && event.key.toLowerCase() === 's') {
        action = 'save';
      } else if (
        event.shiftKey &&
        event.altKey &&
        event.key.toLowerCase() === 'f'
      ) {
        action = 'format';
      }

      if (action) {
        event.preventDefault();
        document
          .querySelector<HTMLButtonElement>(`[data-quest-action="${action}"]`)
          ?.click();
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const validation = progress?.lastValidation;
  const compatible =
    typeof crossOriginIsolated === 'boolean' &&
    crossOriginIsolated &&
    typeof SharedArrayBuffer !== 'undefined' &&
    'serviceWorker' in navigator;

  if (!compatible) {
    return (
      <section className="quest-compatibility" role="status">
        <strong>Atelier interactif indisponible</strong>
        <p>
          L'atelier de code fonctionne de maniere optimale sur Chrome ou Edge
          depuis un ordinateur. Votre progression reste enregistree dans votre
          navigateur.
        </p>
      </section>
    );
  }

  return (
    <section className="quest-actions" aria-label="Actions de l exercice">
      <div className="quest-actions__status">
        <span>
          {progress?.status === 'completed' ? 'Mission validee' : 'En cours'}
        </span>
        <strong>{totalXp} XP</strong>
      </div>

      {corruptedState && (
        <p className="quest-actions__warning" role="alert">
          Une ancienne progression illisible a ete ignoree. Elle pourra etre
          exportee ou supprimee depuis les reglages.
        </p>
      )}

      <div className="quest-actions__buttons">
        <button data-quest-action="run" onClick={() => void runExercise()}>
          Executer
        </button>
        <button
          className="quest-actions__primary"
          data-quest-action="verify"
          onClick={() => void verifyExercise()}
        >
          Verifier
        </button>
        <button
          data-quest-action="format"
          onClick={() => void formatCurrentFile()}
        >
          Formater
        </button>
        <button data-quest-action="save" onClick={saveCurrentFiles}>
          Sauvegarder
        </button>
        <button onClick={resetExercise}>Reinitialiser</button>
        <button onClick={showNextHint}>Indice</button>
        <button onClick={showSolution}>Voir la solution</button>
        <button onClick={openLargePreview}>Agrandir le resultat</button>
      </div>

      <p
        className={`quest-actions__message quest-actions__message--${activity.status}`}
        aria-live="polite"
      >
        {activity.message}
      </p>

      {(progress?.hintsRevealed ?? []).map((hintIndex) => (
        <div className="quest-hint" key={hintIndex}>
          <strong>Indice {hintIndex + 1}</strong>
          <p>{hints[hintIndex]}</p>
        </div>
      ))}

      {validation && (
        <div className="quest-validation">
          <h2>Resultat de la verification</h2>
          <ul>
            {validation.conditions.map((condition) => (
              <li key={condition.id} data-status={condition.status}>
                <strong>{condition.label}</strong>
                <span>{condition.message}</span>
              </li>
            ))}
          </ul>
          <details>
            <summary>Details techniques</summary>
            <pre>{validation.technicalDetails}</pre>
          </details>
        </div>
      )}
    </section>
  );
}

async function runProcess(
  command: string,
  args: string[],
): Promise<ProcessResult> {
  const instance = await webcontainer;
  const process = await instance.spawn(command, args);
  let output = '';
  const outputComplete = process.output.pipeTo(
    new WritableStream({
      write(chunk) {
        output += chunk;
      },
    }),
  );
  const exitCode = await process.exit;
  await outputComplete;

  return { exitCode, output };
}

function createCondition(
  id: string,
  label: string,
  result: ProcessResult,
  successMessage: string,
  failureMessage: string,
) {
  return {
    id,
    label,
    status: result.exitCode === 0 ? ('passed' as const) : ('failed' as const),
    message: result.exitCode === 0 ? successMessage : failureMessage,
    technicalDetails: result.output,
  };
}

function formatTechnicalDetails(results: {
  typecheck: ProcessResult;
  lint: ProcessResult;
  tests: ProcessResult;
}): string {
  return [
    `TYPECHECK (code ${results.typecheck.exitCode})\n${results.typecheck.output}`,
    `ESLINT (code ${results.lint.exitCode})\n${results.lint.output}`,
    `TESTS (code ${results.tests.exitCode})\n${results.tests.output}`,
  ].join('\n\n');
}

function selectModifiedFiles(
  snapshot: Record<string, string>,
  baseline: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(snapshot).filter(
      ([path, content]) => baseline[path] !== content,
    ),
  );
}
