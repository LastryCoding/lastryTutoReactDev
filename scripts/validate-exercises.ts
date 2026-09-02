import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';

interface Lesson {
  directory: string;
  id: string;
  name: string;
  template: string;
}

interface VitestReport {
  testResults?: Array<{
    assertionResults?: Array<{ status?: string }>;
    name?: string;
    status?: string;
  }>;
}

const root = process.cwd();
const tutorialRoot = join(root, 'src', 'content', 'tutorial');
const templatesRoot = join(root, 'src', 'templates');
const lessons = findContentFiles(tutorialRoot).map(parseLesson);
const temporaryRoot = mkdtempSync(join(tmpdir(), 'react-quest-validation-'));
const exercisesRoot = join(temporaryRoot, 'src', 'exercises');
const reportFile = join(temporaryRoot, 'vitest-report.json');
const npmCommand = 'npm';
const failures: string[] = [];

try {
  if (lessons.length === 0) throw new Error('Aucune lecon a valider.');
  copyResolvedTemplate('react', temporaryRoot);
  run(
    npmCommand,
    ['ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    temporaryRoot,
    true,
  );

  prepareVariant('_files');
  if (run(npmCommand, ['run', 'typecheck'], temporaryRoot, false) !== 0) {
    failures.push('Les starters doivent tous compiler avec TypeScript.');
  }
  const starterExitCode = runTests();
  const starterReport = readReport();
  if (starterExitCode === 0) {
    failures.push('Les starters passent deja tous les tests comportementaux.');
  }
  validateStarterFailures(starterReport);

  prepareVariant('_solution');
  if (run(npmCommand, ['run', 'typecheck'], temporaryRoot, false) !== 0) {
    failures.push('Les solutions ne passent pas le typecheck groupe.');
  }
  if (run(npmCommand, ['run', 'lint'], temporaryRoot, false) !== 0) {
    failures.push('Les solutions ne passent pas le lint groupe.');
  }
  const solutionExitCode = runTests();
  const solutionReport = readReport();
  if (solutionExitCode !== 0) {
    failures.push('Au moins une solution echoue aux tests comportementaux.');
    if (process.env.VERBOSE_EXERCISES === '1') {
      const summary = { ...solutionReport };
      delete summary.testResults;
      console.error(JSON.stringify(summary, null, 2));
      console.error(
        solutionReport.testResults
          ?.filter((result) => result.status !== 'passed')
          .map((result) => `${result.name}: ${result.status}`)
          .join('\n'),
      );
    }
  }
  validateSolutionSuccesses(solutionReport);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `${lessons.length} exercices valides avec leur template declare : starters types mais en echec comportemental, solutions typees, lintes et valides.`,
);

function prepareVariant(variant: '_files' | '_solution'): void {
  rmSync(exercisesRoot, { recursive: true, force: true });
  mkdirSync(exercisesRoot, { recursive: true });
  rmSync(reportFile, { force: true });

  for (const lesson of lessons) {
    const destination = join(exercisesRoot, lesson.id);
    const templateSource = join(templatesRoot, lesson.template, 'src');
    if (!existsSync(templateSource)) {
      failures.push(
        `${lesson.name}: sources du template ${lesson.template} introuvables.`,
      );
      continue;
    }
    cpSync(templateSource, destination, { recursive: true, force: true });

    const lessonSource = join(lesson.directory, variant, 'src');
    if (!existsSync(lessonSource)) {
      failures.push(`${lesson.name}: ${variant}/src introuvable.`);
      continue;
    }
    cpSync(lessonSource, destination, { recursive: true, force: true });
  }
}

function runTests(): number {
  return run(
    npmCommand,
    ['run', 'test', '--', '--reporter=json', `--outputFile=${reportFile}`],
    temporaryRoot,
    false,
  );
}

function readReport(): VitestReport {
  if (!existsSync(reportFile)) {
    failures.push('Vitest n’a produit aucun rapport JSON.');
    return {};
  }
  return JSON.parse(readFileSync(reportFile, 'utf8')) as VitestReport;
}

function validateStarterFailures(report: VitestReport): void {
  for (const lesson of lessons) {
    const result = reportFor(report, lesson);
    if (!result) {
      failures.push(`${lesson.name}: test du starter absent du rapport.`);
      continue;
    }
    const assertions = result.assertionResults ?? [];
    if (
      result.status === 'passed' ||
      assertions.some((item) => item.status === 'passed')
    ) {
      failures.push(
        `${lesson.name}: le starter passe deja son contrat comportemental.`,
      );
    }
  }
}

function validateSolutionSuccesses(report: VitestReport): void {
  for (const lesson of lessons) {
    const result = reportFor(report, lesson);
    if (!result) {
      failures.push(`${lesson.name}: test de la solution absent du rapport.`);
      continue;
    }
    const assertions = result.assertionResults ?? [];
    if (
      result.status !== 'passed' ||
      assertions.some((item) => item.status !== 'passed')
    ) {
      failures.push(
        `${lesson.name}: la solution ne respecte pas son contrat comportemental.`,
      );
    }
  }
}

function reportFor(report: VitestReport, lesson: Lesson) {
  const marker = `/src/exercises/${lesson.id}/`.toLowerCase();
  return report.testResults?.find((result) =>
    result.name?.replaceAll('\\', '/').toLowerCase().includes(marker),
  );
}

function parseLesson(contentFile: string): Lesson {
  const content = readFileSync(contentFile, 'utf8');
  return {
    directory: dirname(contentFile),
    id: content.match(/^\s+id:\s*(.+)$/m)?.[1]?.trim() ?? '',
    name: relative(tutorialRoot, dirname(contentFile)),
    template: content.match(/^template:\s*(.+)$/m)?.[1]?.trim() ?? '',
  };
}

function copyResolvedTemplate(
  template: string,
  destination: string,
  visited = new Set<string>(),
): void {
  const directory = resolve(templatesRoot, template);
  if (!directory.startsWith(resolve(templatesRoot)) || !existsSync(directory)) {
    throw new Error(`Template introuvable ou interdit : ${template}`);
  }
  if (visited.has(directory))
    throw new Error(`Heritage cyclique : ${template}`);
  visited.add(directory);

  const configFile = join(directory, '.tk-config.json');
  if (existsSync(configFile)) {
    const config = JSON.parse(readFileSync(configFile, 'utf8')) as {
      extends?: string;
    };
    if (config.extends) {
      const parent = relative(
        templatesRoot,
        resolve(directory, config.extends),
      );
      copyResolvedTemplate(parent, destination, visited);
    }
  }
  cpSync(directory, destination, {
    recursive: true,
    force: true,
    filter: (source) => {
      const name = basename(source);
      return name !== 'node_modules' && name !== '.tk-config.json';
    },
  });
}

function run(
  command: string,
  args: string[],
  cwd: string,
  failOnError: boolean,
): number {
  const windowsCommand = [command, ...args].join(' ');
  const executable =
    process.platform === 'win32' ? (process.env.ComSpec ?? 'cmd.exe') : command;
  const executableArgs =
    process.platform === 'win32' ? ['/d', '/s', '/c', windowsCommand] : args;
  const result = spawnSync(executable, executableArgs, {
    cwd,
    encoding: 'utf8',
    shell: false,
  });
  if (result.error) throw result.error;

  const exitCode = result.status ?? 1;
  if (failOnError && exitCode !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} a echoue.\n${result.stdout}\n${result.stderr}`,
    );
  }
  if (exitCode !== 0 && process.env.VERBOSE_EXERCISES === '1') {
    console.error(`${result.stdout}\n${result.stderr}`);
  }
  return exitCode;
}

function findContentFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findContentFiles(path);
    return /content\.mdx?$/.test(entry.name) ? [path] : [];
  });
}
