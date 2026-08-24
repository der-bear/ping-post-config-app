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

test.describe('client next steps and Delivery Account tabs', () => {
  test('routes each next-step action into the outbound setup flow', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Client next steps/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: /Create a Lead Order/ })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Set Up Delivery Criteria/ })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Edit Delivery Account/ })).toBeVisible()

    await dialog.getByRole('button', { name: /Set Up Delivery Criteria/ }).click()
    await expect(page.getByText('Delivery Account', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Criteria', exact: true })).toBeVisible()
  })

  test('shows all Delivery Account tabs and their panels', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Delivery Account/ }).click()

    const panels = [
      ['General', 'General'],
      ['Quantity Limits', 'Quantity Limits'],
      ['Delivery', 'Delivery'],
      ['Revenue', 'Revenue'],
      ['Criteria', 'Criteria'],
      ['Offer', 'Offer'],
      ['Advanced', 'Advanced'],
    ] as const

    for (const [tab, heading] of panels) {
      const tabButton = page.getByRole('button', { name: tab, exact: true })
      await expect(tabButton).toBeVisible()
      await tabButton.click()
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
  })
})

test.describe('Delivery Account Criteria', () => {
  test('adds, edits, and removes a criterion', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()

    await expect(page.getByText('No Criteria', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'New', exact: true }).click()

    let dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('combobox', { name: 'Type' })).toContainText('Field Value')
    await expect(dialog.getByRole('combobox', { name: 'Field' })).toContainText('State')
    await expect(dialog.getByRole('combobox', { name: 'Operator' })).toContainText('Is Any Of')
    await expect(dialog.getByLabel('Value')).toHaveValue('AZ')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.getByText('AZ', { exact: true })).toBeVisible()
    await page.getByText('AZ', { exact: true }).click()
    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    dialog = page.getByRole('dialog')
    await dialog.getByLabel('Value').fill('CA')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('CA', { exact: true })).toBeVisible()

    await page.getByText('CA', { exact: true }).click()
    await page.getByRole('button', { name: 'Remove', exact: true }).click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Remove', exact: true }).click()
    await expect(page.getByText('No Criteria', { exact: true })).toBeVisible()
  })

  test('persists criteria after reload', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Save', exact: true }).click()

    await page.reload()
    await page.getByRole('button', { name: /Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()
    await expect(page.getByText('AZ', { exact: true })).toBeVisible()
  })
})
