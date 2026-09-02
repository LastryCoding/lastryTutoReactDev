import { useEffect, useState, type ChangeEvent } from 'react';
import {
  updateSettings,
  type QuestSettings,
  type QuestState,
} from '@/domain/progress';
import {
  discardCorruptedQuestState,
  exportQuestState,
  getCorruptedQuestState,
  replaceQuestState,
  resetQuestState,
  saveQuestState,
} from '@/storage/progress-store';
import './ProgressSettings.css';

interface ProgressSettingsProps {
  state: QuestState;
  onStateChange: (state: QuestState) => void;
}

export default function ProgressSettings({
  state,
  onStateChange,
}: ProgressSettingsProps) {
  const [corruptedRaw, setCorruptedRaw] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setCorruptedRaw(getCorruptedQuestState(localStorage));
  }, []);

  function changeSettings(settings: QuestSettings) {
    const next = updateSettings(state, settings);
    saveQuestState(localStorage, next);
    onStateChange(next);
    setMessage('Preferences enregistrees dans ce navigateur.');
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    const result = replaceQuestState(localStorage, await file.text());
    if (!result.success) {
      setMessage(`${result.message} La progression actuelle est conservee.`);
      return;
    }

    setCorruptedRaw(null);
    onStateChange(result.state);
    setMessage('Sauvegarde importee et validee.');
  }

  function resetAllProgress() {
    if (
      !window.confirm(
        'Supprimer toute la progression, le code, les XP, les badges et les preferences ?',
      )
    ) {
      return;
    }

    const next = resetQuestState(localStorage);
    setCorruptedRaw(null);
    onStateChange(next);
    setMessage('Toutes les donnees locales ont ete reinitialisees.');
  }

  function discardCorrupted() {
    if (!window.confirm('Supprimer definitivement la sauvegarde illisible ?')) {
      return;
    }
    discardCorruptedQuestState(localStorage);
    setCorruptedRaw(null);
    setMessage('La sauvegarde illisible a ete supprimee.');
  }

  return (
    <details className="quest-settings">
      <summary>Progression et preferences</summary>

      <div className="quest-settings__grid">
        <label>
          Theme
          <select
            value={state.settings.theme}
            onChange={(event) =>
              changeSettings({
                ...state.settings,
                theme: event.currentTarget.value as QuestSettings['theme'],
              })
            }
          >
            <option value="system">Systeme</option>
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </label>

        <label>
          Taille du texte ({state.settings.fontSize}px)
          <input
            type="range"
            min="12"
            max="24"
            value={state.settings.fontSize}
            onChange={(event) =>
              changeSettings({
                ...state.settings,
                fontSize: event.currentTarget.valueAsNumber,
              })
            }
          />
        </label>

        <label>
          Animations
          <select
            value={state.settings.reducedMotion}
            onChange={(event) =>
              changeSettings({
                ...state.settings,
                reducedMotion: event.currentTarget
                  .value as QuestSettings['reducedMotion'],
              })
            }
          >
            <option value="system">Systeme</option>
            <option value="reduce">Reduire</option>
            <option value="allow">Autoriser</option>
          </select>
        </label>

        <label className="quest-settings__check">
          <input
            type="checkbox"
            checked={state.settings.sprintMode}
            onChange={(event) =>
              changeSettings({
                ...state.settings,
                sprintMode: event.currentTarget.checked,
              })
            }
          />
          Mode sprint
        </label>
      </div>

      <div className="quest-settings__actions">
        <button
          type="button"
          onClick={() =>
            downloadJson(
              `reactquest-${new Date().toISOString().slice(0, 10)}.json`,
              exportQuestState(state),
            )
          }
        >
          Exporter ma progression
        </button>
        <label className="quest-settings__import">
          Importer une sauvegarde
          <input
            className="quest-settings__file"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void importFile(event)}
          />
        </label>
        <button
          className="quest-settings__danger"
          type="button"
          onClick={resetAllProgress}
        >
          Tout reinitialiser
        </button>
      </div>

      {corruptedRaw !== null && (
        <div className="quest-settings__recovery" role="alert">
          <strong>Sauvegarde illisible recuperee</strong>
          <p>
            Le JSON brut est conserve separement. Telechargez-le avant de le
            supprimer si vous souhaitez tenter une recuperation manuelle.
          </p>
          <button
            type="button"
            onClick={() =>
              downloadJson('reactquest-sauvegarde-illisible.json', corruptedRaw)
            }
          >
            Telecharger le JSON illisible
          </button>
          <button type="button" onClick={discardCorrupted}>
            Supprimer le JSON illisible
          </button>
        </div>
      )}

      {message && (
        <p className="quest-settings__message" aria-live="polite">
          {message}
        </p>
      )}
    </details>
  );
}

function downloadJson(fileName: string, contents: string): void {
  const url = URL.createObjectURL(
    new Blob([contents], { type: 'application/json;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
