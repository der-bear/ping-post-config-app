export const variants = [
  {
    id: 'light',
    colorScheme: 'light',
    async initialize(context) {
      await context.addInitScript(() => {
        localStorage.clear()
        localStorage.setItem('theme', 'light')
      })
    },
  },
  {
    id: 'dark',
    colorScheme: 'dark',
    async initialize(context) {
      await context.addInitScript(() => {
        localStorage.clear()
        localStorage.setItem('theme', 'dark')
      })
    },
  },
]

export const action = (id, kind, targetRole, stateDelta, extra = {}) => ({
  id,
  kind,
  targetRole,
  stateDelta: [stateDelta],
  holdMs: kind === 'save' ? 900 : kind === 'focus' ? 150 : kind === 'open' ? 260 : 360,
  ...extra,
})

export const navigationAction = (cameraShot, id, kind, targetRole, stateDelta, extra = {}) =>
  action(id, kind, targetRole, stateDelta, {
    cameraMode: 'navigation',
    cameraShot,
    ...extra,
  })

export const contentAction = (cameraShot, id, kind, targetRole, stateDelta, extra = {}) =>
  action(id, kind, targetRole, stateDelta, {
    cameraMode: 'content',
    cameraShot,
    ...extra,
  })

export const dialogAction = (cameraShot, id, kind, targetRole, stateDelta, extra = {}) =>
  action(id, kind, targetRole, stateDelta, {
    cameraMode: 'dialog',
    cameraShot,
    ...extra,
  })

export const fieldGroup = (page, label) => page.locator('[data-slot="field-group"]')
  .filter({ hasText: label })
  .last()

export const switchGroup = (page, label) => page.locator('[data-slot="switch-field"]')
  .filter({ hasText: label })
  .last()

export async function readyAtLauncher({ page }) {
  await page.getByRole('button', { name: /Client next steps/ }).waitFor()
}

export async function openClientNextStep(page, tabName, actionName) {
  await page.getByRole('button', { name: /Client next steps/ }).click()
  const nextSteps = page.getByRole('dialog')
  await nextSteps.getByText('Next steps', { exact: true }).waitFor()
  if (tabName) {
    await nextSteps.getByRole('tab', { name: tabName, exact: true }).click()
  }
  await nextSteps.getByRole('button', { name: actionName, exact: true }).click()
}
