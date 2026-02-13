import { test, expect } from '@playwright/test'

test.describe('PING Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('URL Endpoint', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'URL Endpoint' }).first().click()
    })

    test('renders Production URL and Testing URL inputs', async ({ page }) => {
      await expect(page.getByText('Production URL')).toBeVisible()
      await expect(page.locator('input[placeholder="https://api.example.com/leads"]')).toBeVisible()

      await expect(page.getByText('Testing / Sandbox URL')).toBeVisible()
      await expect(page.locator('input[placeholder="https://sandbox.example.com/leads"]')).toBeVisible()
    })

    test('renders Request Settings section with Content Type and Timeout', async ({ page }) => {
      await expect(page.getByText('Request Settings')).toBeVisible()
      await expect(page.getByText('Content Type')).toBeVisible()
      await expect(page.getByText('Timeout')).toBeVisible()
    })

    test('renders Custom Headers section with New/Remove buttons', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Custom Headers' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'New' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible()
    })

    test('can add a custom header via dialog', async ({ page }) => {
      await page.getByRole('button', { name: 'New' }).click()
      // Should open the Add Header dialog
      await expect(page.getByText('Add Custom Header')).toBeVisible()
      await expect(page.getByPlaceholder('e.g. X-Custom-Header')).toBeVisible()
      await expect(page.getByPlaceholder('Header value')).toBeVisible()
    })
  })

  test.describe('Authentication', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Authentication' }).first().click()
    })

    test('renders Authentication Type select with Test Authentication button', async ({ page }) => {
      await expect(page.getByText('Authentication Type')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Test Authentication' })).toBeVisible()
    })

    test('selecting Basic shows request format, username/password fields', async ({ page }) => {
      const trigger = page.locator('button[role="combobox"]').first()
      await trigger.click()
      await page.getByRole('option', { name: 'Basic' }).click()

      await expect(page.getByText('Authentication Request Format')).toBeVisible()
      await expect(page.getByText('Username')).toBeVisible()
      await expect(page.getByText('Password')).toBeVisible()
    })
  })

  test.describe('Mappings', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Mappings' }).first().click()
    })

    test('renders data grid with 5 default PING mappings', async ({ page }) => {
      // Column headers
      await expect(page.getByText('Type', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('Name', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('Mapped To')).toBeVisible()

      // Default data from store (5 mappings)
      await expect(page.getByText('category', { exact: true })).toBeVisible()
      await expect(page.getByText('product_category')).toBeVisible()
      await expect(page.getByText('postal_code')).toBeVisible()
      await expect(page.getByText('ip_address')).toBeVisible()
      await expect(page.getByText('consent_flag', { exact: true })).toBeVisible()
      await expect(page.getByText('consent_timestamp')).toBeVisible()
    })

    test('toolbar has New, Bulk Add, Edit, Remove buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'New' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Bulk Add' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible()
    })

    test('Edit and Remove are disabled when no row selected', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Edit' })).toBeDisabled()
      await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeDisabled()
    })

    test('clicking a row enables Edit and Remove', async ({ page }) => {
      // Click on a row (the "category" text)
      await page.getByText('category', { exact: true }).click()

      await expect(page.getByRole('button', { name: 'Edit' })).toBeEnabled()
      await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeEnabled()
    })

    test('footer shows auto-save note', async ({ page }) => {
      await expect(page.getByText('Note: Mapping changes save automatically')).toBeVisible()
    })
  })

  test.describe('Response Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Response Settings' }).first().click()
    })

    test('renders format radio buttons (JSON, XML, Custom)', async ({ page }) => {
      await expect(page.getByText('Response Format')).toBeVisible()
      await expect(page.getByLabel('JSON')).toBeVisible()
      await expect(page.getByLabel('XML')).toBeVisible()
      await expect(page.getByLabel('Custom')).toBeVisible()
    })

    test('JSON mode shows Key/Value fields for success response', async ({ page }) => {
      await expect(page.getByText('Success Response')).toBeVisible()
      // Key and Value inputs
      const keyInputs = page.locator('input[placeholder="e.g. status"]')
      await expect(keyInputs).toBeVisible()
    })

    test('Enable Ping during Sort toggle is visible (PING only)', async ({ page }) => {
      await expect(page.getByText('Enable Ping during Sort')).toBeVisible()
    })
  })

  test.describe('Retry Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Retry Settings' }).first().click()
    })

    test('renders retry fields', async ({ page }) => {
      await expect(page.getByText('Retry After Failure')).toBeVisible()
      await expect(page.getByText('Max Retry Count')).toBeVisible()
      await expect(page.getByText('Time Between Retries')).toBeVisible()
    })
  })
})
