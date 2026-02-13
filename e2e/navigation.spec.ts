import { test, expect } from '@playwright/test'

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('General is active by default', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Delivery Method Detail')
    // General settings content should show Description field
    await expect(page.getByText('Description')).toBeVisible()
    await expect(page.getByText('Lead Type')).toBeVisible()
  })

  test('navigating to PING URL Endpoint updates header and content', async ({ page }) => {
    // Click URL Endpoint under PING
    const pingTabs = page.getByRole('button', { name: 'URL Endpoint' })
    await pingTabs.first().click()

    await expect(page.locator('h1')).toHaveText('URL Endpoint (PING)')
    await expect(page.getByText('Production URL')).toBeVisible()
    await expect(page.getByText('Testing / Sandbox URL')).toBeVisible()
  })

  test('navigating to PING Mappings shows data grid', async ({ page }) => {
    await page.getByRole('button', { name: 'Mappings' }).first().click()

    await expect(page.locator('h1')).toHaveText('Mappings (PING)')
    // Should show the mapping toolbar
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Bulk Add' })).toBeVisible()
    // Should show default data
    await expect(page.getByText('category', { exact: true })).toBeVisible()
    await expect(page.getByText('product_category')).toBeVisible()
  })

  test('navigating to POST URL Endpoint shows Same as PING options', async ({ page }) => {
    // Both PING and POST groups are expanded by default, so there are 2 URL Endpoint buttons
    const postUrlEndpoint = page.getByRole('button', { name: 'URL Endpoint' }).nth(1)
    await postUrlEndpoint.click()

    await expect(page.locator('h1')).toHaveText('URL Endpoint (POST)')
    await expect(page.getByText('Method')).toBeVisible()
    // "Same as PING" appears as checkbox labels
    await expect(page.getByText('Same as PING').first()).toBeVisible()
  })

  test('navigating to Portal Permissions shows Yes/No selects', async ({ page }) => {
    await page.getByRole('button', { name: 'Portal Permissions' }).click()

    await expect(page.locator('h1')).toHaveText('Portal Permissions')
    await expect(page.getByText('Show IVR Call Information')).toBeVisible()
    await expect(page.getByText('Show File Attachments')).toBeVisible()
    await expect(page.getByText('Show Website Analytics Data')).toBeVisible()
  })

  test('navigating to Delivery Schedule shows 7 day rows', async ({ page }) => {
    await page.getByRole('button', { name: 'Delivery Schedule' }).click()

    await expect(page.locator('h1')).toHaveText('Delivery Schedule')
    await expect(page.getByText('Monday')).toBeVisible()
    await expect(page.getByText('Tuesday')).toBeVisible()
    await expect(page.getByText('Wednesday')).toBeVisible()
    await expect(page.getByText('Thursday')).toBeVisible()
    await expect(page.getByText('Friday')).toBeVisible()
    await expect(page.getByText('Saturday')).toBeVisible()
    await expect(page.getByText('Sunday')).toBeVisible()
  })

  test('navigating to Notifications shows toggle and grid', async ({ page }) => {
    await page.getByRole('button', { name: 'Notifications' }).click()

    await expect(page.locator('h1')).toHaveText('Notifications')
    await expect(page.getByText('Send Notification')).toBeVisible()
  })

  test('collapsing PING Configuration hides sub-tabs', async ({ page }) => {
    // Both groups are expanded by default - should have 2 "URL Endpoint" buttons
    await expect(page.getByRole('button', { name: 'URL Endpoint' })).toHaveCount(2)

    // Collapse PING
    await page.getByRole('button', { name: 'PING Configuration' }).click()

    // After collapsing PING, only POST's URL Endpoint should remain (1 button)
    await expect(page.getByRole('button', { name: 'URL Endpoint' })).toHaveCount(1)
  })
})
