import { test, expect } from '@playwright/test'
import { bypassCreationModal } from './helpers/bypass-creation-modal'

test.describe('Bulk Add Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await bypassCreationModal(page)
    // Navigate to PING Mappings
    await page.getByRole('button', { name: 'Mappings' }).first().click()
    // Open Bulk Add dialog
    await page.getByRole('button', { name: 'Bulk Add' }).click()
  })

  test('opens with correct title and structure', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Select Fields to Add')).toBeVisible()

    // Table headers
    await expect(dialog.getByRole('columnheader', { name: 'Include' })).toBeVisible()
    await expect(dialog.getByRole('columnheader', { name: 'System Lead Field' })).toBeVisible()
    await expect(dialog.getByRole('columnheader', { name: 'Delivery Field Name' })).toBeVisible()
  })

  test('lists all system lead fields', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('tcpa_consent', { exact: false }).first()).toBeVisible()
    await expect(dialog.getByText('product_category', { exact: true })).toBeVisible()
    await expect(dialog.getByText('email_address', { exact: true })).toBeVisible()
    await expect(dialog.getByText('phone_number', { exact: true })).toBeVisible()
    await expect(dialog.getByText('first_name', { exact: true })).toBeVisible()
    await expect(dialog.getByText('last_name', { exact: true })).toBeVisible()
  })

  test('shows enum count for fields that have enums', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('(5 enum)')).toBeVisible() // credit_score_range
    await expect(dialog.getByText('(6 enum)')).toBeVisible() // property_type
  })

  test('delivery field name defaults to system field name', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    const rows = dialog.locator('tbody tr')

    // Test first few rows to verify delivery name defaults to system name
    // Row 0: tcpa_consent (system) -> tcpa_consent (delivery, same)
    await expect(rows.nth(0).locator('input')).toHaveValue('tcpa_consent')
    // Row 1: consent_flag (system) -> consent_flag (delivery, same)
    await expect(rows.nth(1).locator('input')).toHaveValue('consent_flag')
    // Row 2: consent_timestamp (system) -> consent_timestamp (delivery, same)
    await expect(rows.nth(2).locator('input')).toHaveValue('consent_timestamp')
    // Row 3: ip_address (system) -> ip_address (delivery, same)
    await expect(rows.nth(3).locator('input')).toHaveValue('ip_address')
    // Row 4: product_category (system) -> product_category (delivery, same)
    await expect(rows.nth(4).locator('input')).toHaveValue('product_category')
  })

  test('all toggles start unchecked', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    const switches = dialog.getByRole('switch')

    // All switches should be unchecked initially
    const count = await switches.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(switches.nth(i)).not.toBeChecked()
    }
  })

  test('Add Field Mappings button is disabled when nothing selected', async ({ page }) => {
    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'Add Field Mappings' }),
    ).toBeDisabled()
  })

  test('toggling a field enables the delivery name input and Add button', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    const firstRow = dialog.locator('tbody tr').nth(0)

    // Input should be disabled initially
    await expect(firstRow.locator('input')).toBeDisabled()

    // Toggle include on
    await firstRow.getByRole('switch').click()
    await expect(firstRow.getByRole('switch')).toBeChecked()

    // Input should now be enabled
    await expect(firstRow.locator('input')).toBeEnabled()

    // Add button should be enabled
    await expect(
      dialog.getByRole('button', { name: 'Add Field Mappings' }),
    ).toBeEnabled()
  })

  test('can edit delivery field name when included', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    const firstRow = dialog.locator('tbody tr').nth(0)

    // Toggle include on
    await firstRow.getByRole('switch').click()

    // Edit the delivery name
    const input = firstRow.locator('input')
    await input.clear()
    await input.fill('custom_field_name')
    await expect(input).toHaveValue('custom_field_name')
  })

  test('Replace mode replaces all existing mappings', async ({ page }) => {
    const dialog = page.getByRole('dialog')

    // Toggle two fields
    const rows = dialog.locator('tbody tr')
    await rows.nth(5).getByRole('switch').click() // first_name
    await rows.nth(6).getByRole('switch').click() // last_name

    // Mode should default to Replace
    await expect(dialog.locator('button[role="combobox"]')).toContainText('Replace')

    // Submit
    await dialog.getByRole('button', { name: 'Add Field Mappings' }).click()

    // Dialog should close
    await expect(dialog).not.toBeVisible()

    // Grid should show only the 2 new mappings (replaced)
    await expect(page.getByRole('cell', { name: 'first_name' }).first()).toBeVisible()
    await expect(page.getByRole('cell', { name: 'last_name' }).first()).toBeVisible()

    // Old mappings should be gone
    await expect(page.getByRole('cell', { name: 'product_category' })).not.toBeVisible()
  })

  test('Append mode adds to existing mappings', async ({ page }) => {
    const dialog = page.getByRole('dialog')

    // Switch to Append mode
    await dialog.locator('button[role="combobox"]').click()
    await page.getByRole('option', { name: 'Append' }).click()

    // Toggle one field
    const rows = dialog.locator('tbody tr')
    await rows.nth(5).getByRole('switch').click() // first_name

    // Submit
    await dialog.getByRole('button', { name: 'Add Field Mappings' }).click()
    await expect(dialog).not.toBeVisible()

    // Old mappings should still be present
    await expect(page.getByRole('cell', { name: 'product_category' })).toBeVisible()
    // New mapping should also be present
    await expect(page.getByRole('cell', { name: 'first_name' }).first()).toBeVisible()
  })

  test('Close button closes dialog without changes', async ({ page }) => {
    const dialog = page.getByRole('dialog')

    // Toggle a field
    await dialog.locator('tbody tr').nth(0).getByRole('switch').click()

    // Click Close
    await dialog.getByRole('button', { name: 'Close' }).first().click()
    await expect(dialog).not.toBeVisible()

    // Mappings should be unchanged (5 original)
    await expect(page.getByRole('cell', { name: 'product_category' })).toBeVisible()
  })

  test('X button closes dialog', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    // The X button has aria-label="Close" in the header
    await dialog.locator('.bg-panel-header button[aria-label="Close"]').click()
    await expect(dialog).not.toBeVisible()
  })

  test('footer has Replace/Append dropdown, Close and Add buttons', async ({ page }) => {
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('button[role="combobox"]')).toContainText('Replace')
    await expect(dialog.getByRole('button', { name: 'Close' }).last()).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Add Field Mappings' })).toBeVisible()
  })
})
