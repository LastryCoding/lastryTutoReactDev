import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative } from 'node:path';

const root = process.cwd();
const tutorialRoot = join(root, 'src', 'content', 'tutorial');
const templateRoot = join(root, 'src', 'templates', 'react');
const lessonDirectories = findLessonDirectories(tutorialRoot);
const temporaryRoot = mkdtempSync(join(tmpdir(), 'react-quest-validation-'));
const npmCommand = 'npm';
const failures: string[] = [];

try {
  copyTemplate(temporaryRoot);
  run(
    npmCommand,
    ['ci', '--ignore-scripts', '--no-audit', '--no-fund'],
    temporaryRoot,
    true,
  );

  for (const lessonDirectory of lessonDirectories) {
    const lessonName = relative(tutorialRoot, lessonDirectory);
    const starterExitCode = validateVariant(lessonDirectory, '_files');
    const solutionExitCode = validateVariant(lessonDirectory, '_solution');

    if (starterExitCode === 0) {
      failures.push(
        `${lessonName}: le starter passe deja toutes les validations.`,
      );
    }

    if (solutionExitCode !== 0) {
      failures.push(
        `${lessonName}: la solution ne passe pas toutes les validations.`,
      );
    }
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(
  `${lessonDirectories.length} exercice(s) : starters en echec et solutions valides.`,
);

function validateVariant(
  lessonDirectory: string,
  variant: '_files' | '_solution',
): number {
  resetWorkspace(temporaryRoot);
  cpSync(join(lessonDirectory, variant), temporaryRoot, {
    recursive: true,
    force: true,
  });

  return run(npmCommand, ['run', 'validate'], temporaryRoot, false);
}

function resetWorkspace(workspace: string): void {
  for (const entry of readdirSync(workspace, { withFileTypes: true })) {
    if (entry.name !== 'node_modules') {
      rmSync(join(workspace, entry.name), { recursive: true, force: true });
    }
  }

  copyTemplate(workspace);
}

function copyTemplate(destination: string): void {
  cpSync(templateRoot, destination, {
    recursive: true,
    force: true,
    filter: (source) => basename(source) !== 'node_modules',
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

  if (result.error) {
    throw result.error;
  }

  const exitCode = result.status ?? 1;

  if (failOnError && exitCode !== 0) {
    throw new Error(`${command} ${args.join(' ')} a echoue.\n${result.stderr}`);
  }

  return exitCode;
}

function findLessonDirectories(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (!entry.isDirectory()) {
      return [];
    }

    if (
      existsSync(join(path, '_files')) &&
      existsSync(join(path, '_solution'))
    ) {
      return [path];
    }

    return findLessonDirectories(path);
  });
}
