import {
  contentAction,
  dialogAction,
  fieldGroup,
  openClientNextStep,
  readyAtLauncher,
  variants,
} from './client-walkthrough-common.mjs'

export default {
  id: 'criteria',
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 2 },
  variants,
  ready: readyAtLauncher,
  async setup({ page }) {
    await openClientNextStep(
      page,
      'Delivery Criteria Define qualified leads',
      'Configure Delivery Criteria',
    )
    await page.getByRole('heading', { name: 'Criteria', exact: true }).waitFor()
  },
  async capture({ page, recorder }) {
    const panel = page.locator('[data-slot="panel-layout"]')
    const grid = page.locator('[data-slot="data-grid"]')
    const toolbar = page.locator('[data-slot="data-grid-toolbar"]')
    const newButton = page.getByRole('button', { name: 'New', exact: true })

    await recorder.click(contentAction(
      'criteria-new',
      'open-criterion-menu',
      'open',
      'button',
      'criteria.typeMenu.open',
    ), newButton, { frameLocator: toolbar, strategy: 'left' })

    await recorder.click(contentAction(
      'criteria-new',
      'select-lead-field-criterion',
      'select',
      'option',
      'criteria.dialog.open',
      { holdSurfaceAfterClick: true },
    ), page.getByRole('menuitem', { name: 'Lead Field', exact: true }), {
      frameLocator: toolbar,
      ready: page.getByRole('heading', { name: 'Lead Field Criteria', exact: true }),
      strategy: 'left',
    })

    const criterionDialog = page.getByRole('dialog', { name: 'Lead Field Criteria' })
    const leadFieldGroup = fieldGroup(page, 'Lead Field')
    const fieldSelect = criterionDialog.getByRole('combobox', { name: 'Lead Field' })
    await recorder.click(dialogAction(
      'criteria-field',
      'open-lead-field',
      'open',
      'combobox',
      'criteria.leadField.menu',
      { cameraScale: 1.72 },
    ), fieldSelect, { frameLocator: leadFieldGroup })
    await recorder.click(dialogAction(
      'criteria-field',
      'select-state-field',
      'select',
      'option',
      'criteria.leadField',
      { cameraScale: 1.72 },
    ), page.getByRole('option', { name: 'State', exact: true }), {
      frameLocator: leadFieldGroup,
    })

    const operatorGroup = fieldGroup(page, 'Operator')
    const operatorSelect = criterionDialog.getByRole('combobox', { name: 'Operator' })
    await recorder.click(dialogAction(
      'criteria-operator',
      'open-operator',
      'open',
      'combobox',
      'criteria.operator.menu',
    ), operatorSelect, { frameLocator: operatorGroup })
    await recorder.click(dialogAction(
      'criteria-operator',
      'select-any-of-operator',
      'select',
      'option',
      'criteria.operator',
    ), page.getByRole('option', { name: 'Is Any Of', exact: true }), {
      frameLocator: operatorGroup,
    })

    const valueGroup = fieldGroup(page, 'Value List')
    const valueInput = criterionDialog.getByRole('combobox', { name: 'Value List' })
    const states = [
      ['arizona', 'Ari', 'Arizona'],
      ['california', 'Cal', 'California'],
    ]

    for (const [stateId, query, stateName] of states) {
      await recorder.click(dialogAction(
        'criteria-values',
        `focus-${stateId}-search`,
        'focus',
        'textbox',
        `focus.criteria.value.${stateId}`,
      ), valueInput, { frameLocator: valueGroup, strategy: 'value' })
      await recorder.type(dialogAction(
        'criteria-values',
        `search-${stateId}`,
        'type',
        'textbox',
        `criteria.value.search.${stateId}`,
        { text: query, typingDelayMs: 80 },
      ), valueInput, { frameLocator: valueGroup })

      const stateCheckbox = page.getByRole('checkbox', { name: stateName, exact: true })
      await recorder.click(dialogAction(
        'criteria-values',
        `select-${stateId}`,
        'click',
        'checkbox',
        `criteria.value.${stateId}`,
        { holdMs: 420 },
      ), stateCheckbox, {
        frameLocator: stateCheckbox.locator('xpath=..'),
        strategy: 'center',
      })
    }

    const dialogHeading = criterionDialog.getByRole('heading', {
      name: 'Lead Field Criteria',
      exact: true,
    })
    await recorder.click(dialogAction(
      'criteria-values',
      'close-state-picker',
      'click',
      'heading',
      'criteria.valueList.closed',
      { holdMs: 260 },
    ), dialogHeading, {
      frameLocator: criterionDialog,
      ready: async () => {
        await page.getByRole('checkbox', { name: 'Select all' }).waitFor({ state: 'hidden' })
      },
    })

    await recorder.click(dialogAction(
      'criteria-save',
      'save-criterion',
      'save',
      'button',
      'criteria.saved',
      { holdMs: 1000, cameraScale: 1.72 },
    ), criterionDialog.getByRole('button', { name: 'Save', exact: true }), {
      frameLocator: panel,
      ready: async () => {
        await criterionDialog.waitFor({ state: 'hidden' })
        await grid.locator('[data-slot="data-grid-row"]').filter({ hasText: 'State' }).waitFor()
      },
    })
  },
}
