import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import {
  getCorruptedQuestState,
  loadQuestState,
  saveQuestState,
} from '@/storage/progress-store';
import ProgressSettings from './ProgressSettings';

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

type Operation = 'format' | 'run' | 'verify';

const SAVE_DELAY_MS = 450;
const PROCESS_TIMEOUT_MS = 120_000;

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
  const [questState, setQuestState] = useState<QuestState | null>(null);
  const [compatible, setCompatible] = useState<boolean | null>(null);
  const [operation, setOperation] = useState<Operation | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const baselineFiles = useRef<Record<string, string>>({});
  const operationRunning = useRef(false);
  const operationToken = useRef(0);
  const processKillers = useRef(new Set<() => void>());
  const workspaceRevision = useRef(0);

  function beginOperation(nextOperation: Operation): number {
    operationRunning.current = true;
    const token = ++operationToken.current;
    setOperation(nextOperation);
    setOperationError(null);
    return token;
  }

  function isCurrentOperation(token: number): boolean {
    return operationToken.current === token;
  }

  function finishOperation(token: number): void {
    if (!isCurrentOperation(token)) {
      return;
    }

    operationRunning.current = false;
    setOperation(null);
  }

  function runWorkspaceProcess(
    command: string,
    args: string[],
    token: number,
  ): Promise<ProcessResult> {
    return runProcess(command, args, processKillers.current, () =>
      isCurrentOperation(token),
    );
  }

  function syncQuestState(next: QuestState): void {
    setProgress(next.exerciseProgress[exerciseId] ?? null);
    setTotalXp(next.xp);
    setQuestState(next);
  }

  function persist(transform: (state: QuestState) => QuestState): QuestState {
    const loaded = loadQuestState(localStorage);
    const next = transform(loaded.state);
    saveQuestState(localStorage, next);
    syncQuestState(next);
    return next;
  }

  function saveCurrentFiles(announce = true) {
    const snapshot = tutorialStore.takeSnapshot().files;
    const modifiedFiles = selectModifiedFiles(snapshot, baselineFiles.current);
    persist((state) => saveExerciseFiles(state, exerciseId, modifiedFiles));
    if (announce) {
      setActivity({
        status: 'success',
        message: 'Code sauvegarde localement.',
      });
    }
  }

  async function runExercise() {
    if (!runtimeReady || operationRunning.current) {
      setActivity({
        status: 'failure',
        message: runtimeReady
          ? 'Une autre action est deja en cours.'
          : "L'atelier termine encore sa preparation.",
      });
      return;
    }

    const token = beginOperation('run');
    setActivity({ status: 'running', message: 'Compilation TypeScript...' });
    try {
      const result = await runWorkspaceProcess(
        'npm',
        ['run', 'typecheck', '--', '--pretty', 'false'],
        token,
      );

      if (!isCurrentOperation(token)) {
        return;
      }

      setActivity(
        result.exitCode === 0
          ? {
              status: 'success',
              message: 'Compilation reussie. Verifiez maintenant la mission.',
            }
          : {
              status: 'failure',
              message:
                'TypeScript a detecte une erreur. Lancez la validation pour afficher les conditions detaillees.',
            },
      );
    } catch (error) {
      if (!isCurrentOperation(token)) {
        return;
      }

      const message = processErrorMessage('La compilation a echoue', error);
      setOperationError(message);
      setDetailsOpen(true);
      setActivity({
        status: 'failure',
        message,
      });
    } finally {
      finishOperation(token);
    }
  }

  async function formatCurrentFile() {
    const document = tutorialStore.currentDocument.get();

    if (!runtimeReady || !document || operationRunning.current) {
      setActivity({
        status: 'failure',
        message: operationRunning.current
          ? 'Une autre action est deja en cours.'
          : "Aucun fichier pret a etre formate pour l'instant.",
      });
      return;
    }

    const token = beginOperation('format');
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

      if (!isCurrentOperation(token)) {
        return;
      }

      tutorialStore.updateFile(document.filePath, formatted);
      saveCurrentFiles();
      setActivity({
        status: 'success',
        message: `${document.filePath} a ete formate avec Prettier.`,
      });
    } catch (error) {
      if (!isCurrentOperation(token)) {
        return;
      }

      const message = `Prettier n'a pas pu formater le fichier actif. ${error instanceof Error ? error.message : 'Erreur inconnue.'}`;
      setOperationError(message);
      setDetailsOpen(true);
      setActivity({
        status: 'failure',
        message,
      });
    } finally {
      finishOperation(token);
    }
  }

  async function verifyExercise() {
    if (!runtimeReady || operationRunning.current) {
      setActivity({
        status: 'failure',
        message: runtimeReady
          ? 'Une validation est deja en cours.'
          : "L'atelier termine encore sa preparation.",
      });
      return;
    }

    const token = beginOperation('verify');
    setDetailsOpen(false);
    setActivity({
      status: 'running',
      message: 'Verification TypeScript, ESLint et tests fonctionnels...',
    });

    try {
      const validationSnapshot = tutorialStore.takeSnapshot().files;
      const validationRevision = workspaceRevision.current;
      const modifiedFiles = selectModifiedFiles(
        validationSnapshot,
        baselineFiles.current,
      );
      persist((state) => saveExerciseFiles(state, exerciseId, modifiedFiles));

      const typecheck = await runWorkspaceProcess(
        'npm',
        ['run', 'typecheck', '--', '--pretty', 'false'],
        token,
      );
      const lint = await runWorkspaceProcess('npm', ['run', 'lint'], token);
      const tests = await runWorkspaceProcess(
        'npm',
        ['run', 'test', '--', '--reporter=basic'],
        token,
      );

      if (!isCurrentOperation(token)) {
        return;
      }

      const currentSnapshot = tutorialStore.takeSnapshot().files;
      if (
        workspaceRevision.current !== validationRevision ||
        !filesAreEqual(validationSnapshot, currentSnapshot)
      ) {
        throw new Error(
          'Le code a ete modifie pendant la validation. Relancez-la pour controler la version actuelle.',
        );
      }

      const success =
        typecheck.exitCode === 0 && lint.exitCode === 0 && tests.exitCode === 0;
      const now = new Date().toISOString();
      const current = loadQuestState(localStorage).state;
      const alreadyCompleted = current.completedExercises.includes(exerciseId);
      const pedagogicalMessage = success
        ? alreadyCompleted
          ? 'Mission toujours validee. Les XP avaient deja ete attribues.'
          : `Mission reussie : +${xp} XP.`
        : 'Mission a corriger. Consultez les controles pour identifier la prochaine modification.';
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
            'Le comportement attendu est confirme par les tests.',
            "Le comportement attendu n'est pas encore obtenu. Relisez l'objectif et reproduisez l'interaction demandee.",
          ),
        ],
        pedagogicalMessage,
        technicalDetails: formatTechnicalDetails({ typecheck, lint, tests }),
        validatedAt: now,
      };

      let next = recordValidation(current, exerciseId, result);
      if (success) {
        next = completeExercise(next, exerciseId, xp, now);
      }
      saveQuestState(localStorage, next);
      syncQuestState(next);
      setDetailsOpen(true);
      setActivity({
        status: success ? 'success' : 'failure',
        message: pedagogicalMessage,
      });
    } catch (error) {
      if (!isCurrentOperation(token)) {
        return;
      }

      const message = processErrorMessage('La validation a echoue', error);
      setOperationError(message);
      setDetailsOpen(true);
      setActivity({
        status: 'failure',
        message,
      });
    } finally {
      finishOperation(token);
    }
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
    const activeProcessKillers = processKillers.current;
    setMounted(true);
    setCompatible(
      typeof crossOriginIsolated !== 'undefined' &&
        crossOriginIsolated &&
        typeof SharedArrayBuffer !== 'undefined' &&
        'serviceWorker' in navigator,
    );

    return () => {
      operationToken.current += 1;
      operationRunning.current = false;
      activeProcessKillers.forEach((kill) => kill());
      activeProcessKillers.clear();
    };
  }, []);

  useEffect(() => {
    const loaded = loadQuestState(localStorage);
    const opened = openExercise(loaded.state, exerciseId, contentVersion);
    saveQuestState(localStorage, opened);
    setCorruptedState(loaded.corruptedRaw !== null);
    setProgress(opened.exerciseProgress[exerciseId] ?? null);
    setTotalXp(opened.xp);
    setQuestState(opened);

    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let documentCleanups: Array<() => void> = [];
    let restored = false;
    let readyAnnounced = false;
    workspaceRevision.current = 0;
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
      setQuestState(next);
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
              workspaceRevision.current += 1;
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

  useEffect(() => {
    function warnBeforeLeaving(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>('a[href]')
          : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search)
      ) {
        return;
      }

      if (operationRunning.current) {
        event.preventDefault();
        event.stopPropagation();
        window.alert(
          'Une action est en cours. Attendez sa fin avant de quitter la mission.',
        );
        return;
      }

      if (progress?.status === 'completed') {
        return;
      }

      const message =
        "Cette mission n'est pas encore validee. Continuer sans gagner les XP ?";
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    document.addEventListener('click', warnBeforeLeaving, true);
    return () => document.removeEventListener('click', warnBeforeLeaving, true);
  }, [progress?.status]);

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (progress?.status === 'completed' && !operationRunning.current) {
        return;
      }

      event.preventDefault();
    }

    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [progress?.status]);

  const validation = progress?.lastValidation;

  function handleStateChange(state: QuestState): void {
    const opened = openExercise(state, exerciseId, contentVersion);
    saveQuestState(localStorage, opened);
    syncQuestState(opened);
    setCorruptedState(getCorruptedQuestState(localStorage) !== null);
  }

  const completed = progress?.status === 'completed';
  const busy = operation !== null;
  const toolbarTarget = mounted
    ? document.getElementById('quest-toolbar-root')
    : null;
  const statusLabel = completed
    ? 'Mission validee'
    : operation === 'verify'
      ? 'Validation en cours'
      : validation?.status === 'failure'
        ? 'A corriger'
        : runtimeReady
          ? 'A valider'
          : 'Preparation';
  const showDetailsAction =
    operationError !== null ||
    validation !== undefined ||
    activity.status === 'failure';

  const toolbar = (
    <div
      className="quest-toolbar"
      data-status={activity.status}
      aria-busy={busy}
    >
      <div className="quest-toolbar__state">
        <span className="quest-toolbar__dot" aria-hidden="true" />
        <span>
          <strong>{statusLabel}</strong>
          <small aria-live="polite">{activity.message}</small>
        </span>
      </div>

      <strong className="quest-toolbar__xp">{totalXp} XP</strong>

      {compatible === false ? (
        <span className="quest-toolbar__unsupported">
          Validation indisponible sur ce navigateur
        </span>
      ) : (
        <>
          <button
            className="quest-toolbar__primary"
            data-quest-action="verify"
            disabled={!runtimeReady || busy}
            onClick={() => void verifyExercise()}
          >
            {operation === 'verify'
              ? 'Validation...'
              : completed
                ? 'Revalider la mission'
                : `Valider la mission · +${xp} XP`}
          </button>

          {showDetailsAction && (
            <button
              className="quest-toolbar__result-button"
              type="button"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              Resultat
            </button>
          )}

          <details className="quest-toolbar__tools">
            <summary>Outils</summary>
            <div className="quest-toolbar__menu">
              <button
                data-quest-action="run"
                disabled={!runtimeReady || busy}
                onClick={() => void runExercise()}
              >
                Executer
              </button>
              <button
                data-quest-action="format"
                disabled={!runtimeReady || busy}
                onClick={() => void formatCurrentFile()}
              >
                Formater
              </button>
              <button
                data-quest-action="save"
                disabled={!runtimeReady || busy}
                onClick={() => saveCurrentFiles()}
              >
                Sauvegarder
              </button>
              <button disabled={busy} onClick={showNextHint}>
                Afficher un indice
              </button>
              <button disabled={busy} onClick={showSolution}>
                Voir la solution
              </button>
              <button disabled={busy} onClick={resetExercise}>
                Reinitialiser
              </button>
              <button
                disabled={!runtimeReady || busy}
                onClick={openLargePreview}
              >
                Agrandir le resultat
              </button>
            </div>
          </details>

          {detailsOpen && (
            <section
              className="quest-toolbar__results"
              aria-label="Resultat de la validation"
            >
              <div className="quest-toolbar__results-heading">
                <strong>Resultat de la validation</strong>
                <button
                  type="button"
                  aria-label="Fermer le resultat"
                  onClick={() => setDetailsOpen(false)}
                >
                  Fermer
                </button>
              </div>
              {operationError ? (
                <p role="alert">Erreur technique : {operationError}</p>
              ) : validation ? (
                <ValidationDetails validation={validation} />
              ) : (
                <p>Erreur technique : {activity.message}</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      {toolbarTarget && createPortal(toolbar, toolbarTarget)}

      <section className="quest-actions" aria-label="Suivi de la mission">
        <div className="quest-actions__heading">
          <div>
            <p>Validation de la mission</p>
            <h2>{completed ? 'Mission validee' : 'Mission en cours'}</h2>
          </div>
          <strong>{totalXp} XP</strong>
        </div>

        {compatible === null && (
          <p className="quest-actions__message">
            Verification de la compatibilite...
          </p>
        )}

        {compatible === false && (
          <div className="quest-compatibility" role="status">
            <strong>Atelier interactif indisponible</strong>
            <p>
              Utilisez Chrome ou Edge sur ordinateur. La validation requiert
              WebContainers, SharedArrayBuffer et un contexte isole.
            </p>
          </div>
        )}

        {compatible && !validation && (
          <p className="quest-actions__message">
            Modifiez le code, puis utilisez le bouton « Valider la mission »
            toujours visible dans la barre superieure.
          </p>
        )}

        {corruptedState && (
          <p className="quest-actions__warning" role="alert">
            Une ancienne progression illisible a ete ignoree. Elle pourra etre
            exportee ou supprimee depuis les reglages.
          </p>
        )}

        {(progress?.hintsRevealed ?? []).map((hintIndex) => (
          <div className="quest-hint" key={hintIndex}>
            <strong>Indice {hintIndex + 1}</strong>
            <p>{hints[hintIndex]}</p>
          </div>
        ))}

        {validation && <ValidationDetails validation={validation} />}

        {questState && (
          <ProgressSettings
            state={questState}
            onStateChange={handleStateChange}
          />
        )}
      </section>
    </>
  );
}

function ValidationDetails({ validation }: { validation: ValidationResult }) {
  return (
    <div className="quest-validation" data-status={validation.status}>
      <p className="quest-validation__summary">
        {validation.pedagogicalMessage}
      </p>
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
  );
}

async function runProcess(
  command: string,
  args: string[],
  processKillers: Set<() => void>,
  isActive: () => boolean,
): Promise<ProcessResult> {
  assertOperationActive(isActive);
  const instance = await webcontainer;
  assertOperationActive(isActive);
  const process = await instance.spawn(command, args);
  const kill = () => process.kill();

  if (!isActive()) {
    kill();
    throw new Error('Operation annulee.');
  }

  processKillers.add(kill);
  let output = '';
  let outputFailure: unknown;
  const outputComplete = process.output
    .pipeTo(
      new WritableStream({
        write(chunk) {
          output += chunk;
        },
      }),
    )
    .catch((error: unknown) => {
      outputFailure = error;
    });
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const exitCode = await Promise.race([
      process.exit,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          kill();
          reject(
            new Error(
              `La commande ${command} a depasse ${PROCESS_TIMEOUT_MS / 1000} secondes.`,
            ),
          );
        }, PROCESS_TIMEOUT_MS);
      }),
    ]);
    await outputComplete;
    if (outputFailure) {
      throw outputFailure;
    }

    return { exitCode, output };
  } finally {
    clearTimeout(timeout);
    processKillers.delete(kill);
  }
}

function assertOperationActive(isActive: () => boolean): void {
  if (!isActive()) {
    throw new Error('Operation annulee.');
  }
}

function processErrorMessage(context: string, error: unknown): string {
  return `${context}. ${error instanceof Error ? error.message : 'Erreur inconnue.'}`;
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

function filesAreEqual(
  first: Record<string, string>,
  second: Record<string, string>,
): boolean {
  const paths = Object.keys(first);

  return (
    paths.length === Object.keys(second).length &&
    paths.every((path) => first[path] === second[path])
  );
}
