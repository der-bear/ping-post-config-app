import { test, expect } from '@playwright/test'
import { bypassCreationModal } from './helpers/bypass-creation-modal'

test.describe('Inheritance Logic - Authentication and Retry Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Use helper to properly create delivery method with lead type selection
    await bypassCreationModal(page)
  })

  test.describe('Authentication Inheritance', () => {
    test('should show "Same as PING" option with separator in POST authentication', async ({ page }) => {
      // Navigate to POST Authentication
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()

      // Open Authentication Type dropdown
      await page.getByLabel('Authentication Type').click()

      // Verify "Same as PING" option appears first
      const firstOption = page.locator('[role="option"]').first()
      await expect(firstOption).toContainText('No Authentication')
      await expect(firstOption).toContainText('Same as PING')

      // Verify separator exists after "Same as PING"
      await expect(page.locator('[role="separator"]').first()).toBeVisible()

      // Verify other options appear after separator
      await expect(page.getByRole('option', { name: 'Basic' })).toBeVisible()
    })

    test('should inherit PING authentication settings in POST', async ({ page }) => {
      // Set PING authentication to Basic
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await page.getByLabel('Authentication Type').click()
      await page.getByRole('option', { name: 'Basic' }).click()

      // Fill in Basic auth credentials
      await page.getByLabel('Username').fill('testuser')
      await page.getByLabel('Password').fill('testpass')

      // Navigate to POST Authentication
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()

      // Verify POST shows "Same as PING" with Basic auth
      const authTypeSelect = page.getByLabel('Authentication Type')
      await expect(authTypeSelect).toContainText('Basic')
      await expect(authTypeSelect).toContainText('Same as PING')

      // Verify username and password fields show PING values and are disabled
      const usernameInput = page.getByLabel('Username')
      const passwordInput = page.getByLabel('Password')

      await expect(usernameInput).toHaveValue('testuser')
      await expect(usernameInput).toBeDisabled()
      await expect(passwordInput).toHaveValue('testpass')
      await expect(passwordInput).toBeDisabled()
    })

    test('should break inheritance when changing auth type in POST', async ({ page }) => {
      // Set PING authentication to Basic
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await page.getByLabel('Authentication Type').click()
      await page.getByRole('option', { name: 'Basic' }).click()

      // Navigate to POST and change auth type
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await page.getByLabel('Authentication Type').click()
      await page.getByRole('option', { name: 'Bearer Token' }).click()

      // Verify fields are now enabled (not inheriting)
      await expect(page.getByLabel('Prefix')).toBeEnabled()
      await expect(page.getByLabel('Token')).toBeEnabled()

      // Verify "Same as PING" is no longer selected
      await page.getByLabel('Authentication Type').click()
      const selectedOption = page.locator('[role="option"][data-state="checked"]')
      await expect(selectedOption).not.toContainText('Same as PING')
    })

    test('should break inheritance when focusing on auth field in POST', async ({ page }) => {
      // Set PING authentication to Basic
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await page.getByLabel('Authentication Type').click()
      await page.getByRole('option', { name: 'Basic' }).click()
      await page.getByLabel('Username').fill('pinguser')

      // Navigate to POST (should inherit)
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()

      // Verify initially inheriting and disabled
      await expect(page.getByLabel('Username')).toBeDisabled()
      await expect(page.getByLabel('Username')).toHaveValue('pinguser')

      // Focus on username field to break inheritance
      await page.getByLabel('Username').click()

      // Verify field is now enabled with PING's value copied
      await expect(page.getByLabel('Username')).toBeEnabled()
      await expect(page.getByLabel('Username')).toHaveValue('pinguser')
    })
  })

  test.describe('Retry Inheritance', () => {
    test('should show "Same as PING" option with separator in POST retry settings', async ({ page }) => {
      // Navigate to POST Retry Settings
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()

      // Open Retry After Failure dropdown
      await page.getByLabel('Retry After Failure').click()

      // Verify "Same as PING" option appears first
      const firstOption = page.locator('[role="option"]').first()
      await expect(firstOption).toContainText('No')
      await expect(firstOption).toContainText('Same as PING')

      // Verify separator exists after "Same as PING"
      await expect(page.locator('[role="separator"]').first()).toBeVisible()

      // Verify other options appear after separator
      await expect(page.getByRole('option', { name: 'Yes', exact: true })).toBeVisible()
      await expect(page.getByRole('option', { name: 'No', exact: true })).toBeVisible()
    })

    test('should inherit PING retry settings in POST', async ({ page }) => {
      // Set PING retry settings
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'Yes', exact: true }).click()

      // Set retry count and time
      await page.getByLabel('Max Retry Count').click()
      await page.getByRole('option', { name: '3' }).click()
      await page.getByLabel('Time Between Retries').click()
      await page.getByRole('option', { name: '10 seconds' }).click()

      // Navigate to POST Retry Settings
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()

      // Verify POST shows "Same as PING" with Yes
      const retrySelect = page.getByLabel('Retry After Failure')
      await expect(retrySelect).toContainText('Yes')
      await expect(retrySelect).toContainText('Same as PING')

      // Verify Max Retry Count shows PING's value (3) and is disabled
      const countSelect = page.getByLabel('Max Retry Count')
      await expect(countSelect).toContainText('3')
      await expect(countSelect).toBeDisabled()

      // Verify Time Between Retries shows PING's value (10 seconds) and is disabled
      const timeSelect = page.getByLabel('Time Between Retries')
      await expect(timeSelect).toContainText('10 seconds')
      await expect(timeSelect).toBeDisabled()
    })

    test('should show PING values (not blank) when inheriting retry settings', async ({ page }) => {
      // Set PING retry settings with specific values
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'Yes', exact: true }).click()
      await page.getByLabel('Max Retry Count').click()
      await page.getByRole('option', { name: '5' }).click()
      await page.getByLabel('Time Between Retries').click()
      await page.getByRole('option', { name: '30 seconds' }).click()

      // Navigate to POST
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()

      // Verify fields show PING's actual values (not blank)
      await expect(page.getByLabel('Max Retry Count')).toContainText('5')
      await expect(page.getByLabel('Time Between Retries')).toContainText('30 seconds')

      // Verify they don't show "Same as PING" text
      await expect(page.getByLabel('Max Retry Count')).not.toContainText('Same as PING')
      await expect(page.getByLabel('Time Between Retries')).not.toContainText('Same as PING')
    })

    test('should break inheritance when changing retry after failure in POST', async ({ page }) => {
      // Set PING retry to Yes
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'Yes', exact: true }).click()

      // Navigate to POST and change to No
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'No', exact: true }).click()

      // Verify retry fields are hidden (because retry is disabled)
      await expect(page.getByLabel('Max Retry Count')).not.toBeVisible()

      // Verify "Same as PING" is no longer selected
      await page.getByLabel('Retry After Failure').click()
      const selectedOption = page.locator('[role="option"][data-state="checked"]')
      await expect(selectedOption).toContainText('No')
      await expect(selectedOption).not.toContainText('Same as PING')
    })

    test('should break inheritance when opening retry count dropdown in POST', async ({ page }) => {
      // Set PING retry settings
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'Yes', exact: true }).click()
      await page.getByLabel('Max Retry Count').click()
      await page.getByRole('option', { name: '3' }).click()

      // Navigate to POST (should inherit)
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()

      // Verify initially disabled
      await expect(page.getByLabel('Max Retry Count')).toBeDisabled()
      await expect(page.getByLabel('Max Retry Count')).toContainText('3')

      // Open the dropdown to break inheritance
      await page.getByLabel('Max Retry Count').click()

      // Verify field is now enabled (not disabled)
      await expect(page.getByLabel('Max Retry Count')).toBeEnabled()

      // Verify we can select a different value
      await page.getByRole('option', { name: '5' }).click()
      await expect(page.getByLabel('Max Retry Count')).toContainText('5')
    })

    test('should handle switching back to "Same as PING" after breaking inheritance', async ({ page }) => {
      // Set PING retry to Yes with count 3
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'Yes', exact: true }).click()
      await page.getByLabel('Max Retry Count').click()
      await page.getByRole('option', { name: '3' }).click()

      // Navigate to POST, break inheritance by selecting different value
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'No', exact: true }).click()

      // Switch back to "Same as PING"
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: /Same as PING/ }).click()

      // Verify inheritance is restored
      await expect(page.getByLabel('Retry After Failure')).toContainText('Yes')
      await expect(page.getByLabel('Retry After Failure')).toContainText('Same as PING')
      await expect(page.getByLabel('Max Retry Count')).toBeDisabled()
      await expect(page.getByLabel('Max Retry Count')).toContainText('3')
    })
  })

  test.describe('Cross-setting Inheritance', () => {
    test('should maintain independent inheritance states for auth and retry', async ({ page }) => {
      // Set PING auth to Basic
      await page.getByRole('button', { name: 'PING', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await page.getByLabel('Authentication Type').click()
      await page.getByRole('option', { name: 'Basic' }).click()

      // Set PING retry to Yes
      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await page.getByLabel('Retry After Failure').click()
      await page.getByRole('option', { name: 'Yes', exact: true }).click()

      // Go to POST - verify both inherit
      await page.getByRole('button', { name: 'POST', exact: true }).click()
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await expect(page.getByLabel('Authentication Type')).toContainText('Same as PING')

      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await expect(page.getByLabel('Retry After Failure')).toContainText('Same as PING')

      // Break auth inheritance
      await page.getByRole('button', { name: 'Authentication', exact: true }).first().click()
      await page.getByLabel('Authentication Type').click()
      await page.getByRole('option', { name: 'Bearer Token' }).click()

      // Verify auth is no longer inheriting but retry still is
      await expect(page.getByLabel('Authentication Type')).not.toContainText('Same as PING')

      await page.getByRole('button', { name: 'Retry Settings', exact: true }).first().click()
      await expect(page.getByLabel('Retry After Failure')).toContainText('Same as PING')
    })
  })
})
