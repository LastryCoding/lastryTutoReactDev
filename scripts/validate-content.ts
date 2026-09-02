import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

interface Lesson {
  bonus: boolean;
  content: string;
  directory: string;
  file: string;
  id: string;
  order: number;
  prerequisites: string[];
  template: string;
  world: number;
}

const root = process.cwd();
const tutorialRoot = join(root, 'src', 'content', 'tutorial');
const templatesRoot = join(root, 'src', 'templates');
const contentFiles = findAllFiles(tutorialRoot).filter((file) =>
  /content\.mdx?$/.test(file),
);
const errors: string[] = [];
const lessons = contentFiles.map(parseLesson);
const expectedMainByWorld = [4, 8, 8, 9, 7, 8];

if (contentFiles.length !== 52) {
  errors.push(
    `Le parcours doit contenir 52 lecons (44 principales et 8 bonus), pas ${contentFiles.length}.`,
  );
}

const ids = new Map<string, Lesson>();
for (const lesson of lessons) {
  const label = relative(tutorialRoot, lesson.file);
  const metadata = frontmatter(lesson.content);
  const custom = customBlock(lesson.content);
  const starter = join(lesson.directory, '_files');
  const solution = join(lesson.directory, '_solution');
  const starterFiles = existsSync(starter) ? relativeFiles(starter) : [];
  const solutionFiles = existsSync(solution) ? relativeFiles(solution) : [];

  if (!lesson.content.includes('type: lesson')) {
    errors.push(`${label}: type lesson manquant.`);
  }
  for (const name of ['title', 'slug', 'template', 'focus']) {
    validateRequired(metadata, name, label);
  }
  if (!lesson.id) errors.push(`${label}: custom.id manquant.`);
  if (ids.has(lesson.id)) errors.push(`${label}: id ${lesson.id} duplique.`);
  else ids.set(lesson.id, lesson);
  if (!Number.isInteger(lesson.world) || lesson.world < 0 || lesson.world > 5) {
    errors.push(`${label}: world doit etre compris entre 0 et 5.`);
  }
  if (!Number.isInteger(lesson.order) || lesson.order < 1) {
    errors.push(`${label}: order doit etre un entier positif.`);
  }
  if (Number.parseInt(basename(lesson.directory), 10) !== lesson.order) {
    errors.push(`${label}: order ne correspond pas au prefixe du dossier.`);
  }

  validateNumber(custom, 'estimatedMinutes', 10, 20, label);
  validateNumber(custom, 'xp', 1, Number.MAX_SAFE_INTEGER, label);
  validateNumber(custom, 'contentVersion', 1, Number.MAX_SAFE_INTEGER, label);
  validateRequired(custom, 'difficulty', label);
  validateRequired(custom, 'prerequisites', label);
  validateRequired(custom, 'bonus', label);
  if (!/^\s*prerequisites:\s*\[.*\]\s*$/m.test(custom)) {
    errors.push(`${label}: prerequisites doit etre une liste YAML en ligne.`);
  }
  if (!['true', 'false'].includes(field(custom, 'bonus'))) {
    errors.push(`${label}: bonus doit etre un booleen.`);
  }
  const concepts = parseList(custom, 'concepts');
  if (concepts.length === 0) errors.push(`${label}: concepts manquants.`);

  if (!lesson.template) errors.push(`${label}: template declare manquant.`);
  if (lesson.template !== lesson.id) {
    errors.push(`${label}: le template doit porter l'id ${lesson.id}.`);
  }
  const templateDirectory = join(templatesRoot, lesson.template);
  const templateConfig = join(templateDirectory, '.tk-config.json');
  const hiddenTest = join(templateDirectory, 'src', 'App.test.tsx');
  if (!existsSync(templateConfig)) {
    errors.push(`${label}: .tk-config.json du template manquant.`);
  } else {
    try {
      const config = JSON.parse(readFileSync(templateConfig, 'utf8')) as {
        extends?: unknown;
      };
      if (config.extends !== '../react') {
        errors.push(`${label}: le template doit etendre ../react.`);
      }
    } catch {
      errors.push(`${label}: .tk-config.json invalide.`);
    }
  }
  if (!existsSync(hiddenTest)) {
    errors.push(`${label}: test comportemental cache manquant.`);
  }

  if (starterFiles.length === 0) errors.push(`${label}: starter manquant.`);
  if (solutionFiles.length === 0) errors.push(`${label}: solution manquante.`);
  if (!sameFiles(starterFiles, solutionFiles)) {
    errors.push(
      `${label}: starter et solution ne declarent pas les memes fichiers.`,
    );
  }
  const starterSource = starterFiles
    .map((file) => readFileSync(join(starter, file), 'utf8'))
    .join('\n');
  const solutionSource = solutionFiles
    .map((file) => readFileSync(join(solution, file), 'utf8'))
    .join('\n');
  if (!starterSource.includes('TODO')) {
    errors.push(`${label}: le starter doit contenir un TODO guidant.`);
  }
  if (solutionSource.includes('TODO')) {
    errors.push(`${label}: la solution contient encore un TODO.`);
  }
  if (starterSource === solutionSource) {
    errors.push(`${label}: starter et solution sont identiques.`);
  }

  for (const heading of [
    /## Objectif/,
    /## (Etapes|Étapes)/,
    /## (Resultat attendu|Résultat attendu)/,
  ]) {
    if (!heading.test(lesson.content)) {
      errors.push(
        `${label}: section pedagogique manquante (${heading.source}).`,
      );
    }
  }
  if (!lesson.content.includes('<ExerciseActions')) {
    errors.push(`${label}: ExerciseActions manquant.`);
  }
  if (!lesson.content.includes(`exerciseId="${lesson.id}"`)) {
    errors.push(`${label}: ExerciseActions utilise un mauvais id.`);
  }
  const metadataXp = numberField(custom, 'xp');
  if (!lesson.content.includes(`xp={${metadataXp}}`)) {
    errors.push(`${label}: ExerciseActions utilise un mauvais nombre de XP.`);
  }
  const metadataVersion = numberField(custom, 'contentVersion');
  if (!lesson.content.includes(`contentVersion={${metadataVersion}}`)) {
    errors.push(`${label}: ExerciseActions utilise une mauvaise version.`);
  }
  const hints = lesson.content.match(/hints=\{\[([\s\S]*?)\]\}/)?.[1];
  const hintCount = hints?.match(/^\s*['"].*['"],?\s*$/gm)?.length ?? 0;
  if (hintCount < 1 || hintCount > 3) {
    errors.push(`${label}: ExerciseActions doit proposer de 1 a 3 indices.`);
  }
}

for (const lesson of lessons) {
  const label = relative(tutorialRoot, lesson.file);
  for (const prerequisite of lesson.prerequisites) {
    const required = ids.get(prerequisite);
    if (!required) {
      errors.push(`${label}: prerequis inconnu ${prerequisite}.`);
      continue;
    }
    if (required.id === lesson.id) {
      errors.push(`${label}: une lecon ne peut pas dependre d'elle-meme.`);
    }
    if (!isBefore(required, lesson)) {
      errors.push(
        `${label}: le prerequis ${prerequisite} doit apparaitre avant la lecon.`,
      );
    }
    if (!lesson.bonus && required.bonus) {
      errors.push(
        `${label}: une mission principale ne peut pas dependre d'un bonus.`,
      );
    }
  }
  if (
    !lesson.bonus &&
    lesson.id !== 'camp-01' &&
    lesson.prerequisites.length === 0
  ) {
    errors.push(`${label}: mission principale sans prerequis.`);
  }
}

for (let world = 0; world < expectedMainByWorld.length; world += 1) {
  const worldLessons = lessons.filter((lesson) => lesson.world === world);
  const mainCount = worldLessons.filter((lesson) => !lesson.bonus).length;
  if (mainCount !== expectedMainByWorld[world]) {
    errors.push(
      `world${world}: ${expectedMainByWorld[world]} missions principales attendues, ${mainCount} trouvees.`,
    );
  }
  const orders = worldLessons
    .map((lesson) => lesson.order)
    .sort((a, b) => a - b);
  const expectedOrders = Array.from(
    { length: worldLessons.length },
    (_, index) => index + 1,
  );
  if (orders.join(',') !== expectedOrders.join(',')) {
    errors.push(`world${world}: les ordres doivent etre uniques et continus.`);
  }
}

const mainCount = lessons.filter((lesson) => !lesson.bonus).length;
const bonusCount = lessons.filter((lesson) => lesson.bonus).length;
if (mainCount !== 44)
  errors.push(`44 missions principales attendues, ${mainCount} trouvees.`);
if (bonusCount !== 8) errors.push(`8 bonus attendus, ${bonusCount} trouves.`);

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  `${lessons.length} lecons valides : ${mainCount} principales (${expectedMainByWorld.join('/')}) et ${bonusCount} bonus non bloquants.`,
);

function parseLesson(file: string): Lesson {
  const content = readFileSync(file, 'utf8');
  const custom = customBlock(content);
  return {
    bonus: field(custom, 'bonus') === 'true',
    content,
    directory: join(file, '..'),
    file,
    id: field(custom, 'id'),
    order: numberField(custom, 'order'),
    prerequisites: parseInlineList(field(custom, 'prerequisites')),
    template: field(frontmatter(content), 'template'),
    world: numberField(custom, 'world'),
  };
}

function frontmatter(content: string): string {
  return content.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '';
}

function customBlock(content: string): string {
  return frontmatter(content).match(/^custom:\s*\n([\s\S]*)$/m)?.[1] ?? '';
}

function field(block: string, name: string): string {
  return block.match(new RegExp(`^\\s*${name}:\\s*(.*?)\\s*$`, 'm'))?.[1] ?? '';
}

function numberField(block: string, name: string): number {
  return Number(field(block, name));
}

function parseInlineList(value: string): string[] {
  if (!value.startsWith('[') || !value.endsWith(']')) return [];
  return value
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseList(block: string, name: string): string[] {
  const list = block.match(
    new RegExp(`^\\s*${name}:\\s*\\n((?:\\s+-\\s+.+(?:\\n|$))+)`, 'm'),
  )?.[1];
  return (
    list
      ?.match(/^\s+-\s+(.+)$/gm)
      ?.map((line) => line.replace(/^\s+-\s+/, '')) ?? []
  );
}

function validateRequired(block: string, name: string, label: string): void {
  if (!field(block, name)) errors.push(`${label}: ${name} manquant.`);
}

function validateNumber(
  block: string,
  name: string,
  minimum: number,
  maximum: number,
  label: string,
): void {
  const value = numberField(block, name);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    errors.push(
      `${label}: ${name} doit etre compris entre ${minimum} et ${maximum}.`,
    );
  }
}

function isBefore(required: Lesson, lesson: Lesson): boolean {
  return (
    required.world < lesson.world ||
    (required.world === lesson.world && required.order < lesson.order)
  );
}

function sameFiles(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((file, index) => file === right[index])
  );
}

function relativeFiles(directory: string): string[] {
  return findAllFiles(directory)
    .map((file) => relative(directory, file))
    .sort();
}

function findAllFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findAllFiles(path) : [path];
  });
}
