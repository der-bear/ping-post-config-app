# Client Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a persistent, video-ready outbound Client Configuration prototype with client creation, Next Steps, complete Delivery Account panels, Criteria CRUD, Order creation, and Item CRUD.

**Architecture:** Add an isolated `client-configuration` feature with a dedicated persisted Zustand store and a small entry-state router. Reuse the existing launcher cards, wizard, panel layout, data grid, dialog, form, toast, and unsaved-change components without coupling the new state to the campaign store.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Zustand 5 persist middleware, Tailwind CSS 4, Radix/shadcn UI primitives, Lucide React, Playwright 1.58.

**Spec:** `docs/superpowers/specs/2026-08-24-client-configuration-design.md`

## Global Constraints

- Route must be `/ping-post-config-app/client-configuration` under the existing Vite base.
- Match `/campaign-configuration` launcher, panel, dialog, spacing, typography, light theme, dark theme, and responsive behavior.
- Reuse shared components; do not copy shared UI primitives into the feature.
- Keep client state separate from `useCampaignStore` and `useDeliveryMethodStore`.
- Persist state with the versioned key `client-configuration-v1`.
- Include all Delivery Account tabs: General, Quantity Limits, Delivery, Revenue, Criteria, Offer, Advanced.
- Order includes General and Items; do not implement the global Payments page.
- Criteria and Item mutations save immediately; other editor fields use Save and unsaved-change handling.
- Use realistic safe defaults: client status New, automated delivery off, order On Hold, price $0.00.
- Preserve unrelated working-tree changes and stage only files named by each task.
- Follow red-green-refactor: each production behavior starts with a Playwright test that is observed failing for the expected reason.

---

### Task 1: Route, domain model, persisted store, and launcher

**Files:**
- Create: `src/features/client-configuration/types.ts`
- Create: `src/features/client-configuration/data/demo-data.ts`
- Create: `src/features/client-configuration/store.ts`
- Create: `src/features/client-configuration/components/client-configuration-entry.tsx`
- Modify: `src/config/routes.ts`
- Modify: `src/App.tsx`
- Create: `e2e/client-configuration.spec.ts`

**Interfaces:**
- Produces `ClientConfigurationEntry(): JSX.Element` for `App.tsx`.
- Produces `useClientConfigurationStore` with `config`, `resetDemo`, `replaceFromWizard`, panel navigation, and CRUD actions used by later tasks.
- Produces `ClientConfiguration`, `ClientWizardSubmission`, `DeliveryAccountSection`, `OrderSection`, `CriteriaRule`, and `OrderItem` types.

- [ ] **Step 1: Write the failing launcher test**

Add the first test block to `e2e/client-configuration.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const route = '/ping-post-config-app/client-configuration'

test.describe('client configuration launcher', () => {
  test('shows outbound creation, editor, and next-step cards', async ({ page }) => {
    await page.goto(route)

    await expect(page.getByText('Creation flows', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Create client and delivery account/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Create order/ })).toBeVisible()
    await expect(page.getByText('Edit outbound settings', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Delivery Account/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Order/ })).toBeVisible()
    await expect(page.getByText('Preview next-step dialogs', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Client next steps/ })).toBeVisible()
  })
})
```

- [ ] **Step 2: Run the launcher test and verify RED**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "shows outbound creation"`

Expected: FAIL because `/client-configuration` resolves to the current default feature and no outbound launcher card exists.

- [ ] **Step 3: Define the domain and store contracts**

In `types.ts`, define these stable unions and records:

```ts
export type ClientStatus = 'new' | 'pending' | 'working' | 'waiting' | 'inactive' | 'active'
export type DeliveryType = 'http-webhook' | 'clickpoint' | 'ftp' | 'email' | 'csv' | 'lead-portal' | 'ping-post' | 'batch-email' | 'sms'
export type DeliveryAccountSection = 'general' | 'quantity-limits' | 'delivery' | 'revenue' | 'criteria' | 'offer' | 'advanced'
export type OrderSection = 'general' | 'items'

export interface CriteriaRule {
  id: string
  type: 'Field Value' | 'Client Field' | 'Regular Expression' | 'Calculated Expression'
  field: string
  operator: string
  value: string
}

export interface OrderItem {
  id: string
  deliveryAccount: string
  orderType: 'Lead Quantity' | 'Reserved Dollar Bank'
  quantity: number
  perLeadPrice: number
  sent: number
}
```

Define `ClientConfiguration` with `client`, `deliveryMethod`, `deliveryAccount`, and `order` objects matching the spec. Define `ClientWizardSubmission` as the enabled wizard fields plus `deliveryAccountName`, `criteriaRequired`, `exclusive`, and `requireOrder`.

In `demo-data.ts`, export `createDemoClientConfiguration(): ClientConfiguration` returning the safe named client, one Delivery Account, one On Hold order, one Item with quantity 2, and an empty Criteria array.

In `store.ts`, use `persist`:

```ts
export const useClientConfigurationStore = create<ClientConfigurationStore>()(
  persist(
    (set) => ({
      config: createDemoClientConfiguration(),
      activeDeliveryAccountSection: 'general',
      activeOrderSection: 'general',
      isPanelExpanded: false,
      resetDemo: () => set({ config: createDemoClientConfiguration() }),
      replaceFromWizard: (submission) => set({ config: configurationFromWizard(submission) }),
      setActiveDeliveryAccountSection: (section) => set({ activeDeliveryAccountSection: section }),
      setActiveOrderSection: (section) => set({ activeOrderSection: section }),
      togglePanelExpanded: () => set((state) => ({ isPanelExpanded: !state.isPanelExpanded })),
      // Exact CRUD actions are added in Tasks 4 and 5.
    }),
    { name: 'client-configuration-v1', version: 1 },
  ),
)
```

- [ ] **Step 4: Add the route and launcher**

Add the feature to `FEATURES` in `src/config/routes.ts`:

```ts
{
  id: 'client-configuration',
  slug: 'client-configuration',
  title: 'Client Configuration',
  description: 'Open the outbound client, delivery account, and order prototype.',
}
```

Render `ClientConfigurationEntry` in `App.tsx` when `activeRoute === 'client-configuration'`.

Implement `ClientConfigurationEntry` with `activeView` state and the three approved `CenteredListGroup` sections. For Task 1, card actions may set semantic view names and render a simple accessible heading for the selected destination; Tasks 2–5 replace those destination bodies.

- [ ] **Step 5: Run the launcher test and verify GREEN**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "shows outbound creation"`

Expected: PASS.

- [ ] **Step 6: Run type and lint checks**

Run: `npm run build`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with no new warnings.

- [ ] **Step 7: Commit Task 1**

```bash
git add e2e/client-configuration.spec.ts src/App.tsx src/config/routes.ts src/features/client-configuration/types.ts src/features/client-configuration/data/demo-data.ts src/features/client-configuration/store.ts src/features/client-configuration/components/client-configuration-entry.tsx
git commit -m "feat: add client configuration launcher"
```

---

### Task 2: Create Client wizard and conditional Portal Login

**Files:**
- Create: `src/features/client-configuration/components/create-client-wizard.tsx`
- Modify: `src/features/client-configuration/components/client-configuration-entry.tsx`
- Modify: `e2e/client-configuration.spec.ts`

**Interfaces:**
- Consumes `ClientWizardSubmission` and `useClientConfigurationStore.replaceFromWizard` from Task 1.
- Produces `CreateClientWizard({ open, onClose, onCreate })`.
- Produces the transition from wizard completion to `next-steps`.

- [ ] **Step 1: Write failing wizard tests**

Add tests asserting:

```ts
test('validates contact fields and conditionally shows portal login', async ({ page }) => {
  await page.goto(route)
  await page.getByRole('button', { name: /Create client and delivery account/ }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Contact Information', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(dialog.getByText('Company Name is required.', { exact: true })).toBeVisible()

  await dialog.getByLabel('Company Name').fill('Summit Home Buyers')
  await dialog.getByLabel('First Name').fill('Maya')
  await dialog.getByLabel('Last Name').fill('Chen')
  await dialog.getByLabel('Email').fill('maya.chen@example.com')
  await dialog.getByRole('button', { name: 'Next', exact: true }).click()

  await expect(dialog.getByText('Delivery Method', { exact: true })).toBeVisible()
  await expect(dialog.getByRole('combobox', { name: 'Type of Delivery' })).toContainText('HTTP Webhook')
  await dialog.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(dialog.getByText('Delivery Account', { exact: true })).toBeVisible()

  await dialog.getByRole('button', { name: 'Previous', exact: true }).click()
  await dialog.getByRole('combobox', { name: 'Type of Delivery' }).click()
  await page.getByRole('option', { name: 'Lead Portal', exact: true }).click()
  await dialog.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(dialog.getByText('Portal Login Information', { exact: true })).toBeVisible()
})
```

Add a second test that fills all steps, clicks Create, and expects `Your client has been created!`.

- [ ] **Step 2: Run the wizard tests and verify RED**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "validates contact|creates a client"`

Expected: FAIL because the launcher destination has no wizard.

- [ ] **Step 3: Implement the WizardDialog composition**

Implement controlled wizard-local state for contact, delivery method, optional portal login, and Delivery Account fields. Use:

```ts
const steps: WizardStep[] = [
  contactStep,
  deliveryMethodStep,
  { ...portalLoginStep, disabled: deliveryType !== 'lead-portal' },
  deliveryAccountStep,
]
```

Use shared `FieldGroup`, `Input`, `Select`, `SwitchField`, `Separator`, and `WizardDialog`. Validation maps errors to `invalidStepIds`. `handleComplete` waits 600 ms with the saving overlay, calls `onCreate(submission)`, and leaves persistence to the store.

- [ ] **Step 4: Wire wizard completion**

In `ClientConfigurationEntry`, the create card sets `activeView` to `create-client`. `onCreate` calls `replaceFromWizard`, stores the created name for the dialog copy, and sets `activeView` to `next-steps`.

- [ ] **Step 5: Run wizard tests and verify GREEN**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "validates contact|creates a client"`

Expected: PASS.

- [ ] **Step 6: Run build and commit Task 2**

Run: `npm run build`

Expected: PASS.

```bash
git add e2e/client-configuration.spec.ts src/features/client-configuration/components/create-client-wizard.tsx src/features/client-configuration/components/client-configuration-entry.tsx
git commit -m "feat: add client creation wizard"
```

---

### Task 3: Client Next Steps and complete Delivery Account panels

**Files:**
- Create: `src/features/client-configuration/components/client-next-steps-dialog.tsx`
- Create: `src/features/client-configuration/components/delivery-account/delivery-account-editor.tsx`
- Create: `src/features/client-configuration/components/delivery-account/general-panel.tsx`
- Create: `src/features/client-configuration/components/delivery-account/quantity-limits-panel.tsx`
- Create: `src/features/client-configuration/components/delivery-account/delivery-panel.tsx`
- Create: `src/features/client-configuration/components/delivery-account/revenue-panel.tsx`
- Create: `src/features/client-configuration/components/delivery-account/offer-panel.tsx`
- Create: `src/features/client-configuration/components/delivery-account/advanced-panel.tsx`
- Modify: `src/features/client-configuration/store.ts`
- Modify: `src/features/client-configuration/components/client-configuration-entry.tsx`
- Modify: `e2e/client-configuration.spec.ts`

**Interfaces:**
- Produces `ClientNextStepsDialog` with callbacks `onCreateOrder`, `onOpenCriteria`, `onEditDeliveryAccount`, and `onClose`.
- Produces `DeliveryAccountEditor({ initialSection, onClose })`.
- Adds `updateDeliveryAccount(partial)` and focused update actions for limits, delivery, revenue, offer, and advanced settings.

- [ ] **Step 1: Write failing navigation and tab tests**

Add one test that opens the preview Next Steps card and asserts the three actions. Click Set Up Delivery Criteria and assert the Delivery Account editor title plus Criteria heading.

Add one test that opens the direct Delivery Account card and checks exact visible tabs:

```ts
for (const tab of ['General', 'Quantity Limits', 'Delivery', 'Revenue', 'Criteria', 'Offer', 'Advanced']) {
  await expect(page.getByRole('button', { name: tab, exact: true })).toBeVisible()
}
```

Click every tab and assert its exact panel heading.

- [ ] **Step 2: Run Task 3 tests and verify RED**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "next steps|Delivery Account tabs"`

Expected: FAIL because the dialog and editor do not exist.

- [ ] **Step 3: Implement Next Steps**

Build the existing two-column success-dialog composition using `DialogPanelHeader`, success/help icons, and three stacked interactive action cards. Use the created Delivery Account name in the confirmation copy.

- [ ] **Step 4: Implement all Delivery Account tabs**

Build `DeliveryAccountEditor` with `PanelLayout`, seven `NavItem` controls, the existing expand/close controls, Save/Close footer, saving overlay, toast, and unsaved-change dialog. Each panel consumes focused store fields and updates a local editable draft; Save writes the draft through store actions.

Use existing primitives for every field. Match the spec's labels and safe values. The Criteria tab renders the Criteria component from Task 4; until then, render the empty DataGrid shell with `No Criteria`.

- [ ] **Step 5: Run Task 3 tests and verify GREEN**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "next steps|Delivery Account tabs"`

Expected: PASS.

- [ ] **Step 6: Run build and commit Task 3**

Run: `npm run build`

Expected: PASS.

```bash
git add e2e/client-configuration.spec.ts src/features/client-configuration/components/client-next-steps-dialog.tsx src/features/client-configuration/components/client-configuration-entry.tsx src/features/client-configuration/components/delivery-account src/features/client-configuration/store.ts
git commit -m "feat: add delivery account configuration panels"
```

---

### Task 4: Criteria add, edit, remove, and persistence

**Files:**
- Create: `src/features/client-configuration/components/delivery-account/criteria-panel.tsx`
- Create: `src/features/client-configuration/components/delivery-account/criterion-dialog.tsx`
- Modify: `src/features/client-configuration/components/delivery-account/delivery-account-editor.tsx`
- Modify: `src/features/client-configuration/store.ts`
- Modify: `e2e/client-configuration.spec.ts`

**Interfaces:**
- Adds `addCriterion(rule)`, `updateCriterion(id, partial)`, and `removeCriteria(ids)` to the store.
- Produces `CriterionDialog({ open, initialValue, onSave, onClose })`.
- Produces `CriteriaPanel()` with automatic persistence.

- [ ] **Step 1: Write failing Criteria CRUD test**

Create a test that resets localStorage, opens Delivery Account → Criteria, confirms `No Criteria`, clicks New, saves `Field Value / State / Is Any Of / AZ`, edits the value to `CA`, removes the row, and asserts the empty state again.

Add a persistence test that creates `AZ`, reloads the page, opens the direct Delivery Account card and Criteria tab, and asserts the saved row.

- [ ] **Step 2: Run Criteria tests and verify RED**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "Criteria"`

Expected: FAIL because New, Edit, and Remove are not functional.

- [ ] **Step 3: Implement store actions**

Implement immutable actions:

```ts
addCriterion: (rule) => set((state) => ({
  config: {
    ...state.config,
    deliveryAccount: {
      ...state.config.deliveryAccount,
      criteria: [...state.config.deliveryAccount.criteria, rule],
    },
  },
})),
```

Implement update by ID and removal by `Set<string>` converted to an array at the component boundary.

- [ ] **Step 4: Implement Criterion dialog and grid**

Use `Dialog`, `FieldGroup`, `Select`, `Input`, `DataGrid`, and toolbar actions. Default the New dialog to `Field Value`, `State`, `Is Any Of`, `AZ`. Keep Edit and Remove disabled according to selection count. Confirm removal with `ConfirmDialog`. Clear row selection after removal.

- [ ] **Step 5: Run Criteria tests and verify GREEN**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "Criteria"`

Expected: PASS, including reload persistence.

- [ ] **Step 6: Run build and commit Task 4**

Run: `npm run build`

Expected: PASS.

```bash
git add e2e/client-configuration.spec.ts src/features/client-configuration/components/delivery-account/criteria-panel.tsx src/features/client-configuration/components/delivery-account/criterion-dialog.tsx src/features/client-configuration/components/delivery-account/delivery-account-editor.tsx src/features/client-configuration/store.ts
git commit -m "feat: add delivery criteria workflow"
```

---

### Task 5: Create Order, Order panels, and Item CRUD

**Files:**
- Create: `src/features/client-configuration/components/order/create-order-dialog.tsx`
- Create: `src/features/client-configuration/components/order/order-editor.tsx`
- Create: `src/features/client-configuration/components/order/order-general-panel.tsx`
- Create: `src/features/client-configuration/components/order/order-items-panel.tsx`
- Create: `src/features/client-configuration/components/order/order-item-dialog.tsx`
- Modify: `src/features/client-configuration/store.ts`
- Modify: `src/features/client-configuration/components/client-configuration-entry.tsx`
- Modify: `src/features/client-configuration/components/client-next-steps-dialog.tsx`
- Modify: `e2e/client-configuration.spec.ts`

**Interfaces:**
- Produces `CreateOrderDialog({ open, onClose, onCreate })`.
- Produces `OrderEditor({ initialSection, onClose })`.
- Adds `replaceOrder`, `updateOrder`, `addOrderItem`, `updateOrderItem`, and `removeOrderItems` store actions.

- [ ] **Step 1: Write failing Create Order and Item tests**

Add a test that opens Create Order, confirms quantity validation rejects zero, fills `Codex Demo Mortgage Order`, uses `Short Mortgage Lead`, status `On Hold`, quantity `1`, creates it, and asserts the Order editor opens on General.

Add a test that opens the direct Order card, clicks Items, edits `All Delivery Accounts` quantity from 2 to 3, and asserts totals update to 3. Add New and Remove assertions. Reload and assert the quantity remains 3.

- [ ] **Step 2: Run Order tests and verify RED**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "Create Order|Items"`

Expected: FAIL because the Order flow does not exist.

- [ ] **Step 3: Implement Order store actions**

`replaceOrder` writes general settings plus an initial Item. Item total is derived as `quantity * perLeadPrice`; do not persist a second editable total value. Update and removal actions use immutable array transforms.

- [ ] **Step 4: Implement Create Order dialog**

Use existing Dialog and form primitives with the exact fields from the spec. Validate Name and Quantity. Default status to On Hold, renew off, current Delivery Account, Lead Quantity, and inherited $0.00 price. Create opens Order General.

- [ ] **Step 5: Implement Order editor and Items**

Build a `PanelLayout` with General and Items `NavItem` controls. General uses Save and unsaved-change behavior. Items uses `DataGrid`, New/Edit/Remove actions, `OrderItemDialog`, immediate persistence, and calculated totals. Do not add a Payments tab.

- [ ] **Step 6: Run Order tests and verify GREEN**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "Create Order|Items"`

Expected: PASS, including reload persistence.

- [ ] **Step 7: Run build and commit Task 5**

Run: `npm run build`

Expected: PASS.

```bash
git add e2e/client-configuration.spec.ts src/features/client-configuration/components/client-configuration-entry.tsx src/features/client-configuration/components/client-next-steps-dialog.tsx src/features/client-configuration/components/order src/features/client-configuration/store.ts
git commit -m "feat: add order and item configuration"
```

---

### Task 6: Regression, accessibility, screenshots, and design QA

**Files:**
- Modify: `e2e/client-configuration.spec.ts`
- Modify: `design-qa.md`
- Create: `design-qa-assets/client-configuration/launcher.png`
- Create: `design-qa-assets/client-configuration/create-client.png`
- Create: `design-qa-assets/client-configuration/next-steps.png`
- Create: `design-qa-assets/client-configuration/delivery-account-criteria.png`
- Create: `design-qa-assets/client-configuration/order-items.png`

**Interfaces:**
- Produces a verified prototype route and a `design-qa.md` ending in `final result: passed`.

- [ ] **Step 1: Add failing theme and keyboard coverage**

Extend `e2e/client-configuration.spec.ts` to assert the route renders in dark mode, launcher cards can be focused and activated with Enter, dialogs expose a dialog role, and every panel action is reachable by role and accessible name.

- [ ] **Step 2: Run the new checks and verify RED if behavior is missing**

Run: `npx playwright test e2e/client-configuration.spec.ts --grep "theme|keyboard|accessible"`

Expected: any missing accessibility behavior fails with a specific role, focus, or contrast-state assertion.

- [ ] **Step 3: Make the minimum accessibility corrections**

Correct labels, roles, keyboard handlers, and focus behavior only where the failing tests identify a gap. Reuse existing component APIs rather than adding feature-specific CSS.

- [ ] **Step 4: Run targeted and full automated verification**

Run: `npx playwright test e2e/client-configuration.spec.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with no new warnings.

Run: `npx playwright test`

Expected: PASS; existing campaign and delivery-method flows remain unchanged.

- [ ] **Step 5: Capture the required prototype states**

Use the in-app browser on `/ping-post-config-app/client-configuration` and capture the five named reference states at the same desktop viewport used for the campaign prototype. Keep the local preview running.

- [ ] **Step 6: Run visual comparison and write design QA**

Compare each implementation capture side-by-side with the corresponding campaign layout and LeadExec screenshot. Record discrepancies in `design-qa.md`, fix every P0/P1/P2, recapture, and repeat until the final line is:

```md
final result: passed
```

- [ ] **Step 7: Commit Task 6**

```bash
git add e2e/client-configuration.spec.ts design-qa.md design-qa-assets/client-configuration
git commit -m "test: verify client configuration prototype"
```

## Plan self-review

- Spec coverage: launcher, wizard, conditional portal step, Next Steps, all Delivery Account tabs, Criteria CRUD, Create Order, General/Items, Item CRUD, persistence, validation, accessibility, and visual verification are assigned to Tasks 1–6.
- Scope: one route and one feature; no backend, production payments, or full Client Detail reconstruction.
- Type consistency: `ClientWizardSubmission`, `DeliveryAccountSection`, `OrderSection`, `CriteriaRule`, and `OrderItem` are defined in Task 1 and consumed with the same names in later tasks.
- Persistence consistency: only the dedicated store owns the `client-configuration-v1` key; wizard-local state is not persisted until Create succeeds.
