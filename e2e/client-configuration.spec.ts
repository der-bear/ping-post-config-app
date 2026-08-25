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
    await expect(page.getByRole('button', { name: /Create HTTP Webhook/ })).toBeVisible()
    await expect(page.getByText('Edit outbound settings', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Delivery Account/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Order/ })).toBeVisible()
    await expect(page.getByText('Preview next-step dialogs', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Client next steps/ })).toBeVisible()
  })
})

test.describe('create client wizard', () => {
  test('matches the live generated-password state without marking the number rule as met', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Create client and delivery account/ }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Company Name').fill('Summit Home Buyers')
    await dialog.getByLabel('First Name').fill('Maya')
    await dialog.getByLabel('Last Name').fill('Chen')
    await dialog.getByLabel('Email').fill('maya.chen@example.com')
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()

    const passwordRequirements = dialog.getByRole('list', { name: 'Password requirements' })
    await expect(passwordRequirements.getByRole('listitem')).toHaveCount(4)
    for (const requirement of await passwordRequirements.getByRole('listitem').all()) {
      await expect(requirement).toHaveAttribute('data-state', 'unmet')
    }

    await dialog.getByRole('button', { name: 'Generate', exact: true }).click()

    await expect(dialog.getByRole('textbox', { name: 'Password', exact: true })).toHaveValue('-7rumqmX')
    await expect(passwordRequirements.getByRole('listitem').filter({ hasText: 'Be at least 8 characters in length' })).toHaveAttribute(
      'data-state',
      'met',
    )
    await expect(passwordRequirements.getByRole('listitem').filter({ hasText: 'Contain at least 1 number' })).toHaveAttribute(
      'data-state',
      'unmet',
    )
    await expect(passwordRequirements.getByRole('listitem').filter({ hasText: 'Contain at least 1 special character' })).toHaveAttribute(
      'data-state',
      'met',
    )
    await expect(passwordRequirements.getByRole('listitem').filter({ hasText: 'Contain at least 1 upper case letter' })).toHaveAttribute(
      'data-state',
      'met',
    )
    await expect(dialog.getByRole('button', { name: 'Generate', exact: true })).toHaveAttribute(
      'data-state',
      'generated',
    )
  })

  test('defaults to Lead Portal and skips portal login for other delivery types', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Create client and delivery account/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(
      dialog.getByRole('heading', { name: 'Contact Information', exact: true }),
    ).toBeVisible()
    for (const label of ['Company Name', 'First Name', 'Last Name', 'Email']) {
      await expect(dialog.getByLabel(label, { exact: true })).toHaveValue('')
      await expect(dialog.getByLabel(label, { exact: true })).toHaveAttribute(
        'placeholder',
        'Required',
      )
    }
    await expect(dialog.getByRole('button', { name: 'Previous', exact: true })).toBeDisabled()
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(dialog.getByText('Company Name is required.', { exact: true })).toBeVisible()

    await dialog.getByLabel('Company Name').fill('Summit Home Buyers')
    await dialog.getByLabel('First Name').fill('Maya')
    await dialog.getByLabel('Last Name').fill('Chen')
    await dialog.getByLabel('Email').fill('maya.chen@example.com')
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()

    await expect(dialog.getByText('Delivery Method', { exact: true })).toBeVisible()
    await expect(dialog.getByRole('switch', { name: /Automated Delivery/ })).toBeChecked()
    await expect(dialog.getByRole('combobox', { name: 'Type of Delivery' })).toContainText(
      'Lead Portal',
    )
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(
      dialog.getByRole('heading', { name: 'Portal Login Information', exact: true }),
    ).toBeVisible()
    await expect(dialog.getByLabel('Username')).toHaveAttribute('placeholder', 'Required')
    await expect(dialog.getByRole('textbox', { name: 'Password', exact: true })).toHaveAttribute('placeholder', 'Required')

    await dialog.getByRole('button', { name: 'Previous', exact: true }).click()
    await dialog.getByRole('combobox', { name: 'Type of Delivery' }).click()
    await page.getByRole('option', { name: 'HTTP Webhook', exact: true }).click()
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(dialog.getByText('Delivery Account', { exact: true })).toBeVisible()
    const channel = dialog.getByRole('combobox', { name: 'Channel' })
    await expect(channel).toContainText('Web and Chat Leads')
    await expect(dialog.getByRole('link', { name: 'Lead Receiver Documentation' })).toBeVisible()
    await expect(dialog.getByRole('link', { name: 'Message Flows' })).toBeVisible()
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

    await dialog.getByLabel('Username').fill('maya.chen')
    await dialog.getByRole('textbox', { name: 'Password', exact: true }).fill('SafeTest#4829')
    await dialog.getByRole('button', { name: 'Next', exact: true }).click()

    await dialog.getByLabel('Delivery Account Name').fill('Summit Web Leads')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()

    await expect(page.getByText('Your client has been created!', { exact: true })).toBeVisible()
  })
})

test.describe('client next steps and Delivery Account tabs', () => {
  test('keeps captured research values out of fresh editors', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()

    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await expect(page.getByLabel('Delivery Account Name', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('Delivery Account Name', { exact: true })).toHaveAttribute(
      'placeholder',
      'Example: Semi-exclusive leads in California',
    )
    await expect(page.getByText(/Codex/i)).toHaveCount(0)

    await page.getByRole('button', { name: 'Close', exact: true }).last().click()
    await page.getByRole('button', { name: /^Order/ }).click()
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('placeholder', 'Required')
    await expect(page.getByLabel('Description', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('Start Date', { exact: true })).toHaveValue('')
    await expect(page.getByLabel('Start Date', { exact: true })).toHaveAttribute(
      'placeholder',
      'M/D/YYYY',
    )
    await page.getByRole('button', { name: 'Items', exact: true }).click()
    await expect(page.getByText('No Items', { exact: true })).toBeVisible()
    await expect(page.getByText(/Codex/i)).toHaveCount(0)
  })

  test('uses the previous panel icons for expand and collapse', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /^Delivery Account/ }).click()

    const expand = page.getByRole('button', { name: 'Expand', exact: true })
    await expect(expand.locator('svg.lucide-maximize-2')).toBeVisible()
    await expand.click()
    await expect(
      page.getByRole('button', { name: 'Collapse', exact: true }).locator('svg.lucide-minimize-2'),
    ).toBeVisible()
  })

  test('presents client setup topics with criteria selected first', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Client next steps/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(dialog.getByText(
      'Your client profile, Lead Portal, and initial Delivery Account have been created successfully.',
      { exact: true },
    )).toBeVisible()
    await expect(dialog.getByText(
      'You can always return to Delivery Account Settings later to make updates or adjustments.',
      { exact: true },
    )).toBeVisible()
    await expect(dialog.getByText('Next steps', { exact: true })).toBeVisible()
    await expect(
      dialog.getByRole('heading', { name: 'Set Up Delivery Criteria' }),
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Configure Delivery Criteria' })).toBeVisible()

    const options = dialog.getByRole('tablist', { name: 'Client configuration options' })
    const criteria = options.getByRole('tab', {
      name: 'Delivery Criteria Define qualified leads',
      exact: true,
    })
    const order = options.getByRole('tab', {
      name: 'Lead Order Set quantity or budget',
      exact: true,
    })
    const method = options.getByRole('tab', {
      name: 'Delivery Method Add another method',
      exact: true,
    })
    await expect(criteria).toHaveAttribute('aria-selected', 'true')
    await expect(criteria).toHaveCSS('text-align', 'left')
    await expect(criteria).toHaveCSS('border-top-width', '1px')
    await expect(criteria).toHaveCSS('border-top-color', 'rgb(73, 139, 255)')
    await expect(criteria).toHaveCSS('border-right-width', '0px')
    await expect(criteria).toHaveCSS('border-bottom-width', '0px')
    await expect(criteria).toHaveCSS('border-left-width', '0px')
    await expect(criteria).toHaveCSS('padding-left', '12px')
    await expect(criteria).toHaveCSS('padding-right', '12px')
    await expect(criteria.locator('span').first()).toHaveCSS('font-size', '14px')
    await expect(criteria.locator('span').first()).toHaveCSS('font-weight', '500')
    await expect(order).toHaveAttribute('aria-selected', 'false')
    await expect(order.locator('span').nth(1)).toHaveCSS('color', 'rgb(131, 136, 144)')
    await expect(method).toHaveAttribute('aria-selected', 'false')

    await order.hover()
    await expect(order).toHaveCSS('border-top-width', '1px')
    await expect(order).toHaveCSS('border-top-color', 'rgb(231, 233, 235)')
    await expect(order).toHaveCSS('border-right-width', '0px')
    await expect(order).toHaveCSS('border-bottom-width', '0px')
    await expect(order).toHaveCSS('border-left-width', '0px')
    await expect(order).toHaveCSS('background-color', 'rgb(251, 251, 251)')
    await expect(order.locator('span').first()).toHaveCSS('color', 'rgb(71, 75, 85)')
    await expect(order.locator('span').nth(1)).toHaveCSS('color', 'rgb(98, 103, 112)')

    const orderBox = await order.boundingBox()
    expect(orderBox).not.toBeNull()
    await page.mouse.move(orderBox!.x + orderBox!.width / 2, orderBox!.y + orderBox!.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(200)
    await expect(order).not.toHaveCSS('background-color', 'rgb(232, 240, 255)')
    await page.mouse.move(0, 0)
    await page.mouse.up()

    await criteria.hover()
    await expect(criteria).toHaveCSS('border-top-color', 'rgb(73, 139, 255)')

    await order.click()
    await expect(dialog.getByRole('heading', { name: 'Create a Lead Order' })).toBeVisible()
    await expect(order).toHaveAttribute('aria-selected', 'true')

    await method.click()
    await expect(
      dialog.getByRole('heading', { name: 'Create an Additional Delivery Method' }),
    ).toBeVisible()

    await method.press('ArrowLeft')
    await expect(order).toBeFocused()
    await expect(order).toHaveAttribute('aria-selected', 'true')

    await criteria.click()
    const configureCriteria = dialog.getByRole('button', { name: 'Configure Delivery Criteria' })
    const [dialogBox, actionBox] = await Promise.all([
      dialog.boundingBox(),
      configureCriteria.boundingBox(),
    ])
    expect(dialogBox).not.toBeNull()
    expect(actionBox).not.toBeNull()
    expect(dialogBox!.x + dialogBox!.width - actionBox!.x - actionBox!.width).toBeLessThanOrEqual(32)
    await configureCriteria.click()

    await expect(page.getByRole('heading', { name: 'Criteria', exact: true })).toBeVisible()
  })

  test('plays the matching walkthrough for every client next-step topic', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Client next steps/ }).click()

    const dialog = page.getByRole('dialog')
    const walkthroughs = [
      {
        tab: 'Delivery Criteria Define qualified leads',
        id: 'criteria',
        title: 'Delivery criteria configuration walkthrough',
      },
      {
        tab: 'Lead Order Set quantity or budget',
        id: 'order',
        title: 'Lead order configuration walkthrough',
      },
      {
        tab: 'Delivery Method Add another method',
        id: 'delivery-method',
        title: 'Delivery method configuration walkthrough',
      },
    ] as const

    for (const walkthrough of walkthroughs) {
      await dialog.getByRole('tab', { name: walkthrough.tab, exact: true }).click()
      const video = dialog.locator(`video[data-walkthrough="${walkthrough.id}"]`)
      await expect(video).toBeVisible()
      await expect(video).toHaveAttribute('aria-label', walkthrough.title)
      await expect(video).toHaveAttribute(
        'poster',
        new RegExp(`client-preview-${walkthrough.id}-light\\.png\\?v=first-frame-20260825$`),
      )
      await expect(video.locator('source[type="video/webm"]')).toHaveAttribute(
        'src',
        new RegExp(`client-walkthrough-${walkthrough.id}-light\\.webm$`),
      )
      await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute(
        'src',
        new RegExp(`client-walkthrough-${walkthrough.id}-light\\.mp4$`),
      )
      expect(await video.evaluate((element: HTMLVideoElement) => ({
        autoplay: element.autoplay,
        muted: element.muted,
        loop: element.loop,
        playsInline: element.playsInline,
      }))).toEqual({ autoplay: true, muted: true, loop: true, playsInline: true })
    }
  })

  test('uses dark client walkthrough assets when dark theme is selected', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => localStorage.setItem('theme', 'dark'))
    await page.reload()
    await page.getByRole('button', { name: /Client next steps/ }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('tab', {
      name: 'Delivery Method Add another method',
      exact: true,
    }).click()
    const video = dialog.locator('video[data-walkthrough="delivery-method"]')
    await expect(video).toHaveAttribute(
      'poster',
      /client-preview-delivery-method-dark\.png\?v=first-frame-20260825$/,
    )
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute(
      'src',
      /client-walkthrough-delivery-method-dark\.webm$/,
    )
    await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute(
      'src',
      /client-walkthrough-delivery-method-dark\.mp4$/,
    )
  })

  test('keeps client walkthroughs paused when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(route)
    await page.getByRole('button', { name: /Client next steps/ }).click()

    const video = page.getByRole('dialog').locator('video[data-walkthrough="criteria"]')
    expect(await video.evaluate((element: HTMLVideoElement) => ({
      autoplay: element.autoplay,
      paused: element.paused,
    }))).toEqual({ autoplay: false, paused: true })
  })

  test('keeps additional Webhook creation inside Client Configuration', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /Client next steps/ }).click()

    const nextSteps = page.getByRole('dialog')
    await nextSteps.getByRole('tab', {
      name: 'Delivery Method Add another method',
      exact: true,
    }).click()
    await nextSteps.getByRole('button', { name: 'Add Delivery Method', exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`${route}$`))
    const createMethod = page.getByRole('dialog')
    await expect(
      createMethod.getByRole('heading', { name: 'Create Delivery Method', exact: true }),
    ).toBeVisible()
    await createMethod.getByRole('button', { name: /HTTP Webhook/ }).click()
    await createMethod.getByRole('button', { name: 'Continue', exact: true }).click()
    await createMethod
      .getByPlaceholder('Enter a description for this delivery method', { exact: true })
      .fill('Summit CRM Webhook')
    await createMethod.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Mortgage', exact: true }).click()
    await createMethod.getByRole('button', { name: 'Create', exact: true }).click()

    await expect(page).toHaveURL(new RegExp(`${route}$`))
    await expect(page.getByRole('button', { name: 'Webhook Configuration' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'URL Endpoint', exact: true })).toBeVisible()
  })

  test('shows all Delivery Account tabs and their panels', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /^Delivery Account/ }).click()

    const panels = [
      ['General', 'Delivery Account Detail'],
      ['Quantity Limits', 'Quantity Limits'],
      ['Delivery', 'Delivery'],
      ['Revenue', 'Revenue'],
      ['Criteria', 'Criteria'],
      ['Offer', 'Offer Details'],
      ['Advanced', 'Advanced Options'],
    ] as const

    for (const [tab, heading] of panels) {
      const tabButton = page.getByRole('button', { name: tab, exact: true })
      await expect(tabButton).toBeVisible()
      await tabButton.click()
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    }
  })

  test('uses the live criteria type menu and starts a Lead Field criterion empty', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()

    await page.getByRole('button', { name: 'New', exact: true }).click()
    for (const item of [
      'Lead Field',
      'Client Field',
      'Regular Expression',
      'Calculated Expression',
      'Evaluate Function',
    ]) {
      await expect(page.getByRole('menuitem', { name: item, exact: true })).toBeVisible()
    }

    await page.getByRole('menuitem', { name: 'Lead Field', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Lead Field Criteria', exact: true })).toBeVisible()
    await expect(dialog.getByRole('combobox', { name: 'Lead Field' })).toContainText('Select...')
    await expect(dialog.getByRole('combobox', { name: 'Operator' })).toContainText('Select...')
    await expect(dialog.getByLabel('Value List', { exact: true })).toHaveValue('')
    await expect(dialog.getByLabel('Value List', { exact: true })).toHaveAttribute(
      'placeholder',
      'Select...',
    )
  })

  test('uses the live Delivery Account defaults and selection values', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()

    await page.getByRole('button', { name: 'Quantity Limits', exact: true }).click()
    await expect(page.getByLabel('Hour Limit Value', { exact: true })).toHaveValue('0')

    await page.getByRole('button', { name: 'Delivery', exact: true }).click()
    await page.getByRole('switch', { name: /Additional Delivery Method #1/ }).click()
    await page.getByRole('combobox', { name: 'Additional Delivery Method #1 fallback' }).click()
    await expect(
      page.getByRole('option', { name: 'Send even if primary fails', exact: true }),
    ).toBeVisible()
    await page.getByRole('option', { name: 'Send even if primary fails', exact: true }).click()

    await page.getByRole('button', { name: 'Revenue', exact: true }).click()
    await expect(page.getByLabel('Revenue Required Value', { exact: true })).toHaveValue('$0.00')
    await expect(page.getByLabel('Profit % Required Value', { exact: true })).toHaveValue('0%')

    await page.getByRole('button', { name: 'Advanced', exact: true }).click()
    await page.getByRole('switch', { name: /Limit by Percentage of Qualified Leads/ }).click()
    await page.getByRole('combobox', { name: 'Qualified Lead Limit Period' }).click()
    for (const option of ['Total', 'Hour', 'Day', 'Week', 'Month', 'Year']) {
      await expect(page.getByRole('option', { name: option, exact: true })).toBeVisible()
    }
    await expect(page.getByLabel('Qualified Lead Percentage', { exact: true })).toHaveValue('0%')
  })

  test('starts the live Offer form with empty optional details', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Offer', exact: true }).click()

    for (const label of [
      'Offer Company Name',
      'Offer Company Phone Number',
      'Offer Name',
      'Offer Description',
      'Offer URL',
      'Offer Image URL',
      'Offer Privacy URL',
      'Offer Terms URL',
    ]) {
      await expect(page.getByLabel(label, { exact: true })).toHaveValue('')
    }
  })

  test('matches the live Offer choices, money format, and schedule controls', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Offer', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Offer Details', exact: true })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Offer Source' })).toContainText('Static Offer')
    await page.getByRole('combobox', { name: 'Offer Source' }).click()
    await expect(page.getByRole('option', { name: 'Dynamic', exact: true })).toBeVisible()
    await page.getByRole('option', { name: 'Dynamic', exact: true }).click()

    await page.getByRole('combobox', { name: 'Offer Duration' }).click()
    await expect(page.getByRole('option', { name: 'Monthly', exact: true })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Yearly', exact: true })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Weekly', exact: true })).toHaveCount(0)
    await expect(page.getByLabel('Offer Amount', { exact: true })).toHaveValue('$0.00')
    await expect(page.getByRole('heading', { name: 'Schedule', exact: true })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Offer Time Zone' })).toContainText(
      'Europe - Kiev',
    )
  })
})

test.describe('Delivery Account Criteria', () => {
  test('adds, edits, and removes a criterion', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()

    await expect(page.getByText('No Criteria', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Lead Field', exact: true }).click()

    let dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox', { name: 'Lead Field' }).click()
    await page.getByRole('option', { name: 'State', exact: true }).click()
    await expect(dialog.getByRole('combobox', { name: 'Operator' })).toContainText('Is Any Of')

    await dialog.getByRole('combobox', { name: 'Value List' }).click()
    await expect(page.getByRole('checkbox', { name: 'Select all' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'American Samoa' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Armed Forces (AE)' })).toBeVisible()
    await page.getByRole('checkbox', { name: 'Arizona', exact: true }).click()
    await page.getByRole('checkbox', { name: 'California', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Remove Arizona' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Remove California' })).toBeVisible()
    await page.keyboard.press('Escape')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.getByText('AZ, CA', { exact: true })).toBeVisible()
    await page.getByText('AZ, CA', { exact: true }).click()
    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Remove Arizona' }).click()
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
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Lead Field', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox', { name: 'Lead Field' }).click()
    await page.getByRole('option', { name: 'State', exact: true }).click()
    await dialog.getByRole('combobox', { name: 'Value List' }).click()
    await page.getByRole('checkbox', { name: 'Arizona', exact: true }).click()
    await page.keyboard.press('Escape')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()

    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()
    await expect(page.getByText('AZ', { exact: true })).toBeVisible()
  })

  test('supports searching and selecting every State value', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()
    await page.getByRole('button', { name: 'New', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Lead Field', exact: true }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox', { name: 'Lead Field' }).click()
    await page.getByRole('option', { name: 'State', exact: true }).click()
    const valueList = dialog.getByRole('combobox', { name: 'Value List' })
    await valueList.click()
    await valueList.fill('amer')
    await expect(page.getByRole('checkbox', { name: 'American Samoa' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Alabama' })).toHaveCount(0)

    await valueList.fill('')
    await page.getByRole('checkbox', { name: 'Arizona', exact: true }).click()
    await expect(page.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'data-state',
      'indeterminate',
    )
    await page.getByRole('checkbox', { name: 'Select all' }).click()
    await expect(page.getByRole('checkbox', { name: 'Select all' })).toBeChecked()
  })
})

test.describe('Create Order and Items', () => {
  test('shows every captured Order tab and the empty Payments panel', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Order/ }).click()

    for (const tab of ['General', 'Items', 'Payments']) {
      await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible()
    }

    await page.getByRole('button', { name: 'Payments', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Payments', exact: true })).toBeVisible()
    for (const action of ['Apply Payment', 'View', 'Reverse']) {
      await expect(page.getByRole('button', { name: action, exact: true })).toBeVisible()
    }
    for (const column of ['Type', 'Date', 'Amount', 'Status', 'Applied']) {
      await expect(page.getByRole('columnheader', { name: column, exact: true })).toBeVisible()
    }
    await expect(page.getByText('Total:', { exact: true })).toBeVisible()
    await expect(page.getByText('$0.00', { exact: true })).toBeVisible()
    await expect(page.getByText('Note: Payment changes save automatically', { exact: true })).toBeVisible()
  })

  test('matches the live Order General controls and defaults', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Order/ }).click()

    await expect(page.getByRole('heading', { name: 'General Options', exact: true })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Order Status' })).toContainText('Open')
    await expect(page.getByRole('switch', { name: /Auto Charge/ })).not.toBeChecked()
    await expect(page.getByRole('combobox', { name: 'Auto Charge Timing' })).toContainText(
      'Charge before order starts',
    )
    await expect(page.getByRole('switch', { name: /Max Return Percentage/ })).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Transaction History', exact: true })).toBeVisible()
  })

  test('uses the live Create Order defaults, validates quantity, and creates an order', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /Create order/ }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Create Order', exact: true })).toBeVisible()
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveAttribute('placeholder', 'Required')
    await expect(dialog.getByRole('combobox', { name: 'Lead Type' })).toContainText('Any Lead Type')
    await expect(dialog.getByRole('combobox', { name: 'Initial Status' })).toContainText('Open')
    await expect(dialog.getByLabel('Start Date', { exact: true })).toHaveValue('')
    await expect(dialog.getByLabel('Start Date', { exact: true })).toHaveAttribute(
      'placeholder',
      'M/D/YYYY',
    )
    await expect(dialog.getByLabel('Start Date', { exact: true })).toHaveAttribute('type', 'text')
    await expect(dialog.getByRole('button', { name: 'Choose Start Date', exact: true })).toBeVisible()
    await expect(dialog.getByLabel('Quantity')).toHaveValue('0')
    await expect(dialog.getByLabel('Per Lead Price')).toHaveAttribute(
      'placeholder',
      'Use Price on Delivery Account',
    )
    await expect(dialog.getByLabel('Payment Discount')).toHaveValue('$0.00')
    await expect(dialog.getByRole('button', { name: 'Close', exact: true }).last()).toBeVisible()
    const footerBox = await dialog.getByRole('button', { name: 'Create', exact: true }).boundingBox()
    expect((footerBox?.y ?? 901) + (footerBox?.height ?? 0)).toBeLessThanOrEqual(900)

    await dialog.getByLabel('Name', { exact: true }).fill('Summit Mortgage Leads Test')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(dialog.getByText('Quantity must be greater than zero.', { exact: true })).toBeVisible()

    await dialog.getByLabel('Quantity').fill('1')
    await dialog.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(page.getByText('Order', { exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'General Options', exact: true })).toBeVisible()
  })

  test('edits, adds, removes, and persists order items', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.getByRole('button', { name: /^Order/ }).click()
    await page.getByRole('button', { name: 'Items', exact: true }).click()

    await expect(page.getByText('No Items', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'New', exact: true }).click()
    let dialog = page.getByRole('dialog')
    await dialog.getByLabel('Quantity').fill('3')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.locator('[data-slot="data-grid-row"]')).toHaveCount(1)

    await page.getByText('All Delivery Accounts', { exact: true }).click()
    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    dialog = page.getByRole('dialog')
    await dialog.getByLabel('Quantity').fill('3')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'New', exact: true }).click()
    dialog = page.getByRole('dialog')
    await dialog.getByLabel('Quantity').fill('1')
    await dialog.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.locator('[data-slot="data-grid-row"]')).toHaveCount(2)

    await page.locator('[data-slot="data-grid-row"]').last().click()
    await page.getByRole('button', { name: 'Remove', exact: true }).click()
    dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Remove', exact: true }).click()
    await expect(page.locator('[data-slot="data-grid-row"]')).toHaveCount(1)

    await page.reload()
    await page.getByRole('button', { name: /^Order/ }).click()
    await page.getByRole('button', { name: 'Items', exact: true }).click()
    await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible()
  })
})

test.describe('theme, keyboard, and accessible controls', () => {
  test('supports dark mode on the client configuration route', async ({ page }) => {
    await page.goto(route)
    await page.evaluate(() => window.localStorage.setItem('theme', 'light'))
    await page.reload()

    await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('button', { name: 'Switch to light theme', exact: true })).toBeVisible()
  })

  test('activates launcher cards with the keyboard and exposes a dialog', async ({ page }) => {
    await page.goto(route)
    const createClient = page.getByRole('button', { name: /Create client and delivery account/ })
    await createClient.focus()
    await expect(createClient).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Next', exact: true })).toBeVisible()
  })

  test('names the main editor and automatic-save actions', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: /^Delivery Account/ }).click()
    await page.getByRole('button', { name: 'Criteria', exact: true }).click()
    await expect(page.getByRole('button', { name: 'New', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Remove', exact: true })).toBeDisabled()

    await page.getByRole('button', { name: 'Close', exact: true }).last().click()
    await page.getByRole('button', { name: /^Order/ }).click()
    await page.getByRole('button', { name: 'Items', exact: true }).click()
    await expect(page.getByRole('button', { name: 'New', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible()
  })
})
