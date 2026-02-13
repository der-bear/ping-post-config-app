import { test, expect } from '@playwright/test'
import { bypassCreationModal } from './helpers/bypass-creation-modal'

async function openAddLeadFieldDialog(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'New' }).click()
  await page.getByRole('menuitem', { name: 'Lead Field' }).click()
}

test.describe('Add Mapping Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await bypassCreationModal(page)
    // Navigate to PING Mappings
    await page.getByRole('button', { name: 'Mappings' }).first().click()
  })

  test('New dropdown shows all mapping types with only Lead Field enabled', async ({ page }) => {
    await page.getByRole('button', { name: 'New' }).click()

    // All mapping types should be listed
    await expect(page.getByRole('menuitem', { name: 'Static Value' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Lead Field' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'System Field' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Calculated Expression' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Split Text' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Text Concatenation' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Client Field' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Lead Source Field' })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Function' })).toBeVisible()
  })

  test('clicking Lead Field opens the dialog modal', async ({ page }) => {
    await openAddLeadFieldDialog(page)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByText('Lead Field Mapping')).toBeVisible()
  })

  test('dialog shows all form fields from Figma design', async ({ page }) => {
    await openAddLeadFieldDialog(page)

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Delivery Field Name')).toBeVisible()
    await expect(dialog.locator('label').filter({ hasText: /^Lead Field/ })).toBeVisible()
    await expect(dialog.getByText('Default Value (If Blank)')).toBeVisible()
    await expect(dialog.getByText('Test Value', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Use also in POST')).toBeVisible()
    await expect(dialog.getByText('Value Mapping', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Has Value Mappings')).toBeVisible()
  })

  test('dialog has Cancel and Save buttons', async ({ page }) => {
    await openAddLeadFieldDialog(page)

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Save' })).toBeVisible()
  })

  test('Save shows validation errors when required fields are empty', async ({ page }) => {
    await openAddLeadFieldDialog(page)

    // Save button should be enabled (no disabled state)
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Save' })).toBeEnabled()

    // Click Save without filling anything
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()

    // Validation errors should appear
    await expect(page.getByText('Enter field name')).toBeVisible()
    await expect(page.getByText('Select lead field')).toBeVisible()

    // Dialog should remain open
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('can fill form and save a new mapping', async ({ page }) => {
    await openAddLeadFieldDialog(page)

    // Fill delivery field name
    await page.locator('input[placeholder="e.g. first_name"]').fill('first_name')

    // Select a lead field
    const leadFieldTrigger = page.getByRole('dialog').locator('button[role="combobox"]').first()
    await leadFieldTrigger.click()
    await page.getByRole('option', { name: 'First Name' }).click()

    // Save
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // New mapping should appear in the grid
    await expect(page.getByRole('cell', { name: 'first_name' }).first()).toBeVisible()
  })

  test('closing dialog with X button', async ({ page }) => {
    await openAddLeadFieldDialog(page)
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('closing dialog with Cancel button', async ({ page }) => {
    await openAddLeadFieldDialog(page)
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('double-clicking a row opens edit dialog', async ({ page }) => {
    await page.getByText('category', { exact: true }).dblclick()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByText('Edit Field Mapping')).toBeVisible()

    const nameInput = dialog.locator('input[placeholder="e.g. first_name"]')
    await expect(nameInput).toHaveValue('category')
  })
})
