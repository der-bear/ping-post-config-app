import {
  contentAction,
  dialogAction,
  fieldGroup,
  navigationAction,
  openClientNextStep,
  readyAtLauncher,
  switchGroup,
  variants,
} from './client-walkthrough-common.mjs'

async function focusAndType(recorder, meta, input, group, text, initialValueDelta) {
  await recorder.click(dialogAction(
    meta,
    `focus-${meta}`,
    'focus',
    'textbox',
    `focus.${initialValueDelta}`,
  ), input, { frameLocator: group, strategy: 'value' })
  await recorder.type(dialogAction(
    meta,
    `type-${meta}`,
    'type',
    'textbox',
    initialValueDelta,
    { text, typingDelayMs: 62 },
  ), input, { frameLocator: group })
}

export default {
  id: 'order',
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  variants,
  ready: readyAtLauncher,
  async setup({ page }) {
    await openClientNextStep(
      page,
      'Lead Order Set quantity or budget',
      'Create Lead Order',
    )
    await page.getByRole('heading', { name: 'Create Order', exact: true }).waitFor()
  },
  async capture({ page, recorder }) {
    const createDialog = page.getByRole('dialog', { name: 'Create Order' })

    await focusAndType(
      recorder,
      'order-name',
      createDialog.getByLabel('Name', { exact: true }),
      fieldGroup(page, 'Name'),
      'September Mortgage Leads',
      'order.name',
    )

    const leadTypeGroup = fieldGroup(page, 'Lead Type')
    const leadType = createDialog.getByRole('combobox', { name: 'Lead Type' })
    await recorder.click(dialogAction(
      'order-lead-type',
      'open-order-lead-type',
      'open',
      'combobox',
      'order.leadType.menu',
    ), leadType, { frameLocator: leadTypeGroup })
    await recorder.click(dialogAction(
      'order-lead-type',
      'select-mortgage-lead-type',
      'select',
      'option',
      'order.leadType',
    ), page.getByRole('option', { name: 'Short Mortgage Lead', exact: true }), {
      frameLocator: leadTypeGroup,
    })

    await focusAndType(
      recorder,
      'order-start-date',
      createDialog.getByLabel('Start Date', { exact: true }),
      fieldGroup(page, 'Start Date'),
      '9/1/2026',
      'order.startDate',
    )

    const renewGroup = switchGroup(page, 'Renew Order')
    await recorder.click(dialogAction(
      'order-renew',
      'toggle-order-renewal',
      'toggle',
      'switch',
      'order.renewOrder',
      { holdMs: 420 },
    ), renewGroup.getByRole('switch'), { frameLocator: renewGroup, strategy: 'center' })

    await focusAndType(
      recorder,
      'order-quantity',
      createDialog.getByLabel('Quantity', { exact: true }),
      fieldGroup(page, 'Quantity'),
      '500',
      'order.quantity',
    )
    await focusAndType(
      recorder,
      'order-price',
      createDialog.getByLabel('Per Lead Price', { exact: true }),
      fieldGroup(page, 'Per Lead Price'),
      '42.50',
      'order.perLeadPrice',
    )

    const createButton = createDialog.getByRole('button', { name: 'Create', exact: true })
    await recorder.click(dialogAction(
      'order-create',
      'create-lead-order',
      'save',
      'button',
      'order.created',
      { holdMs: 720, cameraScale: 1.6, holdSurfaceAfterClick: true },
    ), createButton, {
      frameLocator: createDialog,
      ready: page.getByRole('heading', { name: 'General Options', exact: true }),
      strategy: 'top',
    })

    const panel = page.locator('[data-slot="panel-layout"]')
    const itemsTab = page.getByRole('button', { name: 'Items', exact: true })
    await recorder.click(navigationAction(
      'order-items-nav',
      'open-order-items',
      'click',
      'button',
      'order.section.items',
    ), itemsTab, {
      frameLocator: page.locator('[data-slot="panel-layout"] > div').first(),
      ready: page.getByRole('heading', { name: 'Items', exact: true }),
      strategy: 'left',
    })

    const orderRow = page.locator('[data-slot="data-grid-row"]').filter({
      hasText: 'All Delivery Accounts',
    })
    const grid = page.locator('[data-slot="data-grid"]')
    await recorder.click(contentAction(
      'order-item-row',
      'select-created-order-item',
      'select',
      'row',
      'order.item.selected',
      { holdMs: 360 },
    ), orderRow, { frameLocator: grid, strategy: 'left' })

    const editButton = page.getByRole('button', { name: 'Edit', exact: true })
    await recorder.click(contentAction(
      'order-item-row',
      'edit-created-order-item',
      'click',
      'button',
      'order.item.dialog',
      { holdSurfaceAfterClick: true },
    ), editButton, {
      frameLocator: grid,
      ready: page.getByRole('heading', { name: 'Edit Order Item', exact: true }),
      strategy: 'left',
    })

    const itemDialog = page.getByRole('dialog', { name: 'Edit Order Item' })
    const quantityInput = itemDialog.getByLabel('Quantity', { exact: true })
    await focusAndType(
      recorder,
      'order-item-quantity',
      quantityInput,
      itemDialog,
      '600',
      'order.item.quantity',
    )

    await recorder.click(dialogAction(
      'order-item-save',
      'save-order-item',
      'save',
      'button',
      'order.item.saved',
      { holdMs: 1000, cameraScale: 1.68 },
    ), itemDialog.getByRole('button', { name: 'Save', exact: true }), {
      frameLocator: panel,
      ready: async () => {
        await itemDialog.waitFor({ state: 'hidden' })
        await orderRow.waitFor()
      },
    })
  },
}
