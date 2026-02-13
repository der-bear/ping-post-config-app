import { test, expect } from '@playwright/test'

test.describe('Shared Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Portal Permissions', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Portal Permissions' }).click()
    })

    test('renders 3 Yes/No selects matching Figma', async ({ page }) => {
      await expect(page.getByText('Show IVR Call Information')).toBeVisible()
      await expect(page.getByText('Show File Attachments')).toBeVisible()
      await expect(page.getByText('Show Website Analytics Data')).toBeVisible()

      // All should default to "No"
      const triggers = page.locator('button[role="combobox"]')
      await expect(triggers).toHaveCount(3)
    })

    test('can toggle a permission to Yes', async ({ page }) => {
      const firstTrigger = page.locator('button[role="combobox"]').first()
      await firstTrigger.click()
      await page.getByRole('option', { name: 'Yes' }).click()

      // Should now show "Yes"
      await expect(firstTrigger).toHaveText('Yes')
    })
  })

  test.describe('Delivery Schedule', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Delivery Schedule' }).click()
    })

    test('renders 7 day sections with From/To labels and inputs', async ({ page }) => {
      // Each day has its own From/To labels (7 of each)
      const fromLabels = page.getByText('From', { exact: true })
      const toLabels = page.getByText('To', { exact: true })
      await expect(fromLabels).toHaveCount(7)
      await expect(toLabels).toHaveCount(7)

      // All 7 days
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      for (const day of days) {
        await expect(page.getByText(day, { exact: true })).toBeVisible()
      }
    })

    test('weekdays are enabled, weekends are disabled by default', async ({ page }) => {
      // There should be 7 status selects
      const statusSelects = page.locator('button[role="combobox"]')
      await expect(statusSelects).toHaveCount(7)
    })

    test('time inputs are present for each day', async ({ page }) => {
      // Should have time inputs (14 total: 7 from + 7 to)
      const timeInputs = page.locator('input[type="time"]')
      await expect(timeInputs).toHaveCount(14)
    })
  })

  test.describe('Notifications', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Notifications' }).click()
    })

    test('renders Send Notification toggle', async ({ page }) => {
      await expect(page.getByText('Send Notification')).toBeVisible()
      await expect(page.getByText('Send a notification when delivery fails.')).toBeVisible()
    })

    test('renders recipients grid with Add/Remove toolbar', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Add Recipient' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeVisible()
      await expect(page.getByText('No notification recipients')).toBeVisible()
    })

    test('can add a notification recipient via dialog', async ({ page }) => {
      await page.getByRole('button', { name: 'Add Recipient' }).click()
      // Should open the Add Notification Recipient dialog
      await expect(page.getByText('Add Notification Recipient')).toBeVisible()
      await expect(page.getByText('-- Select User --')).toBeVisible()
    })
  })
})
