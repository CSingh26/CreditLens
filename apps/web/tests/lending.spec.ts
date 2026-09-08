import { test, expect } from '@playwright/test';

test('analyst changes loss assumptions and evaluates cohort thresholds', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'What does this risk cost?' })).toBeVisible();
  await page.getByRole('button', { name: 'Analyze lending' }).click();
  await expect(page.getByTestId('expected-loss')).toHaveText('400.00');
  await page.getByLabel('Annual PD (%)', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Analyze lending' }).click();
  await expect(page.getByTestId('expected-loss')).toHaveText('800.00');
  await page.getByRole('button', { name: 'Evaluate cohort' }).click();
  await expect(page.getByTestId('approved-count')).toHaveText('2');
  if (process.env.CAPTURE_SCREENSHOT) await page.screenshot({path: '../../docs/screenshots/lending-analysis.png',fullPage:true});
  await page.getByLabel('Default flag threshold (%)').fill('10');
  await page.getByRole('button', { name: 'Evaluate cohort' }).click();
  await expect(page.getByTestId('approved-count')).toHaveText('0');
  await page.getByLabel('Cohort JSON', { exact: true }).fill('{bad');
  await page.getByRole('button', { name: 'Evaluate cohort' }).click();
  await expect(page.getByRole('alert').filter({hasText: 'Invalid cohort JSON'})).toContainText('Invalid cohort JSON');
});

test('unavailable trained model is never replaced by synthetic metrics', async ({ page }) => {
  await page.goto('/fairness');
  await expect(page.getByText('Data unavailable.', { exact: false })).toBeVisible();
});
