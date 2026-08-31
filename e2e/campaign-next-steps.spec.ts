import { expect, test, type Page } from '@playwright/test'

type NextStepsCase = {
  option: 'Web' | 'Ping Post' | 'Phone' | 'Chat'
  channelSlug: 'web' | 'ping-post' | 'phone' | 'chat'
  subtitle: string
  targetTitle: string
  nextStepHeading: string
  copy: string
  durationRange: readonly [minimum: number, maximum: number]
}

const CASES: NextStepsCase[] = [
  {
    option: 'Web',
    channelSlug: 'web',
    subtitle: 'Campaign - Web',
    targetTitle: 'General Settings',
    nextStepHeading: 'Review General Settings',
    copy: 'Continue to the Campaign Settings screen to review your configuration and customize any additional campaign options.',
    durationRange: [10, 11.5],
  },
  {
    option: 'Ping Post',
    channelSlug: 'ping-post',
    subtitle: 'Campaign - PING/POST',
    targetTitle: 'PING Options',
    nextStepHeading: 'Configure PING Options',
    copy: "Next, open the PING Options tab to configure your ping requirements. Before your campaign can accept ping requests, you'll need to define the PING Field Requirements by selecting the lead fields to be included in the ping requests from your lead source. You can also configure optional revenue, profit, and delivery requirements as needed.",
    durationRange: [17, 19],
  },
  {
    option: 'Phone',
    channelSlug: 'phone',
    subtitle: 'Campaign - Phone',
    targetTitle: 'Phone Numbers',
    nextStepHeading: 'Add a Phone Number',
    copy: 'Next, open the Phone Numbers tab to add a phone number for this campaign. Select an existing IVR number or purchase a new one, then assign a call flow to complete your phone campaign configuration.',
    durationRange: [17, 19],
  },
  {
    option: 'Chat',
    channelSlug: 'chat',
    subtitle: 'Campaign - Chat',
    targetTitle: 'Web Chats',
    nextStepHeading: 'Configure Web Chats',
    copy: 'Next, open the Web Chats tab to configure your chat settings. From there, you can customize your chat experience, including the welcome message, appearance, integrations, and other available options.',
    durationRange: [28, 30],
  },
]

function fieldGroup(page: Page, label: string) {
  return page
    .locator('[data-slot="field-group"]')
    .filter({ has: page.getByText(label, { exact: true }) })
    .first()
}

async function chooseOption(page: Page, fieldLabel: string, option: string) {
  const combobox = fieldGroup(page, fieldLabel).getByRole('combobox')
  await combobox.click()
  await page.getByRole('option', { name: option, exact: true }).click()
}

async function createLeadSourceCampaign(page: Page, config: NextStepsCase) {
  await page.goto('/ping-post-config-app/campaign-configuration')
  await page.getByRole('button', { name: /Create lead source and campaign/ }).click()
  await page.getByPlaceholder('Example: Acme Web Leads').fill(`${config.option} Lead Source`)
  await page.getByRole('button', { name: 'Next', exact: true }).click()

  await page.getByPlaceholder('Example: Mortgage Web Form').fill(`${config.option} Campaign`)
  await chooseOption(page, 'Lead Type', '40011 - Mortgage')
  await chooseOption(page, 'Channel', config.option)
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await page.getByRole('button', { name: 'Create and Open' }).click()
}

test.describe('lead-source channel next steps', () => {
  for (const config of CASES) {
    test(`${config.option} renders its channel handoff and configures the campaign`, async ({ page }) => {
      await page.setViewportSize({ width: 1012, height: 1391 })
      await createLeadSourceCampaign(page, config)

      const dialog = page.getByRole('dialog')
      const confirmationHeading = dialog.getByRole('heading', { name: 'Your lead source has been created!' })
      await expect(confirmationHeading).toBeVisible()
      expect(await confirmationHeading.evaluate((element) => getComputedStyle(element).fontSize)).toBe('28px')
      const successIcon = dialog.locator('[data-slot="lead-source-success-icon"]')
      await expect(successIcon).toHaveClass(/(?:^|\s)bg-primary-light(?:\s|$)/)
      await expect(successIcon).toHaveClass(/(?:^|\s)text-primary(?:\s|$)/)
      await expect(dialog.locator('[data-slot="panel-header"]')).toContainText('Lead Source Created')
      await expect(dialog.getByText(
        `Your lead source and initial campaign configuration for "${config.option} Campaign" have been created successfully.`,
        { exact: true },
      )).toBeVisible()
      await expect(dialog.getByText(config.copy, { exact: true })).toBeVisible()
      await expect(dialog.getByText('Next step', { exact: true })).toBeVisible()
      await expect(dialog.getByRole('heading', {
        name: config.nextStepHeading,
        exact: true,
      })).toBeVisible()

      const video = dialog.locator(`video[data-channel="${config.channelSlug}"]`)
      await expect(video).toBeVisible()
      await expect(video).toHaveAttribute(
        'poster',
        new RegExp(`campaign-preview-${config.channelSlug}-light\\.png\\?v=first-frame-20260825$`),
      )
      await expect(video.locator('source[type="video/webm"]')).toHaveAttribute(
        'src',
        new RegExp(`campaign-walkthrough-${config.channelSlug}-light\\.webm$`),
      )
      await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute(
        'src',
        new RegExp(`campaign-walkthrough-${config.channelSlug}-light\\.mp4$`),
      )
      expect(await video.evaluate((element: HTMLVideoElement) => ({
        autoplay: element.autoplay,
        muted: element.muted,
        loop: element.loop,
        playsInline: element.playsInline,
      }))).toEqual({ autoplay: true, muted: true, loop: true, playsInline: true })
      await expect.poll(
        () => video.evaluate((element: HTMLVideoElement) => element.readyState),
        { timeout: 8_000 },
      ).toBeGreaterThanOrEqual(1)
      expect(await video.evaluate((element: HTMLVideoElement) => ({
        width: element.videoWidth,
        height: element.videoHeight,
        duration: element.duration,
      }))).toEqual({
        width: 1920,
        height: 1080,
        duration: expect.any(Number),
      })
      expect(await video.evaluate((element: HTMLVideoElement) => element.duration)).toBeGreaterThanOrEqual(
        config.durationRange[0],
      )
      expect(await video.evaluate((element: HTMLVideoElement) => element.duration)).toBeLessThanOrEqual(
        config.durationRange[1],
      )

      const closeButton = dialog.getByRole('button', { name: 'Close', exact: true })
      const closeBox = await closeButton.boundingBox()
      expect(closeBox).not.toBeNull()
      expect(closeBox!.width).toBeGreaterThanOrEqual(44)
      expect(closeBox!.height).toBeGreaterThanOrEqual(44)
      expect(await page.evaluate(() => document.activeElement?.getAttribute('role'))).toBe('dialog')

      const confirmation = dialog.locator('[data-region="creation-confirmation"]')
      const nextStep = dialog.locator('[data-region="channel-next-step"]')
      const [confirmationBox, nextStepBox, videoBox] = await Promise.all([
        confirmation.boundingBox(),
        nextStep.boundingBox(),
        video.boundingBox(),
      ])
      expect(confirmationBox).not.toBeNull()
      expect(nextStepBox).not.toBeNull()
      expect(videoBox).not.toBeNull()
      expect(nextStepBox!.x).toBeGreaterThan(confirmationBox!.x)
      expect(confirmationBox!.width / nextStepBox!.width).toBeLessThan(0.55)
      expect(Math.abs(videoBox!.width / videoBox!.height - (16 / 9))).toBeLessThan(0.02)

      await expect(dialog.getByText(
        'You can always return to the Campaign Settings later to make updates or adjustments.',
        { exact: true },
      )).toBeVisible()

      await dialog.getByRole('button', { name: 'Configure Campaign', exact: true }).click()
      await expect(page.getByText(config.subtitle, { exact: true })).toBeVisible()
      await expect(page.getByRole('heading', { name: config.targetTitle, exact: true })).toBeVisible()
    })
  }

  test('uses a dark walkthrough when dark theme is selected', async ({ page }) => {
    await page.goto('/ping-post-config-app/campaign-configuration')
    await page.evaluate(() => localStorage.setItem('theme', 'dark'))
    await page.reload()
    await createLeadSourceCampaign(page, CASES[1])

    const video = page.getByRole('dialog').locator('video[data-channel="ping-post"]')
    await expect(video).toHaveAttribute(
      'poster',
      /campaign-preview-ping-post-dark\.png\?v=first-frame-20260825$/,
    )
    await expect(video.locator('source[type="video/webm"]')).toHaveAttribute(
      'src',
      /campaign-walkthrough-ping-post-dark\.webm$/,
    )
    await expect(video.locator('source[type="video/mp4"]')).toHaveAttribute(
      'src',
      /campaign-walkthrough-ping-post-dark\.mp4$/,
    )
  })

  test('keeps the walkthrough paused when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await createLeadSourceCampaign(page, CASES[0])

    const video = page.getByRole('dialog').locator('video[data-channel="web"]')
    expect(await video.evaluate((element: HTMLVideoElement) => ({
      autoplay: element.autoplay,
      paused: element.paused,
    }))).toEqual({ autoplay: false, paused: true })
  })

  test('continues playback after a completed loop and reopening another walkthrough', async ({ page }) => {
    await page.goto('/ping-post-config-app/campaign-configuration')
    await page.getByRole('button', { name: /^Web next steps/ }).click()

    const webVideo = page.getByRole('dialog').locator('video[data-channel="web"]')
    await expect.poll(
      () => webVideo.evaluate((element: HTMLVideoElement) => element.readyState),
      { timeout: 8_000 },
    ).toBeGreaterThanOrEqual(3)
    const duration = await webVideo.evaluate((element: HTMLVideoElement) => element.duration)
    await page.waitForTimeout((duration * 1000) + 1_000)
    expect(await webVideo.evaluate((element: HTMLVideoElement) => ({
      paused: element.paused,
      ended: element.ended,
      error: element.error?.code ?? null,
    }))).toEqual({ paused: false, ended: false, error: null })

    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await page.getByRole('button', { name: /^Chat next steps/ }).click()

    const chatVideo = page.getByRole('dialog').locator('video[data-channel="chat"]')
    await expect.poll(
      () => chatVideo.evaluate((element: HTMLVideoElement) => element.currentTime),
      { timeout: 8_000 },
    ).toBeGreaterThan(0.5)
    expect(await chatVideo.evaluate((element: HTMLVideoElement) => ({
      paused: element.paused,
      error: element.error?.code ?? null,
    }))).toEqual({ paused: false, error: null })
  })
})
