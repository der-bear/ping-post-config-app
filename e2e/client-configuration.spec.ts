import { expect, test } from '@playwright/test'

const route = '/ping-post-config-app/client-configuration'

test.describe('client configuration launcher', () => {
  test('shows outbound creation, editor, and next-step cards', async ({ page }) => {
    await page.goto(route)

    await expect(page.getByText('Creation flows', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Create client and delivery account/ }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /Create order/ })).toBeVisible()
    await expect(page.getByText('Edit outbound settings', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Delivery Account/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Order/ })).toBeVisible()
    await expect(page.getByText('Preview next-step dialogs', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Client next steps/ })).toBeVisible()
  })
})
