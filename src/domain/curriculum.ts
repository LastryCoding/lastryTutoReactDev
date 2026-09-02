export interface CurriculumLesson {
  bonus: boolean;
  concepts: string[];
  estimatedMinutes: number;
  id: string;
  order: number;
  prerequisites: string[];
  route: string;
  title: string;
  world: number;
  xp: number;
}

export function isLessonUnlocked(
  lesson: CurriculumLesson,
  completedExercises: readonly string[],
): boolean {
  return lesson.prerequisites.every((id) => completedExercises.includes(id));
}

export function nextLesson(
  lessons: readonly CurriculumLesson[],
  completedExercises: readonly string[],
  activeExerciseId: string | null,
): CurriculumLesson | null {
  const active = lessons.find(
    (lesson) =>
      lesson.id === activeExerciseId &&
      !completedExercises.includes(lesson.id) &&
      isLessonUnlocked(lesson, completedExercises),
  );
  if (active) return active;

  return (
    lessons.find(
      (lesson) =>
        !lesson.bonus &&
        !completedExercises.includes(lesson.id) &&
        isLessonUnlocked(lesson, completedExercises),
    ) ??
    lessons.find(
      (lesson) =>
        !completedExercises.includes(lesson.id) &&
        isLessonUnlocked(lesson, completedExercises),
    ) ??
    null
  );
}

export function sprintLessons(
  lessons: readonly CurriculumLesson[],
  completedExercises: readonly string[],
  limit = 2,
): CurriculumLesson[] {
  return lessons
    .filter(
      (lesson) =>
        !completedExercises.includes(lesson.id) &&
        isLessonUnlocked(lesson, completedExercises),
    )
    .sort((left, right) => Number(left.bonus) - Number(right.bonus))
    .slice(0, limit);
}

export function acquiredConcepts(
  lessons: readonly CurriculumLesson[],
  completedExercises: readonly string[],
): string[] {
  const completed = new Set(completedExercises);
  return [
    ...new Set(
      lessons
        .filter((lesson) => completed.has(lesson.id))
        .flatMap((lesson) => lesson.concepts),
    ),
  ].sort((left, right) => left.localeCompare(right, 'fr'));
}
