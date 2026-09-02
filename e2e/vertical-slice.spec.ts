import { expect, test } from '@playwright/test';

const LESSON_PATH = '/0-camp-base/1-premiers-pas/modifier-un-texte/';
const SOLUTION = `export default function App() {
  return (
    <main className="quest-card">
      <h1>Bienvenue dans React Quest !</h1>
      <p>Votre environnement React est pret.</p>
    </main>
  );
}
`;

test('le premier exercice restaure le code et attribue les XP', async ({
  page,
}) => {
  await page.goto(LESSON_PATH);

  await expect.poll(() => page.evaluate(() => crossOriginIsolated)).toBe(true);
  const validationButton = page.getByRole('button', {
    name: /Valider la mission/,
  });
  await expect(validationButton).toBeVisible();
  await expect(page.locator('.quest-toolbar')).toHaveCSS('display', 'flex');
  await expect(validationButton).not.toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await startWorkshopIfNeeded(page);
  await expect(page.getByText('Atelier pret.')).toBeVisible({
    timeout: 180_000,
  });

  const editor = page.locator('.cm-content');
  await expect(editor).toContainText('Bienvenue dans l atelier');
  await expect(
    page.frameLocator('iframe[title="Resultat"]').locator('h1'),
  ).toHaveText('Bienvenue dans l atelier', { timeout: 60_000 });

  await validationButton.click();
  await expect(page.locator('.quest-toolbar__state small')).toHaveText(
    'Mission a corriger. Consultez les controles pour identifier la prochaine modification.',
    { timeout: 120_000 },
  );
  await page.getByRole('button', { name: 'Fermer le resultat' }).click();

  await replaceEditorContent(page, SOLUTION);
  await expect
    .poll(() => readSavedApp(page), { timeout: 15_000 })
    .toContain('Bienvenue dans React Quest !');

  page.once('dialog', (dialog) => void dialog.accept());
  await page.reload();
  await startWorkshopIfNeeded(page);
  await expect(page.getByText('Atelier pret.')).toBeVisible({
    timeout: 180_000,
  });
  await expect(page.locator('.cm-content')).toContainText(
    'Bienvenue dans React Quest !',
  );

  await replaceEditorContent(
    page,
    'export default function App(){return <main className="quest-card"><h1>Bienvenue dans React Quest !</h1><p>Votre environnement React est pret.</p></main>}',
  );
  await page.getByText('Outils', { exact: true }).click();
  await page.getByRole('button', { name: 'Formater', exact: true }).click();
  await expect(page.getByText(/a ete formate avec Prettier/)).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole('button', { name: 'Executer', exact: true }).click();
  await expect(page.locator('.quest-toolbar__state small')).toHaveText(
    'Compilation reussie. Verifiez maintenant la mission.',
    { timeout: 60_000 },
  );
  await expect(
    page.frameLocator('iframe[title="Resultat"]').locator('h1'),
  ).toHaveText('Bienvenue dans React Quest !');

  await page.getByRole('button', { name: /Valider la mission/ }).click();
  await replaceEditorContent(
    page,
    `${SOLUTION}\n// Modification pendant la validation.`,
  );
  await expect(page.locator('.quest-toolbar__state small')).toContainText(
    'Le code a ete modifie pendant la validation',
    { timeout: 120_000 },
  );
  await expect(page.locator('.quest-toolbar__xp')).toHaveText('0 XP');

  await page.getByRole('button', { name: /Valider la mission/ }).click();
  await expect(page.locator('.quest-toolbar__state strong')).toHaveText(
    'Validation en cours',
  );
  page.once('dialog', (dialog) => void dialog.accept());
  await page.goto('/');
  await expect(page.getByText('0/44 missions')).toBeVisible();
  await page.waitForTimeout(3_000);
  expect(await readQuestState(page)).toMatchObject({
    xp: 0,
    completedExercises: [],
  });

  await page.goto(LESSON_PATH);
  await startWorkshopIfNeeded(page);
  await expect(page.getByText('Atelier pret.')).toBeVisible({
    timeout: 180_000,
  });

  await page.getByRole('button', { name: /Valider la mission/ }).click();
  await expect(page.locator('.quest-toolbar__state small')).toHaveText(
    'Mission reussie : +50 XP.',
    { timeout: 120_000 },
  );
  await expect(page.locator('.quest-toolbar__state strong')).toHaveText(
    'Mission validee',
  );
  await expect(page.locator('.quest-toolbar__xp')).toHaveText('50 XP');

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('reactquest:state:v1') ?? '{}'),
  );
  expect(stored.xp).toBe(50);
  expect(stored.completedExercises).toEqual(['camp-01']);
  expect(stored.exerciseProgress['camp-01'].attempts).toBe(2);

  await page.getByRole('button', { name: 'Revalider la mission' }).click();
  let operationWarning = '';
  page.once('dialog', async (dialog) => {
    operationWarning = dialog.message();
    await dialog.accept();
  });
  await page.locator('header a[href$="afficher-expression-jsx"]').click();
  expect(operationWarning).toContain('Une action est en cours');
  await expect(page).toHaveURL(new RegExp(`${LESSON_PATH}$`));
  await expect(page.locator('.quest-toolbar__state small')).toHaveText(
    'Mission toujours validee. Les XP avaient deja ete attribues.',
    { timeout: 120_000 },
  );
  const revalidated = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('reactquest:state:v1') ?? '{}'),
  );
  expect(revalidated.xp).toBe(50);
  expect(revalidated.exerciseProgress['camp-01'].attempts).toBe(3);

  await page.goto('/');
  await expect(page.getByText('1/44 missions')).toBeVisible();
  await expect(page.getByText('50 XP', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', {
      name: 'Afficher une expression JSX',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText('Premier pas', { exact: true })).toBeVisible();
});

async function startWorkshopIfNeeded(
  page: import('@playwright/test').Page,
): Promise<void> {
  const startButton = page.getByRole('button', {
    name: 'Demarrer l atelier',
    exact: true,
  });

  if (await startButton.isVisible().catch(() => false)) {
    await startButton.click();
  }
}

async function replaceEditorContent(
  page: import('@playwright/test').Page,
  content: string,
): Promise<void> {
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(content);
}

async function readSavedApp(
  page: import('@playwright/test').Page,
): Promise<string> {
  return page.evaluate(() => {
    const state = JSON.parse(
      localStorage.getItem('reactquest:state:v1') ?? '{}',
    );
    return state.exerciseProgress?.['camp-01']?.files?.['src/App.tsx'] ?? '';
  });
}

async function readQuestState(
  page: import('@playwright/test').Page,
): Promise<Record<string, unknown>> {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem('reactquest:state:v1') ?? '{}'),
  );
}
