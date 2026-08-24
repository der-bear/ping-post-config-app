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

test.describe('create client wizard', () => {
  test('validates contact fields and conditionally shows portal login', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Create client and delivery account/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Contact Information', { exact: true })).toBeVisible()
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(dialog.getByText('Company Name is required.', { exact: true })).toBeVisible()

    await dialog.getByLabel('Company Name').fill('Summit Home Buyers')
    await dialog.getByLabel('First Name').fill('Maya')
    await dialog.getByLabel('Last Name').fill('Chen')
    await dialog.getByLabel('Email').fill('maya.chen@example.com')
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(dialog.getByText('Delivery Method', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('combobox', { name: 'Type of Delivery' })).toContainText(
      'HTTP Webhook',
    )
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(dialog.getByText('Delivery Account', { exact: true })).toBeVisible()

    await dialog.getByRole('button', { name: 'Previous', exact: true }).click()
    await dialog.getByRole('combobox', { name: 'Type of Delivery' }).click()
    await page.getByRole('option', { name: 'Lead Portal', exact: true }).click()
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(dialog.getByText('Portal Login Information', { exact: true })).toBeVisible()
  })

  test('creates the client and opens client next steps', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Create client and delivery account/ }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Company Name').fill('Summit Home Buyers')
    await dialog.getByLabel('First Name').fill('Maya')
    await dialog.getByLabel('Last Name').fill('Chen')
    await dialog.getByLabel('Email').fill('maya.chen@example.com')
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()

    await dialog.getByLabel('Delivery Account Name').fill('Summit Web Leads')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()

    await expect(page.getByText('Your client has been created!', { exact: true })).toBeVisible()
  })
})
