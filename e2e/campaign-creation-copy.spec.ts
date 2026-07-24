import { expect, test, type Page } from '@playwright/test'

async function openCampaignLauncher(page: Page) {
  await page.goto('/ping-post-config-app/campaign-configuration')
  await expect(page.getByRole('button', { name: /Create campaign only/ })).toBeVisible()
}

async function expectDialogNoHorizontalOverflow(page: Page) {
  const dimensions = await page.getByRole('dialog').evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth)
}

test.describe('Campaign creation assistive copy', () => {
  test('shows the approved chooser and new-campaign copy', async ({ page }) => {
    await openCampaignLauncher(page)
    await page.getByRole('button', { name: /Create campaign only/ }).click()

    await expect(page.getByRole('heading', { name: 'Choose Campaign Setup' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Create New/ })).toContainText(
      'Build a new campaign step by step.',
    )
    await expect(page.getByRole('button', { name: /Copy Existing Campaign/ })).toContainText(
      'Copy the settings from an existing campaign.',
    )
    await expectDialogNoHorizontalOverflow(page)

    await page.getByRole('button', { name: /Create New/ }).click()

    await expect(page.getByRole('heading', { name: 'Create New Campaign' })).toBeVisible()
    await expect(page.getByPlaceholder('Example: Mortgage Web Form')).toBeVisible()
    await expect(page.getByText('Select the Lead Source this campaign will receive leads from.')).toBeVisible()
    await expect(page.getByText('Select the Lead Type that defines the fields this campaign will accept.')).toBeVisible()
    await expect(page.getByText('Select how leads are received for this campaign.')).toBeVisible()
    await expect(page.getByText('Select the initial status for the new campaign.')).toBeVisible()
    await expect(page.getByText('Only active campaigns can accept leads.')).toBeVisible()
    await expectDialogNoHorizontalOverflow(page)

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.getByText('Choose how this campaign delivers leads to Clients.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Any Client/ })).toContainText(
      'Deliver leads to any qualified Client.',
    )
    await expect(page.getByRole('button', { name: /Single Client/ })).toContainText(
      'Deliver leads to a single Client.',
    )
    await expect(page.getByRole('button', { name: /Multiple Clients/ })).toContainText(
      'Deliver leads to a selected group of Clients.',
    )
    await expect(page.getByText('Select how qualified Clients are prioritized during delivery')).toBeVisible()
    await expect(page.getByText('Select the maximum number of Clients each lead can be delivered to.')).toBeVisible()
    await expectDialogNoHorizontalOverflow(page)

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.getByText('Route new leads into Quality Control for review before processing.')).toBeVisible()
    await expect(page.getByText('Specify how many previous days should be checked for duplicate leads.')).toBeVisible()
    await expect(page.getByText("Standardize the lead's primary address using industry-standard formatting.")).toBeVisible()
    await expect(page.getByText('Automatically append the city and state when a valid postal code and country are provided')).toBeVisible()
    await expect(page.getByText("Determine whether the lead's primary phone number is a mobile number.")).toBeVisible()
    await expect(page.getByText('Geolocation IP address of the lead. (fee may apply)')).toBeVisible()
    await expectDialogNoHorizontalOverflow(page)

    await page.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(page.getByText('Your campaign is ready to be created.')).toBeVisible()
    await expect(page.getByText(
      'Click Create and Open to create your campaign and continue configuring it on the Campaign Settings page.',
    )).toBeVisible()
    await expect(page.getByText('After your campaign is created, you can:')).toBeVisible()
    await expect(page.getByText('Review and update your campaign settings.')).toBeVisible()
    await expect(page.getByText('Complete any additional configuration required for your campaign type.')).toBeVisible()
    await expect(page.getByText("Generate posting instructions when you're ready to receive leads.")).toBeVisible()
    await expect(page.getByText('Test your campaign before moving it into production.')).toBeVisible()
    await expect(page.getByText('Click Create and Open to continue.')).toBeVisible()
    await expectDialogNoHorizontalOverflow(page)
  })

  test('shows the approved copy-campaign text', async ({ page }) => {
    await openCampaignLauncher(page)
    await page.getByRole('button', { name: /Create campaign only/ }).click()
    await page.getByRole('button', { name: /Copy Existing Campaign/ }).click()

    await expect(page.getByRole('heading', { name: 'Copy Existing Campaign' })).toBeVisible()
    await expect(page.getByText('Select the campaign you want to copy.')).toBeVisible()
    await expect(page.getByText(
      'Enter a name for the new campaign and select its destination Lead Source',
    )).toBeVisible()
    await expect(page.getByPlaceholder('Example: Mortgage Web Form')).toBeVisible()
    await expect(page.getByText('Select the Lead Source this campaign will receive leads from.')).toBeVisible()
    await expect(page.getByText('Select the initial status for this campaign.')).toBeVisible()
    await expectDialogNoHorizontalOverflow(page)
  })

  test('scopes shared copy to creation flows and preserves the editor', async ({ page }) => {
    await openCampaignLauncher(page)
    await page.getByRole('button', { name: /Create lead source and campaign/ }).click()

    await expect(page.getByRole('heading', { name: 'Create Lead Source' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Next Steps' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Quantity Limits' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.getByText('Select the Lead Type that defines the fields this campaign will accept.')).toBeVisible()
    await expect(page.getByText('Select how leads are received for this campaign.')).toBeVisible()

    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.getByText('Choose how this campaign delivers leads to Clients.')).toBeVisible()
    await expectDialogNoHorizontalOverflow(page)

    await page.getByRole('button', { name: 'Cancel' }).click()
    await page.getByRole('button', { name: /Open campaign editor/ }).click()
    await expect(page.getByPlaceholder('Example: Mortgage Web Form')).toBeVisible()
    await page.getByRole('button', { name: 'Delivery Options' }).click()

    await expect(page.getByText(
      'Choose how leads will be distributed: to a specific client, a group of clients, or all qualified clients.',
    )).toBeVisible()
    await expect(page.getByRole('button', { name: /Any Qualified/ })).toContainText(
      'Distribute leads among all qualified clients.',
    )
    await expect(page.getByText(
      'Supply which automation preference should take place when delivering leads.',
    )).toBeVisible()
  })
})
