import { test, expect } from '@playwright/test'

test.describe('General Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders all fields matching Figma design', async ({ page }) => {
    // Description field — empty by default, shows placeholder
    const descInput = page.locator('input[placeholder="Enter a description..."]')
    await expect(descInput).toBeVisible()
    await expect(descInput).toHaveValue('')

    // Lead Type select showing "Mortgage"
    await expect(page.getByText('Lead Type')).toBeVisible()

    // Environment select showing "Production"
    await expect(page.getByText('Environment')).toBeVisible()

    // Separator before Phone Call Settings
    await expect(page.getByText('Phone Call Settings')).toBeVisible()

    // Process for Phone Calls
    await expect(page.getByText('Process for Phone Calls')).toBeVisible()

    // When to Process with Phone Calls
    await expect(page.getByText('When to Process with Phone Calls')).toBeVisible()
  })

  test('description field is editable', async ({ page }) => {
    const descInput = page.locator('input[placeholder="Enter a description..."]')
    await descInput.clear()
    await descInput.fill('New Description')
    await expect(descInput).toHaveValue('New Description')
  })

  test('Lead Type select shows Mortgage and is disabled', async ({ page }) => {
    const leadTypeSection = page.getByText('Lead Type').locator('..')
    const trigger = leadTypeSection.locator('button[role="combobox"]')

    // Should show Mortgage and be disabled
    await expect(trigger).toContainText('Mortgage')
    await expect(trigger).toBeDisabled()
  })
})
