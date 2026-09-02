import { useEffect, useState } from 'react';
import {
  acquiredConcepts,
  isLessonUnlocked,
  nextLesson,
  sprintLessons,
  type CurriculumLesson,
} from '@/domain/curriculum';
import { updateSettings, type QuestState } from '@/domain/progress';
import { loadQuestState, saveQuestState } from '@/storage/progress-store';
import ProgressSettings from './ProgressSettings';
import './Dashboard.css';
import './ProgressSettings.css';

interface DashboardProps {
  lessons: CurriculumLesson[];
}

const WORLD_NAMES = [
  'Le Camp de base',
  'Le Village des composants',
  'La Foret des hooks',
  'La Citadelle des applications',
  "L'Observatoire TypeScript",
  'Le Portail de production',
];

const WORLD_DESCRIPTIONS = [
  'Prendre en main JSX et creer ses premiers composants.',
  'Faire circuler les donnees et composer une interface.',
  'Maitriser les hooks, les effets et la logique reutilisable.',
  'Construire des flux solides pour une application complete.',
  'Rendre les contrats TypeScript plus precis et plus surs.',
  'Assembler une interface accessible, testable et prete a livrer.',
];

const BADGE_LABELS: Record<string, string> = {
  'premier-pas': 'Premier pas',
};

export default function Dashboard({ lessons }: DashboardProps) {
  const [state, setState] = useState<QuestState | null>(null);

  useEffect(() => {
    setState(loadQuestState(localStorage).state);
  }, []);

  if (!state) {
    return (
      <main className="quest-dashboard quest-dashboard--loading">
        <p>Lecture de votre carnet de quete...</p>
      </main>
    );
  }

  const completed = state.completedExercises;
  const mainLessons = lessons.filter((lesson) => !lesson.bonus);
  const mainCompleted = mainLessons.filter((lesson) =>
    completed.includes(lesson.id),
  ).length;
  const progressPercent = Math.round(
    (mainCompleted / mainLessons.length) * 100,
  );
  const resumeLesson = nextLesson(lessons, completed, state.activeExerciseId);
  const concepts = acquiredConcepts(lessons, completed);
  const sprint = sprintLessons(lessons, completed);

  function toggleSprint() {
    if (!state) return;
    const next = updateSettings(state, {
      ...state.settings,
      sprintMode: !state.settings.sprintMode,
    });
    saveQuestState(localStorage, next);
    setState(next);
  }

  return (
    <main className="quest-dashboard">
      <header className="quest-dashboard__hero">
        <nav aria-label="Navigation principale">
          <a className="quest-dashboard__brand" href="/">
            <span>RQ</span>
            React Quest
          </a>
          <a href="#worlds">Carte des mondes</a>
          <a href="#journal">Journal</a>
        </nav>

        <div className="quest-dashboard__hero-grid">
          <div>
            <p className="quest-dashboard__eyebrow">
              Parcours React en francais
            </p>
            <h1>Traversez le royaume, une mission a la fois.</h1>
            <p className="quest-dashboard__intro">
              44 ateliers principaux et 8 defis bonus. Votre code reste dans ce
              navigateur, sans compte et sans serveur d'execution.
            </p>
            {resumeLesson ? (
              <a className="quest-dashboard__cta" href={resumeLesson.route}>
                {completed.length === 0 ? 'Commencer la quete' : 'Reprendre'}
                <span>{resumeLesson.title}</span>
              </a>
            ) : (
              <p className="quest-dashboard__complete">
                Parcours principal termine. Les bonus restent accessibles sur la
                carte.
              </p>
            )}
          </div>

          <div className="quest-dashboard__compass" aria-label="Progression">
            <span className="quest-dashboard__compass-value">
              {progressPercent}%
            </span>
            <span>du chemin principal</span>
            <div
              className="quest-dashboard__progress"
              role="progressbar"
              aria-label="Progression du parcours principal"
              aria-valuemin={0}
              aria-valuemax={44}
              aria-valuenow={mainCompleted}
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="quest-dashboard__stats">
              <strong>{state.xp} XP</strong>
              <span>{mainCompleted}/44 missions</span>
              <span>{state.badges.length} badges</span>
            </div>
          </div>
        </div>
      </header>

      <section className="quest-dashboard__section" id="worlds">
        <div className="quest-dashboard__section-heading">
          <p className="quest-dashboard__eyebrow">Atlas de progression</p>
          <h2>Les six mondes</h2>
        </div>

        <div className="quest-worlds">
          {WORLD_NAMES.map((name, world) => {
            const worldLessons = lessons.filter(
              (lesson) => lesson.world === world,
            );
            const worldMain = worldLessons.filter((lesson) => !lesson.bonus);
            const completedCount = worldMain.filter((lesson) =>
              completed.includes(lesson.id),
            ).length;
            const available = worldLessons.find(
              (lesson) =>
                !completed.includes(lesson.id) &&
                isLessonUnlocked(lesson, completed),
            );
            const finished = completedCount === worldMain.length;
            const locked = !available && !finished;

            return (
              <article
                className="quest-world"
                data-status={
                  finished ? 'completed' : locked ? 'locked' : 'open'
                }
                key={name}
              >
                <div className="quest-world__number">0{world + 1}</div>
                <div className="quest-world__content">
                  <p>
                    {finished
                      ? 'Explore'
                      : locked
                        ? 'Verrouille'
                        : 'Accessible'}
                  </p>
                  <h3>{name}</h3>
                  <span>{WORLD_DESCRIPTIONS[world]}</span>
                  <div className="quest-world__meter">
                    <span
                      style={{
                        width: `${Math.round((completedCount / worldMain.length) * 100)}%`,
                      }}
                    />
                  </div>
                  <small>
                    {completedCount}/{worldMain.length} missions
                    {worldLessons.some((lesson) => lesson.bonus)
                      ? ` + ${worldLessons.filter((lesson) => lesson.bonus).length} bonus`
                      : ''}
                  </small>
                  {available ? (
                    <a href={available.route}>{available.title}</a>
                  ) : finished ? (
                    <span className="quest-world__done">Monde complete</span>
                  ) : (
                    <span className="quest-world__locked">
                      Terminez le monde precedent
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="quest-dashboard__section quest-journal" id="journal">
        <div className="quest-dashboard__section-heading">
          <p className="quest-dashboard__eyebrow">Carnet personnel</p>
          <h2>Votre journal de bord</h2>
        </div>

        <div className="quest-journal__grid">
          <article className="quest-journal__card quest-journal__card--sprint">
            <div>
              <p className="quest-dashboard__eyebrow">Session courte</p>
              <h3>Mode sprint</h3>
              <p>
                Une selection de missions accessibles pour avancer en 20
                minutes.
              </p>
            </div>
            <button
              type="button"
              aria-pressed={state.settings.sprintMode}
              onClick={toggleSprint}
            >
              {state.settings.sprintMode ? 'Sprint actif' : 'Activer le sprint'}
            </button>
            {state.settings.sprintMode && (
              <ol>
                {sprint.map((lesson) => (
                  <li key={lesson.id}>
                    <a href={lesson.route}>{lesson.title}</a>
                    <span>{lesson.estimatedMinutes} min</span>
                  </li>
                ))}
              </ol>
            )}
          </article>

          <article className="quest-journal__card">
            <p className="quest-dashboard__eyebrow">Competences confirmees</p>
            <h3>Acquis</h3>
            {concepts.length > 0 ? (
              <ul className="quest-journal__tags">
                {concepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>
            ) : (
              <p>Validez une mission pour inscrire votre premier acquis.</p>
            )}
          </article>

          <article className="quest-journal__card">
            <p className="quest-dashboard__eyebrow">Recompenses locales</p>
            <h3>Badges</h3>
            {state.badges.length > 0 ? (
              <ul className="quest-journal__badges">
                {state.badges.map((badge) => (
                  <li key={badge}>{BADGE_LABELS[badge] ?? badge}</li>
                ))}
              </ul>
            ) : (
              <p>Votre premier badge se debloque avec la premiere mission.</p>
            )}
          </article>
        </div>

        <ProgressSettings state={state} onStateChange={setState} />
      </section>

      <footer>
        <strong>React Quest</strong>
        <span>Local par conception. Propulse par TutorialKit.</span>
      </footer>
    </main>
  );
}
