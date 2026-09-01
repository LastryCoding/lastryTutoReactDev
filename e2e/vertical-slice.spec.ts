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
  await startWorkshopIfNeeded(page);
  await expect(page.getByText('Atelier pret.')).toBeVisible({
    timeout: 180_000,
  });

  const editor = page.locator('.cm-content');
  await expect(editor).toContainText('Bienvenue dans l atelier');
  await expect(
    page.frameLocator('iframe[title="Resultat"]').locator('h1'),
  ).toHaveText('Bienvenue dans l atelier', { timeout: 60_000 });

  await page.getByRole('button', { name: 'Verifier', exact: true }).click();
  await expect(
    page.getByText(
      "Le composant fonctionne, mais le titre exact n'est pas encore affiche.",
    ),
  ).toBeVisible({ timeout: 120_000 });

  await replaceEditorContent(page, SOLUTION);
  await expect
    .poll(() => readSavedApp(page), { timeout: 15_000 })
    .toContain('Bienvenue dans React Quest !');

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
  await page.getByRole('button', { name: 'Formater', exact: true }).click();
  await expect(page.getByText(/a ete formate avec Prettier/)).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole('button', { name: 'Executer', exact: true }).click();
  await expect(
    page.getByText('Compilation reussie. La previsualisation est a jour.'),
  ).toBeVisible({ timeout: 60_000 });
  await expect(
    page.frameLocator('iframe[title="Resultat"]').locator('h1'),
  ).toHaveText('Bienvenue dans React Quest !');

  await page.getByRole('button', { name: 'Verifier', exact: true }).click();
  await expect(
    page.getByText('Mission reussie : 50 XP attribues.'),
  ).toBeVisible({
    timeout: 120_000,
  });
  await expect(page.getByText('Mission validee')).toBeVisible();
  await expect(page.getByText('50 XP', { exact: true })).toBeVisible();

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('reactquest:state:v1') ?? '{}'),
  );
  expect(stored.xp).toBe(50);
  expect(stored.completedExercises).toEqual(['camp-01']);
  expect(stored.exerciseProgress['camp-01'].attempts).toBe(2);
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
