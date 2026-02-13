import type { Page } from '@playwright/test'

/**
 * Bypasses the "Create Delivery Method" modal to access the editor.
 * Call this in beforeEach hooks to set up the editor state for testing.
 */
export async function bypassCreationModal(page: Page) {
  await page.goto('/')

  // Check if creation modal is present (step 1: select method)
  const modalVisible = await page
    .getByRole('heading', { name: 'Create Delivery Method' })
    .isVisible()
    .catch(() => false)

  if (modalVisible) {
    // Ping/Post should be selected by default (others disabled), click Continue to go to step 2
    await page.getByRole('button', { name: 'Continue' }).click()

    // Wait for configure step (description field appears)
    await page.getByPlaceholder('e.g., Acme Corp Mortgage Ping/Post').waitFor()

    // Select Mortgage lead type (only one combobox on this modal, description is optional)
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Mortgage' }).click()

    // Click Create button
    await page.getByRole('button', { name: 'Create' }).click()

    // Wait for editor to load by checking for the main header
    await page.locator('h1').waitFor({ state: 'visible' })
  }
}
