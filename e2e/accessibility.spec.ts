import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for page to load and close any open dialog
    try {
      const cancelButton = page.getByRole('button', { name: 'Cancel' })
      await cancelButton.waitFor({ state: 'visible', timeout: 2000 })
      await cancelButton.click()
      await page.waitForTimeout(300)
    } catch {
      // No dialog open, continue
    }
  })

  test('should not have accessibility violations on home page', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should not have accessibility violations in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have good contrast in code editor (light mode)', async ({ page }) => {
    // Navigate to request body page where code editor is
    await page.click('text=PING Configuration')
    await page.click('text=Request Body')

    // Check color contrast in code editor
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have good contrast in code editor (dark mode)', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    // Navigate to request body page
    await page.click('text=PING Configuration')
    await page.click('text=Request Body')

    // Check color contrast in code editor
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have accessible forms and inputs', async ({ page }) => {
    // Click on Mappings
    await page.click('text=PING Configuration')
    await page.click('text=Mappings')

    // Open add mapping panel
    await page.click('button:has-text("Add Mapping")')

    // Check accessibility of form
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have accessible data grids', async ({ page }) => {
    // Navigate to notifications with data grid
    await page.click('text=Notifications')

    // Check accessibility of data grid
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('detailed accessibility report', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Log detailed results
    if (accessibilityScanResults.violations.length > 0) {
      console.log('\n========================================')
      console.log('ACCESSIBILITY VIOLATIONS FOUND:')
      console.log('========================================\n')

      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`)
        console.log(`   Impact: ${violation.impact}`)
        console.log(`   Help: ${violation.helpUrl}`)
        console.log(`   Affected elements: ${violation.nodes.length}`)
        violation.nodes.forEach((node) => {
          console.log(`   - ${node.html}`)
          console.log(`     ${node.failureSummary}`)
        })
        console.log('')
      })
    } else {
      console.log('\n✅ No accessibility violations found!')
    }

    // This test will pass even with violations but will log them
    // Change to expect(accessibilityScanResults.violations).toEqual([]) to fail on violations
  })
})
