import { expect, test } from '@playwright/test'

test('creates an HTTP Webhook and opens its standalone configuration', async ({ page }) => {
  await page.goto('/ping-post-config-app/')

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Create Delivery Method' })).toBeVisible()
  await expect(dialog.getByRole('button', { name: /Lead Portal/ })).toHaveAttribute(
    'data-selected',
    'true',
  )
  for (const method of ['Lead Portal', 'Email', 'HTTP Webhook', 'CSV Attachment', 'FTP']) {
    await expect(
      dialog.getByRole('button', { name: new RegExp(`^${method}\\b`) }),
    ).toBeEnabled()
  }
  await dialog.getByRole('button', { name: /HTTP Webhook/ }).click()
  await dialog.getByRole('button', { name: 'Continue', exact: true }).click()

  await expect(
    dialog.getByRole('heading', { name: 'Create Delivery Method - HTTP Webhook' }),
  ).toBeVisible()
  await expect(dialog.getByLabel('Description', { exact: true })).toHaveAttribute(
    'placeholder',
    'Enter a description for this delivery method',
  )
  await expect(dialog.getByRole('combobox', { name: 'Lead Type' })).toContainText(
    'Select a Lead Type',
  )
  await dialog.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(dialog.getByText('Description is required.', { exact: true })).toBeVisible()
  await dialog
    .getByPlaceholder('Enter a description for this delivery method', { exact: true })
    .fill('Summit CRM Webhook')
  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Mortgage', exact: true }).click()
  await dialog.getByRole('button', { name: 'Create', exact: true }).click()

  await expect(page.getByRole('button', { name: 'Webhook Configuration' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'PING Configuration' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'POST Configuration' })).toHaveCount(0)

  await expect(page.getByRole('heading', { name: 'URL Endpoint', exact: true })).toBeVisible()
  await expect(page.getByText('Method', { exact: true })).toBeVisible()
  await expect(page.getByText('Same as PING', { exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Mappings', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Mappings', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New', exact: true })).toBeVisible()
  await expect(page.getByText('No field mappings configured', { exact: true })).toBeVisible()
  await expect(page.locator('[data-slot="data-grid-row"]')).toHaveCount(0)
  await expect(page.getByText(/PING Reference ID/)).toHaveCount(0)
  await expect(page.getByText('ping_request_id', { exact: true })).toHaveCount(0)
})
