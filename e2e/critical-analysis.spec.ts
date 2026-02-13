import { test } from '@playwright/test'
import { bypassCreationModal } from './helpers/bypass-creation-modal'

test.describe('Critical Screen Analysis', () => {
  test('capture all screens for analysis', async ({ page }) => {
    // 1. Creation Modal Flow
    await page.goto('/')
    await page.screenshot({ path: 'analysis/01-creation-modal-step1.png', fullPage: true })

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByPlaceholder('e.g., Acme Corp Mortgage Ping/Post').waitFor()
    await page.screenshot({ path: 'analysis/02-creation-modal-step2.png', fullPage: true })

    await page.getByRole('combobox').click()
    await page.screenshot({ path: 'analysis/03-creation-modal-leadtype-dropdown.png', fullPage: true })

    await page.getByRole('option', { name: 'Mortgage' }).click()
    await page.getByRole('button', { name: 'Create' }).click()
    await page.locator('h1').waitFor({ state: 'visible' })

    // 2. General Settings (Default View)
    await page.screenshot({ path: 'analysis/04-general-settings.png', fullPage: true })

    // 3. PING - URL Endpoint
    await page.getByRole('button', { name: 'URL Endpoint' }).first().click()
    await page.screenshot({ path: 'analysis/05-ping-url-endpoint.png', fullPage: true })

    // 4. PING - Authentication
    await page.getByRole('button', { name: 'Authentication' }).first().click()
    await page.screenshot({ path: 'analysis/06-ping-authentication.png', fullPage: true })

    // Authentication with Basic selected
    const authSelect = page.locator('button[role="combobox"]').first()
    await authSelect.click()
    await page.getByRole('option', { name: 'Basic' }).click()
    await page.screenshot({ path: 'analysis/07-ping-authentication-basic.png', fullPage: true })

    // 5. PING - Mappings
    await page.getByRole('button', { name: 'Mappings' }).first().click()
    await page.screenshot({ path: 'analysis/08-ping-mappings.png', fullPage: true })

    // 5a. Add Mapping Dialog
    await page.getByRole('button', { name: 'New' }).first().click()
    await page.getByRole('menuitem', { name: 'Lead Field' }).click()
    await page.screenshot({ path: 'analysis/09-add-mapping-dialog.png', fullPage: true })
    await page.getByRole('button', { name: 'Cancel' }).click()

    // 5b. Bulk Add Dialog
    await page.getByRole('button', { name: 'Bulk Add' }).click()
    await page.screenshot({ path: 'analysis/10-bulk-add-dialog.png', fullPage: true })
    await page.getByRole('button', { name: 'Close' }).last().click()

    // 6. PING - Request Body
    await page.getByRole('button', { name: 'Request Body' }).first().click()
    await page.screenshot({ path: 'analysis/11-ping-request-body.png', fullPage: true })

    // 7. PING - Response Settings
    await page.getByRole('button', { name: 'Response Settings' }).first().click()
    await page.screenshot({ path: 'analysis/12-ping-response-settings.png', fullPage: true })

    // 8. PING - Retry Settings
    await page.getByRole('button', { name: 'Retry Settings' }).first().click()
    await page.screenshot({ path: 'analysis/13-ping-retry-settings.png', fullPage: true })

    // 9. POST - URL Endpoint
    await page.getByRole('button', { name: 'URL Endpoint' }).nth(1).click()
    await page.screenshot({ path: 'analysis/14-post-url-endpoint.png', fullPage: true })

    // 10. POST - Authentication
    await page.getByRole('button', { name: 'Authentication' }).nth(1).click()
    await page.screenshot({ path: 'analysis/15-post-authentication.png', fullPage: true })

    // 11. POST - Mappings
    await page.getByRole('button', { name: 'Mappings' }).nth(1).click()
    await page.screenshot({ path: 'analysis/16-post-mappings.png', fullPage: true })

    // 12. POST - Request Body
    await page.getByRole('button', { name: 'Request Body' }).nth(1).click()
    await page.screenshot({ path: 'analysis/17-post-request-body.png', fullPage: true })

    // 13. POST - Retry Settings
    await page.getByRole('button', { name: 'Retry Settings' }).nth(1).click()
    await page.screenshot({ path: 'analysis/18-post-retry-settings.png', fullPage: true })

    // 14. Portal Permissions
    await page.getByRole('button', { name: 'Portal Permissions' }).click()
    await page.screenshot({ path: 'analysis/19-portal-permissions.png', fullPage: true })

    // 15. Delivery Schedule
    await page.getByRole('button', { name: 'Delivery Schedule' }).click()
    await page.screenshot({ path: 'analysis/20-delivery-schedule.png', fullPage: true })

    // 16. Notifications
    await page.getByRole('button', { name: 'Notifications' }).click()
    await page.screenshot({ path: 'analysis/21-notifications.png', fullPage: true })

    // 17. Dark Mode
    await page.getByRole('button', { name: 'Toggle theme' }).click()
    await page.screenshot({ path: 'analysis/22-dark-mode.png', fullPage: true })
  })
})
