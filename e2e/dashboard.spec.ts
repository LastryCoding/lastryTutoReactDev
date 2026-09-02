import { expect, test } from '@playwright/test';

test('affiche la progression et le deblocage sans demarrer WebContainers', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Traversez le royaume, une mission a la fois.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Commencer la quete/ }),
  ).toHaveAttribute('href', '/0-camp-base/1-premiers-pas/modifier-un-texte');
  await expect(page.locator('.quest-world').first()).toHaveAttribute(
    'data-status',
    'open',
  );
  await expect(page.locator('.quest-world').nth(1)).toHaveAttribute(
    'data-status',
    'locked',
  );
  await expect(page.getByText('0/44 missions')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('reste utilisable sur un petit ecran', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Commencer la quete/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Les six mondes' }),
  ).toBeVisible();
});

test('garde la validation visible dans les vues mobiles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/0-camp-base/1-premiers-pas/modifier-un-texte/');

  const validationButton = page.getByRole('button', {
    name: /Valider la mission/,
  });
  await expect(validationButton).toBeVisible();
  await page.getByRole('button', { name: 'Editor', exact: true }).click();
  await expect(validationButton).toBeVisible();
});

test('avertit avant de quitter une mission non validee', async ({ page }) => {
  await page.goto('/0-camp-base/1-premiers-pas/modifier-un-texte/');
  await expect(
    page.getByRole('button', { name: /Valider la mission/ }),
  ).toBeVisible();

  let warningMessage = '';
  page.once('dialog', async (dialog) => {
    warningMessage = dialog.message();
    await dialog.dismiss();
  });
  await page.locator('header a[href$="afficher-expression-jsx"]').click();
  expect(warningMessage).toContain("Cette mission n'est pas encore validee");

  await expect(page).toHaveURL(
    /\/0-camp-base\/1-premiers-pas\/modifier-un-texte\/$/,
  );
});
