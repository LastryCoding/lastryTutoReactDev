import { describe, expect, it } from 'vitest';
import {
  acquiredConcepts,
  isLessonUnlocked,
  nextLesson,
  sprintLessons,
  type CurriculumLesson,
} from './curriculum';

const lessons: CurriculumLesson[] = [
  lesson('camp-01', [], ['JSX']),
  lesson('camp-02', ['camp-01'], ['JSX', 'expression']),
  lesson('bonus-01', ['camp-01'], ['semantique'], true),
];

describe('curriculum', () => {
  it('derive le deblocage exclusivement des prerequis termines', () => {
    expect(isLessonUnlocked(lessons[0]!, [])).toBe(true);
    expect(isLessonUnlocked(lessons[1]!, [])).toBe(false);
    expect(isLessonUnlocked(lessons[1]!, ['camp-01'])).toBe(true);
  });

  it('reprend la mission active puis priorise le parcours principal', () => {
    expect(nextLesson(lessons, [], 'camp-01')?.id).toBe('camp-01');
    expect(nextLesson(lessons, ['camp-01'], null)?.id).toBe('camp-02');
    expect(sprintLessons(lessons, ['camp-01']).map((item) => item.id)).toEqual([
      'camp-02',
      'bonus-01',
    ]);
  });

  it('deduplique les acquis des missions terminees', () => {
    expect(acquiredConcepts(lessons, ['camp-01', 'camp-02'])).toEqual([
      'expression',
      'JSX',
    ]);
  });
});

function lesson(
  id: string,
  prerequisites: string[],
  concepts: string[],
  bonus = false,
): CurriculumLesson {
  return {
    bonus,
    concepts,
    estimatedMinutes: 15,
    id,
    order: 1,
    prerequisites,
    route: `/${id}`,
    title: id,
    world: 0,
    xp: 50,
  };
}
