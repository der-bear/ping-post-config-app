import { expect, test } from '@playwright/test'

const campaignRoute = '/ping-post-config-app/campaign-configuration'

test.describe('global theme control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(campaignRoute)
    await page.evaluate(() => localStorage.removeItem('theme'))
    await page.reload()
  })

  test('toggles and persists the resolved theme', async ({ page }) => {
    const toggle = page.locator('[data-slot="theme-toggle"]')
    await expect(toggle).toBeVisible()

    const box = await toggle.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)

    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark')

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()
  })

  test('switches themes without running CSS transitions', async ({ page }) => {
    const transitionCount = await page.evaluate(async () => {
      let count = 0
      const handleTransition = () => {
        count += 1
      }

      document.addEventListener('transitionrun', handleTransition, true)
      document.querySelector<HTMLButtonElement>('[data-slot="theme-toggle"]')?.click()
      await new Promise((resolve) => window.setTimeout(resolve, 150))
      document.removeEventListener('transitionrun', handleTransition, true)

      return count
    })

    expect(transitionCount).toBe(0)
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('stays below modal surfaces', async ({ page }) => {
    const toggle = page.locator('[data-slot="theme-toggle"]')
    await page.getByRole('button', { name: /Create lead source and campaign/ }).click()

    const [toggleZIndex, dialogZIndex] = await Promise.all([
      toggle.evaluate((element) => Number(getComputedStyle(element).zIndex)),
      page.getByRole('dialog').evaluate((element) => Number(getComputedStyle(element).zIndex)),
    ])

    expect(toggleZIndex).toBeLessThan(dialogZIndex)
  })

  test('uses dark surfaces in shared switches and success toasts', async ({ page }) => {
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await page.getByRole('button', { name: /Ping\/Post campaign/ }).click()

    const switchBackground = await page.getByRole('switch').first().evaluate((element) => (
      getComputedStyle(element).backgroundColor
    ))
    const pageBackground = await page.locator('body').evaluate((element) => (
      getComputedStyle(element).backgroundColor
    ))
    expect(switchBackground).toBe(pageBackground)

    await page.getByRole('button', { name: 'General', exact: true }).click()
    await page.getByPlaceholder('Example: Mortgage Web Form').fill('Dark theme campaign')
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    const toastTitle = page.getByText('Changes saved successfully', { exact: true })
    await expect(toastTitle).toBeVisible()
    const toastBackground = await toastTitle.locator('xpath=../..').evaluate((element) => (
      getComputedStyle(element).backgroundColor
    ))
    expect(toastBackground).not.toBe('rgb(215, 243, 227)')
  })
})
