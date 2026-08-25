import {
  contentAction,
  dialogAction,
  fieldGroup,
  navigationAction,
  openClientNextStep,
  readyAtLauncher,
  variants,
} from './client-walkthrough-common.mjs'

async function focusAndType(recorder, meta, input, group, text, stateDelta) {
  await recorder.click(dialogAction(
    meta,
    `focus-${meta}`,
    'focus',
    'textbox',
    `focus.${stateDelta}`,
  ), input, { frameLocator: group, strategy: 'value' })
  await recorder.type(dialogAction(
    meta,
    `type-${meta}`,
    'type',
    'textbox',
    stateDelta,
    { text, typingDelayMs: 54 },
  ), input, { frameLocator: group })
}

export default {
  id: 'delivery-method',
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  variants,
  ready: readyAtLauncher,
  async setup({ page }) {
    await openClientNextStep(
      page,
      'Delivery Method Add another method',
      'Add Delivery Method',
    )
    await page.getByRole('heading', { name: 'Create Delivery Method', exact: true }).waitFor()
  },
  async capture({ page, recorder }) {
    const createDialog = page.getByRole('dialog', { name: 'Create Delivery Method' })
    const webhookCard = createDialog.getByRole('button', { name: /HTTP Webhook/ })
    await recorder.click(dialogAction(
      'method-overview',
      'select-http-webhook',
      'select',
      'row',
      'deliveryMethod.type',
      { holdMs: 520, cameraScale: 1.16 },
    ), webhookCard, { frameLocator: createDialog, strategy: 'center' })

    await recorder.click(dialogAction(
      'method-confirm',
      'continue-webhook-creation',
      'click',
      'button',
      'deliveryMethod.configure',
      { cameraScale: 1.5, holdSurfaceAfterClick: true },
    ), createDialog.getByRole('button', { name: 'Continue', exact: true }), {
      frameLocator: webhookCard,
      ready: page.getByRole('heading', {
        name: 'Create Delivery Method - HTTP Webhook',
        exact: true,
      }),
    })

    const configureDialog = page.getByRole('dialog', {
      name: 'Create Delivery Method - HTTP Webhook',
    })
    const descriptionGroup = fieldGroup(page, 'Description (required)')
    await focusAndType(
      recorder,
      'method-description',
      configureDialog.getByLabel('Description', { exact: true }),
      descriptionGroup,
      'Summit Mortgage CRM Webhook',
      'deliveryMethod.description',
    )

    const leadTypeGroup = fieldGroup(page, 'Lead Type (required)')
    const leadType = configureDialog.getByRole('combobox', { name: 'Lead Type' })
    await recorder.click(dialogAction(
      'method-lead-type',
      'open-method-lead-type',
      'open',
      'combobox',
      'deliveryMethod.leadType.menu',
    ), leadType, { frameLocator: leadTypeGroup })
    await recorder.click(dialogAction(
      'method-lead-type',
      'select-method-mortgage',
      'select',
      'option',
      'deliveryMethod.leadType',
    ), page.getByRole('option', { name: 'Mortgage', exact: true }), {
      frameLocator: leadTypeGroup,
    })

    await recorder.click(dialogAction(
      'method-create',
      'create-webhook-method',
      'save',
      'button',
      'deliveryMethod.created',
      { holdMs: 720, cameraScale: 1.62, holdSurfaceAfterClick: true },
    ), configureDialog.getByRole('button', { name: 'Create', exact: true }), {
      frameLocator: configureDialog,
      ready: page.getByRole('heading', { name: 'URL Endpoint', exact: true }),
    })

    const productionGroup = fieldGroup(page, 'Production URL')
    const productionInput = productionGroup.locator('input')
    await focusAndType(
      recorder,
      'production-url',
      productionInput,
      productionGroup,
      'https://api.summithomebuyers.com/v1/leads',
      'deliveryMethod.productionUrl',
    )

    const sandboxGroup = fieldGroup(page, 'Testing / Sandbox URL')
    const sandboxInput = sandboxGroup.locator('input')
    await focusAndType(
      recorder,
      'sandbox-url',
      sandboxInput,
      sandboxGroup,
      'https://sandbox.summithomebuyers.com/v1/leads',
      'deliveryMethod.testingUrl',
    )

    const contentTypeGroup = fieldGroup(page, 'Content Type')
    const contentType = contentTypeGroup.getByRole('combobox')
    await recorder.click(contentAction(
      'method-content-type',
      'open-content-type',
      'open',
      'combobox',
      'deliveryMethod.contentType.menu',
    ), contentType, { frameLocator: contentTypeGroup })
    await recorder.click(contentAction(
      'method-content-type',
      'select-json-content-type',
      'select',
      'option',
      'deliveryMethod.contentType',
    ), page.getByRole('option', { name: 'application/json', exact: true }), {
      frameLocator: contentTypeGroup,
    })

    const panel = page.locator('[data-slot="panel-layout"]')
    await recorder.click(navigationAction(
      'method-mappings-nav',
      'open-webhook-mappings',
      'click',
      'button',
      'deliveryMethod.section.mappings',
    ), page.getByRole('button', { name: 'Mappings', exact: true }), {
      frameLocator: panel.locator(':scope > div').first(),
      ready: page.getByRole('heading', { name: 'Mappings', exact: true }),
      strategy: 'left',
    })

    const grid = page.locator('[data-slot="data-grid"]')
    await recorder.click(contentAction(
      'method-mappings-grid',
      'open-bulk-add',
      'click',
      'button',
      'deliveryMethod.bulkAdd.open',
      { holdSurfaceAfterClick: true },
    ), page.getByRole('button', { name: 'Bulk Add', exact: true }), {
      frameLocator: grid,
      ready: page.getByRole('heading', { name: 'Select Fields to Add', exact: true }),
      strategy: 'left',
    })

    const bulkDialog = page.getByRole('dialog', { name: 'Select Fields to Add' })
    const mappings = [
      ['first_name', 'firstName'],
      ['last_name', 'lastName'],
      ['email_address', 'email'],
    ]

    for (const [systemName, deliveryName] of mappings) {
      const row = bulkDialog.getByRole('row').filter({ hasText: systemName })
      const includeSwitch = row.getByRole('switch')
      await recorder.click(dialogAction(
        `mapping-${systemName}`,
        `include-${systemName}`,
        'toggle',
        'switch',
        `deliveryMethod.mapping.${systemName}.included`,
        { holdMs: 320 },
      ), includeSwitch, { frameLocator: row, strategy: 'center' })

      const deliveryNameInput = row.locator('input')
      await focusAndType(
        recorder,
        `mapping-${systemName}`,
        deliveryNameInput,
        row,
        deliveryName,
        `deliveryMethod.mapping.${systemName}.name`,
      )
    }

    await recorder.click(dialogAction(
      'method-mappings-save',
      'replace-field-mappings',
      'save',
      'button',
      'deliveryMethod.mappings.replaced',
      { holdMs: 1000, cameraScale: 1.62 },
    ), bulkDialog.getByRole('button', { name: 'Add Field Mappings', exact: true }), {
      frameLocator: panel,
      ready: async () => {
        await bulkDialog.waitFor({ state: 'hidden' })
        await grid.locator('[data-slot="data-grid-row"]').filter({ hasText: 'firstName' }).waitFor()
      },
    })
  },
}
