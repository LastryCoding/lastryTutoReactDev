import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const tutorialRoot = join(process.cwd(), 'src', 'content', 'tutorial');
const contentFiles = findAllFiles(tutorialRoot).filter((file) =>
  /content\.mdx?$/.test(file),
);
const errors: string[] = [];

if (contentFiles.length === 0) {
  errors.push('Le parcours ne contient aucune lecon.');
}

for (const contentFile of contentFiles) {
  const lessonDirectory = join(contentFile, '..');
  const content = readFileSync(contentFile, 'utf8');
  const starter = join(lessonDirectory, '_files');
  const solution = join(lessonDirectory, '_solution');

  if (!content.includes('type: lesson')) {
    errors.push(
      `${relative(tutorialRoot, contentFile)}: type lesson manquant.`,
    );
  }

  if (!existsSync(starter) || findAllFiles(starter).length === 0) {
    errors.push(`${relative(tutorialRoot, contentFile)}: starter manquant.`);
  }

  if (!existsSync(solution) || findAllFiles(solution).length === 0) {
    errors.push(`${relative(tutorialRoot, contentFile)}: solution manquante.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`${contentFiles.length} lecon(s) structurellement valide(s).`);

function findAllFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? findAllFiles(path) : [path];
  });
}
