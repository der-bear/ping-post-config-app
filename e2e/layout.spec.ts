import { test, expect } from '@playwright/test'
import { bypassCreationModal } from './helpers/bypass-creation-modal'

test.describe('Panel Layout', () => {
  test.beforeEach(async ({ page }) => {
    await bypassCreationModal(page)
  })

  test('renders the main panel with sidebar and header', async ({ page }) => {
    // Blue header should be visible with title
    const header = page.locator('h1')
    await expect(header).toHaveText('Delivery Method Detail')

    // Sidebar should show all navigation items
    await expect(page.getByRole('button', { name: 'General' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'PING Configuration' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'POST Configuration' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Portal Permissions' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delivery Schedule' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Notifications' })).toBeVisible()
  })

  test('footer shows Generate Request, Export, Close, Save buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Generate Request' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close', exact: true }).filter({ hasText: 'Close' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  test('PING Configuration expands to show sub-tabs', async ({ page }) => {
    // PING should be expanded by default
    await expect(page.getByRole('button', { name: 'URL Endpoint' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Authentication' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mappings' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Request Body' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Response Settings' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry Settings' }).first()).toBeVisible()
  })

  test('theme toggle switches between light and dark', async ({ page }) => {
    const html = page.locator('html')

    // Should start in light mode
    await expect(html).not.toHaveClass(/dark/)

    // Click theme toggle
    await page.getByRole('button', { name: 'Toggle theme' }).click()

    // Should now be dark
    await expect(html).toHaveClass(/dark/)

    // Click again to go back
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await expect(html).not.toHaveClass(/dark/)
  })
})
