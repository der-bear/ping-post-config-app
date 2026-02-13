import { test, expect } from '@playwright/test'
import { bypassCreationModal } from './helpers/bypass-creation-modal'

test.describe('POST Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await bypassCreationModal(page)
  })

  test.describe('URL Endpoint', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'URL Endpoint' }).nth(1).click()
    })

    test('shows Method select (POST only)', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('URL Endpoint (POST)')
      await expect(page.getByText('Method')).toBeVisible()
    })

    test('shows Same as PING option for Content Type', async ({ page }) => {
      // Content Type uses a select dropdown with "Same as PING" as an option
      await expect(page.getByText('Content Type')).toBeVisible()
    })

    test('shows Include from PING checkbox for Custom Headers', async ({ page }) => {
      await expect(page.getByText('Include from PING')).toBeVisible()
    })
  })

  test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Authentication' }).nth(1).click()
    })

    test('shows Same as PING option in auth type select', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('Authentication (POST)')
      // Authentication type select defaults to "Same as PING" option
      await expect(page.getByText('Same as PING')).toBeVisible()
    })
  })

  test.describe('Mappings', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Mappings' }).nth(1).click()
    })

    test('shows combined PING and POST mappings', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('Mappings (POST)')
      // POST mappings always show combined PING + POST fields
      await expect(page.getByText('System Field')).toBeVisible()
      await expect(page.getByText('ping_request_id')).toBeVisible()
    })

    test('renders POST-specific mappings with System Field type', async ({ page }) => {
      // POST mappings include a System Field type row (ping_request_id)
      await expect(page.getByText('System Field')).toBeVisible()
      await expect(page.getByText('ping_request_id')).toBeVisible()
    })
  })

  test.describe('Retry Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Retry Settings' }).nth(1).click()
    })

    test('shows Same as PING option in retry selects', async ({ page }) => {
      await expect(page.locator('h1')).toHaveText('Retry Settings (POST)')
      // Retry settings uses select dropdowns with "Same as PING" as options
      await expect(page.getByText('Same as PING').first()).toBeVisible()
    })
  })
})
