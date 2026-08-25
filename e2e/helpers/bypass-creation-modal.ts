import type { Page } from '@playwright/test'

/**
 * Bypasses the "Create Delivery Method" modal to access the editor.
 * Call this in beforeEach hooks to set up the editor state for testing.
 */
export async function bypassCreationModal(page: Page) {
  await page.goto('/ping-post-config-app/')

  // Check if creation modal is present (step 1: select method)
  const modalVisible = await page
    .getByRole('heading', { name: 'Create Delivery Method' })
    .isVisible()
    .catch(() => false)

  if (modalVisible) {
    // The product defaults to Lead Portal; these editor tests require Ping/Post.
    await page.getByRole('button', { name: /^Ping\/Post/ }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Wait for configure step and provide the now-required description.
    const description = page.getByPlaceholder('Enter a description for this delivery method')
    await description.waitFor()
    await description.fill('Automated Ping/Post Test')

    await page.getByRole('combobox', { name: 'Lead Type' }).click()
    await page.getByRole('option', { name: 'Mortgage', exact: true }).click()

    // Click Create button
    await page.getByRole('button', { name: 'Create' }).click()

    // Wait for the Ping/Post editor itself, rather than a generic page heading.
    await page.getByRole('button', { name: 'PING Configuration' }).waitFor()

    // Expand PING and POST sections (they start collapsed)
    const pingBtn = page.getByRole('button', { name: 'PING Configuration' })
    if (await pingBtn.isVisible()) {
      await pingBtn.click()
      await page.waitForTimeout(100)
    }
    const postBtn = page.getByRole('button', { name: 'POST Configuration' })
    if (await postBtn.isVisible()) {
      await postBtn.click()
      await page.waitForTimeout(100)
    }
  }
}
