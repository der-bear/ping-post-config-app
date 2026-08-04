import { expect, test, type Page } from '@playwright/test'

type ChannelCase = {
  option: 'Web' | 'Ping Post' | 'Phone' | 'Chat'
  subtitle: string
  specialTab?: string
  fullQuality: boolean
  agentForms: boolean
}

const CHANNELS: ChannelCase[] = [
  {
    option: 'Web',
    subtitle: 'Campaign - Web',
    fullQuality: true,
    agentForms: true,
  },
  {
    option: 'Ping Post',
    subtitle: 'Campaign - PING/POST',
    specialTab: 'PING Options',
    fullQuality: true,
    agentForms: false,
  },
  {
    option: 'Phone',
    subtitle: 'Campaign - Phone',
    specialTab: 'Phone Numbers',
    fullQuality: false,
    agentForms: false,
  },
  {
    option: 'Chat',
    subtitle: 'Campaign - Chat',
    specialTab: 'Web Chats',
    fullQuality: false,
    agentForms: false,
  },
]

const LAUNCHER_CHANNELS = [
  { card: 'Web campaign', subtitle: 'Campaign - Web', title: 'General Settings' },
  { card: 'Ping/Post campaign', subtitle: 'Campaign - PING/POST', title: 'PING Options' },
  { card: 'Phone campaign', subtitle: 'Campaign - Phone', title: 'Phone Numbers' },
  { card: 'Chat campaign', subtitle: 'Campaign - Chat', title: 'Web Chats' },
] as const

function fieldGroup(page: Page, label: string) {
  return page
    .locator('[data-slot="field-group"]')
    .filter({ has: page.getByText(label, { exact: true }) })
    .first()
}

async function chooseOption(page: Page, fieldLabel: string, option: string) {
  const field = fieldGroup(page, fieldLabel)
  const combobox = field.getByRole('combobox')

  if (await combobox.evaluate((element) => element.tagName === 'INPUT')) {
    await combobox.fill(option)
  } else {
    await combobox.click()
  }

  await page.getByRole('option', { name: option, exact: true }).click()
}

async function createCampaign(page: Page, channel: ChannelCase) {
  await page.goto('/ping-post-config-app/campaign-configuration')
  await page.getByRole('button', { name: /Create campaign only/ }).click()
  await page.getByRole('button', { name: /Create New/ }).click()

  await page.getByPlaceholder('Example: Mortgage Web Form').fill(`${channel.option} Campaign`)
  await chooseOption(page, 'Lead Source', '10234 - Acme Web Leads')
  await chooseOption(page, 'Lead Type', '40011 - Mortgage')
  await chooseOption(page, 'Channel', channel.option)

  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Create and Open' }).click()

  await expect(page.getByText(channel.subtitle, { exact: true })).toBeVisible()
}

test.describe('prototype campaign launcher', () => {
  test('opens every channel shortcut on its own initial campaign panel', async ({ page }) => {
    await page.goto('/ping-post-config-app/campaign-configuration')

    await expect(page.getByText('Creation flows', { exact: true })).toBeVisible()
    await expect(page.getByText('Edit campaign settings', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Open campaign editor/ })).toHaveCount(0)

    for (const channel of LAUNCHER_CHANNELS) {
      await page.getByRole('button', { name: new RegExp(channel.card) }).click()
      await expect(page.getByText(channel.subtitle, { exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: channel.title, exact: true })).toBeVisible()

      await page.locator('button').filter({ hasText: /^Close$/ }).click()
      await expect(page.getByText('Edit campaign settings', { exact: true })).toBeVisible()
    }
  })

  test('opens every channel next-steps dialog directly from preview shortcuts', async ({ page }) => {
    await page.goto('/ping-post-config-app/campaign-configuration')

    const previewShortcuts = page.locator('main').filter({
      has: page.getByText('Preview next-step dialogs', { exact: true }),
    })
    await expect(previewShortcuts).toBeVisible()
    await expect(previewShortcuts.getByRole('button')).toHaveCount(4)
    for (const previewButton of await previewShortcuts.getByRole('button').all()) {
      await expect(previewButton).toContainText('Preview')
      await expect(previewButton).not.toContainText('Start')
    }

    for (const preview of [
      { card: 'Web next steps', heading: 'Review General Settings' },
      { card: 'Ping/Post next steps', heading: 'Configure PING Options' },
      { card: 'Phone next steps', heading: 'Add a Phone Number' },
      { card: 'Chat next steps', heading: 'Configure Web Chats' },
    ]) {
      await page.getByRole('button', { name: new RegExp(preview.card) }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog.getByText('Your lead source has been created!', { exact: true })).toBeVisible()
      await expect(dialog.getByRole('heading', { name: preview.heading, exact: true })).toBeVisible()
      await dialog.getByRole('button', { name: 'Close', exact: true }).click()

      await expect(dialog).toHaveCount(0)
      await expect(page.getByText('Preview next-step dialogs', { exact: true })).toBeVisible()
    }

    await page.getByRole('button', { name: /Phone next steps/ }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.getByText('Campaign - Phone', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Phone Numbers', exact: true })).toBeVisible()
  })
})

test.describe('channel-specific campaign editor', () => {
  for (const channel of CHANNELS) {
    test(`${channel.option} uses its exact campaign tab profile`, async ({ page }) => {
      await createCampaign(page, channel)

      const editor = page
      await expect(editor.getByRole('button', { name: 'General', exact: true })).toBeVisible()
      await expect(editor.getByRole('button', { name: 'Delivery Options', exact: true })).toBeVisible()
      await expect(editor.getByRole('button', { name: 'Quality Options', exact: true })).toBeVisible()

      if (channel.specialTab) {
        await expect(editor.getByRole('button', { name: channel.specialTab, exact: true })).toBeVisible()
      }

      for (const tab of ['Duplicate Checks', 'Criteria', 'Quantity Limits', 'Lead Validation']) {
        const assertion = expect(editor.getByRole('button', { name: tab, exact: true }))
        if (channel.fullQuality) {
          await assertion.toBeVisible()
        } else {
          await assertion.toHaveCount(0)
        }
      }

      await expect(editor.getByRole('button', { name: 'Compliance', exact: true })).toBeVisible()

      const agentForms = expect(editor.getByRole('button', { name: 'Agent Forms', exact: true }))
      if (channel.agentForms) {
        await agentForms.toBeVisible()
      } else {
        await agentForms.toHaveCount(0)
      }

      await expect(editor.getByRole('button', { name: 'Posting Instructions', exact: true })).toBeVisible()
      await expect(editor.locator('button').filter({ hasText: /^Close$/ })).toBeVisible()
      await expect(editor.getByRole('button', { name: 'Save', exact: true })).toBeVisible()
    })
  }

  test('PING Options matches the requirement controls and field grid', async ({ page }) => {
    await createCampaign(page, CHANNELS[1])
    await page.getByRole('button', { name: 'PING Options', exact: true }).click()

    for (const label of [
      'Revenue Requirement',
      'Profit Requirement',
      'Profit Percentage Requirement',
      'Minimum Delivery Count',
      'Qualify All Criteria',
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }

    await expect(page.getByText('Field Requirements for PING', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeDisabled()
    await expect(page.getByRole('columnheader', { name: 'Field', exact: true })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Type', exact: true })).toBeVisible()
    await expect(page.getByText('No Fields', { exact: true })).toBeVisible()

    const requirementRowPadding = await page
      .getByRole('switch', { name: /Profit Percentage Requirement/ })
      .locator('xpath=../..')
      .evaluate((element) => ({
        top: getComputedStyle(element).paddingTop,
        bottom: getComputedStyle(element).paddingBottom,
      }))
    expect(requirementRowPadding).toEqual({ top: '0px', bottom: '0px' })
  })

  test('PING Add opens the required field dialog and saves the selected field', async ({ page }) => {
    await page.goto('/ping-post-config-app/campaign-configuration')
    await page.getByRole('button', { name: /Ping\/Post campaign/ }).click()
    await page.getByRole('button', { name: 'Add', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'PING Required Field', exact: true })).toBeVisible()
    const leadField = dialog.getByRole('combobox', { name: 'Select Lead Field' })
    await expect(leadField).toHaveValue('Address')
    await expect(dialog.getByRole('combobox', { name: 'Type' })).toContainText('Optional')

    await leadField.fill('Mortgage')
    for (const mortgageField of [
      'Current Mortgage Balance',
      'Late Mortgage Payments',
      'Second Mortgage',
    ]) {
      await expect(page.getByRole('option', { name: mortgageField, exact: true })).toBeVisible()
    }

    await leadField.fill('First')
    await expect(page.getByRole('option', { name: 'First Name', exact: true })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Address', exact: true })).toHaveCount(0)
    await page.getByRole('option', { name: 'First Name', exact: true }).click()

    await dialog.getByRole('combobox', { name: 'Type' }).click()
    await page.getByRole('option', { name: 'Required', exact: true }).click()

    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('row', { name: 'First Name Required', exact: true })).toBeVisible()
  })

  test('Phone Numbers shows the empty grid and visual IVR dialog', async ({ page }) => {
    await createCampaign(page, CHANNELS[2])
    await page.getByRole('button', { name: 'Phone Numbers', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeEnabled()
    for (const action of ['Edit', 'Delete', 'Edit Script']) {
      await expect(page.getByRole('button', { name: action, exact: true })).toBeDisabled()
    }
    for (const column of ['Name', 'Number', 'Call Flow']) {
      await expect(page.getByRole('columnheader', { name: column, exact: true })).toBeVisible()
    }
    await expect(page.getByText('No IVR Numbers', { exact: true })).toBeVisible()
    await expect(page.getByText('Note: IVR changes save automatically', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Add', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('IVR Number Details', { exact: true })).toBeVisible()
    await expect(dialog.getByText('IVR Number', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Call Flow', { exact: true })).toBeVisible()
    await expect(dialog.getByText('Message Flow', { exact: true })).toBeVisible()
    const ivrNumber = dialog.getByRole('combobox', { name: 'IVR Number' })
    await expect(ivrNumber).toContainText('No Numbers Available')
    await ivrNumber.click()
    await page.getByRole('option', { name: '(877) 624-3580', exact: true }).click()
    await expect(ivrNumber).toContainText('(877) 624-3580')
    await expect(dialog.getByRole('button', { name: 'Purchase New Number', exact: true })).toBeVisible()

    await dialog.getByRole('button', { name: 'Purchase New Number', exact: true }).click()
    const purchaseDialog = page.getByRole('dialog', { name: 'Purchase IVR Number' })
    await expect(purchaseDialog).toBeVisible()
    await expect(purchaseDialog.getByRole('combobox', { name: 'Country' })).toContainText('United States')
    await expect(purchaseDialog.getByRole('combobox', { name: 'Number Type' })).toContainText('Toll Free')
    await expect(purchaseDialog.getByRole('columnheader', { name: 'Select Number' })).toBeVisible()
    await expect(purchaseDialog.getByRole('columnheader', { name: 'Price Per Month' })).toBeVisible()

    const numberRow = purchaseDialog.getByRole('row', { name: '(866) 689-0601 $5.00' })
    await numberRow.click()
    await purchaseDialog.getByRole('button', { name: 'Purchase', exact: true }).click()
    await expect(purchaseDialog).toHaveCount(0)
    await expect(dialog.getByRole('combobox', { name: 'IVR Number' })).toContainText('(866) 689-0601')

    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByText('No IVR Numbers', { exact: true })).toBeVisible()
  })

  test('Web Chats shows the empty grid and visual chat dialog', async ({ page }) => {
    await createCampaign(page, CHANNELS[3])
    await page.getByRole('button', { name: 'Web Chats', exact: true }).click()

    await expect(page.getByRole('button', { name: 'Add', exact: true })).toBeEnabled()
    for (const action of ['Edit', 'Delete', 'View Script']) {
      await expect(page.getByRole('button', { name: action, exact: true })).toBeDisabled()
    }
    await expect(page.getByRole('columnheader', { name: 'Name', exact: true })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Message Flow', exact: true })).toBeVisible()
    await expect(page.getByText('No Web Chats', { exact: true })).toBeVisible()
    await expect(page.getByText('Note: Web chat changes save automatically', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Add', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Web Chat Dialog', { exact: true })).toBeVisible()
    for (const tab of ['Properties', 'Integrations', 'Phone Settings', 'Intake Form']) {
      await expect(dialog.getByRole('tab', { name: tab, exact: true })).toBeVisible()
    }
    for (const label of [
      'Name',
      'Message Flow',
      'Description',
      'Company Name',
      'Agent Name',
      'Initial Chat Message',
      'Show Heading Text',
      'Show Chat Button',
      'Auto Show Chat',
    ]) {
      await expect(dialog.getByText(label, { exact: true })).toBeVisible()
    }
    await expect(dialog.getByAltText('Web chat agent')).toBeVisible()

    const messageFlow = dialog.getByRole('combobox', { name: 'Message Flow' })
    await messageFlow.click()
    await page.getByRole('option', { name: 'Mortgage Chat Flow', exact: true }).click()
    await expect(messageFlow).toContainText('Mortgage Chat Flow')

    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByText('No Web Chats', { exact: true })).toBeVisible()
  })
})
