# Channel-Specific Campaign Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement channel-specific campaign navigation, PING Options, Phone Numbers, Web Chats, and a static channel-aware lead-source completion window with screenshot-level fidelity.

**Architecture:** Keep one campaign editor and drive its subtitle, navigation, allowed sections, and completion target from a pure `ChannelProfile`. Add three isolated feature panels and two visual-only dialogs. Store only PING draft settings and empty grid collections in Zustand; keep non-persisting modal fields local.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5, Tailwind CSS 4, Radix UI, Lucide React, Playwright.

## Global Constraints

- Use the screenshots as the visual source of truth and the approved design spec for behavior.
- No GIF, MP4, autoplay, loop, or animated preview media.
- All channels use `Posting Instructions | Close | Save` in the editor footer.
- Phone and Web Chat modal Save actions close without adding rows.
- Web: full Quality Options and Agent Forms, no special channel tab.
- Ping Post: PING Options, full Quality Options, no Agent Forms.
- Phone: Phone Numbers, Compliance only, no Agent Forms.
- Chat: Web Chats, Compliance only, no Agent Forms.
- Preserve unrelated user changes and avoid unrelated refactoring.
- Every production behavior starts with a failing Playwright test.

---

## File Structure

- Create `src/features/campaign/channel-profile.ts`: pure channel-to-navigation/title/target mapping.
- Create `src/features/campaign/components/ping-options.tsx`: PING requirements and field grid.
- Create `src/features/campaign/components/phone-numbers.tsx`: empty phone grid and modal trigger.
- Create `src/features/campaign/components/ivr-number-dialog.tsx`: visual IVR form.
- Create `src/features/campaign/components/web-chats.tsx`: empty chat grid and modal trigger.
- Create `src/features/campaign/components/web-chat-dialog.tsx`: visual Web Chat form.
- Create `e2e/campaign-channel-editor.spec.ts`: channel matrix and new-panel coverage.
- Create `e2e/campaign-next-steps.spec.ts`: completion-window and `Next` routing coverage.
- Create `public/assets/campaign-preview-{web,ping-post,phone,chat}.png`: static editor captures.
- Create `public/assets/web-chat-agent.png`: local avatar asset.
- Modify `src/features/campaign/types.ts`: new sections and state types.
- Modify `src/features/campaign/store.ts`: default state and PING update actions.
- Modify `src/features/campaign/components/index.tsx`: profile-driven navigation and content.
- Modify `src/features/campaign/components/campaign-entry.tsx`: preserve completion channel and route `Next`.
- Modify `src/features/campaign/components/lead-source-next-steps-dialog.tsx`: new static success window.
- Modify `src/components/data-grid/data-grid.tsx` only if exact vertical empty-state centering cannot be achieved through existing props.

---

### Task 1: Channel Profile and Navigation Matrix

**Files:**
- Create: `src/features/campaign/channel-profile.ts`
- Modify: `src/features/campaign/types.ts`
- Modify: `src/features/campaign/components/index.tsx`
- Create: `e2e/campaign-channel-editor.spec.ts`

**Interfaces:**
- Produces: `getCampaignChannelProfile(channel: Channel): CampaignChannelProfile`.
- Produces sections: `'ping-options' | 'phone-numbers' | 'web-chats'`.
- Consumes: existing `CampaignEditor`, `Channel`, `CampaignSection`, `NavItem`, and `NavGroup`.

- [ ] **Step 1: Write failing channel-matrix tests**

Add Playwright cases that create/open each channel and assert exact subtitle, navigation order, Quality Options children, Agent Forms visibility, and common footer. The central assertions are:

```ts
const expected = {
  web: {
    subtitle: 'Campaign - Web',
    special: null,
    quality: ['Duplicate Checks', 'Criteria', 'Quantity Limits', 'Lead Validation', 'Compliance'],
    agentForms: true,
  },
  'ping-post': {
    subtitle: 'Campaign - PING/POST',
    special: 'PING Options',
    quality: ['Duplicate Checks', 'Criteria', 'Quantity Limits', 'Lead Validation', 'Compliance'],
    agentForms: false,
  },
  phone: {
    subtitle: 'Campaign - Phone',
    special: 'Phone Numbers',
    quality: ['Compliance'],
    agentForms: false,
  },
  chat: {
    subtitle: 'Campaign - Chat',
    special: 'Web Chats',
    quality: ['Compliance'],
    agentForms: false,
  },
} as const
```

For every channel assert `Posting Instructions`, `Close`, and `Save` are visible.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
npx playwright test e2e/campaign-channel-editor.spec.ts --project=chromium
```

Expected: Ping Post, Phone, and Chat fail because the editor always renders the Web subtitle and static Web navigation.

- [ ] **Step 3: Add section types and pure profile mapping**

Extend `CampaignSection` with the three channel panels. Create:

```ts
export interface CampaignChannelProfile {
  subtitle: string
  specialSection: { section: CampaignSection; label: string } | null
  qualitySections: CampaignSection[]
  showAgentForms: boolean
  completionTarget: CampaignSection
}

const CHANNEL_PROFILES: Record<Channel, CampaignChannelProfile> = {
  web: {
    subtitle: 'Campaign - Web',
    specialSection: null,
    qualitySections: ['duplicate-checks', 'criteria', 'quantity-limits', 'lead-validation', 'compliance'],
    showAgentForms: true,
    completionTarget: 'general',
  },
  'ping-post': {
    subtitle: 'Campaign - PING/POST',
    specialSection: { section: 'ping-options', label: 'PING Options' },
    qualitySections: ['duplicate-checks', 'criteria', 'quantity-limits', 'lead-validation', 'compliance'],
    showAgentForms: false,
    completionTarget: 'ping-options',
  },
  phone: {
    subtitle: 'Campaign - Phone',
    specialSection: { section: 'phone-numbers', label: 'Phone Numbers' },
    qualitySections: ['compliance'],
    showAgentForms: false,
    completionTarget: 'phone-numbers',
  },
  chat: {
    subtitle: 'Campaign - Chat',
    specialSection: { section: 'web-chats', label: 'Web Chats' },
    qualitySections: ['compliance'],
    showAgentForms: false,
    completionTarget: 'web-chats',
  },
}
```

- [ ] **Step 4: Make the editor consume the profile**

Filter `QC_TABS` by `profile.qualitySections`, insert `profile.specialSection` after Delivery Options, hide Agent Forms through `profile.showAgentForms`, use `profile.subtitle`, rename the group to `Quality Options`, and add titles for all new sections. If `activePanel.section` is not permitted by the current profile, set it to `general` in an effect.

- [ ] **Step 5: Run channel tests and verify GREEN**

Run the Task 1 Playwright file and confirm all matrix cases pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/features/campaign/channel-profile.ts src/features/campaign/types.ts src/features/campaign/components/index.tsx e2e/campaign-channel-editor.spec.ts
git commit -m "feat(campaign): add channel-specific editor navigation"
```

---

### Task 2: PING Options Panel

**Files:**
- Create: `src/features/campaign/components/ping-options.tsx`
- Modify: `src/features/campaign/types.ts`
- Modify: `src/features/campaign/store.ts`
- Modify: `src/features/campaign/components/index.tsx`
- Test: `e2e/campaign-channel-editor.spec.ts`

**Interfaces:**
- Produces: `PingOptions` component.
- Produces: `PingOptionsConfig` and `updatePingOptions(partial)`.
- Consumes: existing Switch, Input, DataGrid, and toolbar primitives.

- [ ] **Step 1: Add a failing PING panel test**

Open a Ping Post campaign, click `PING Options`, and assert all five requirement labels, `Field Requirements for PING`, `Add`, disabled `Remove`, and the `Field`/`Type` headers.

- [ ] **Step 2: Run the focused test and verify RED**

Expected: title appears after Task 1, but requirement content is absent.

- [ ] **Step 3: Add typed default state**

```ts
export interface PingRequirementValue {
  enabled: boolean
  value: string
}

export interface PingFieldRequirement {
  id: string
  field: string
  type: string
}

export interface PingOptionsConfig {
  revenue: PingRequirementValue
  profit: PingRequirementValue
  profitPercentage: PingRequirementValue
  minimumDeliveryCount: PingRequirementValue
  qualifyAllCriteria: boolean
  fieldRequirements: PingFieldRequirement[]
}
```

Use zero/`0.00%` defaults matching the reference and add `updatePingOptions` to the store.

- [ ] **Step 4: Implement the panel**

Render five separated rows in the reference order. Disable each value input visually when its requirement is off. Render the field grid edge-to-edge with Add/Remove toolbar and an empty state.

- [ ] **Step 5: Verify GREEN and commit**

Run the focused test, the full channel file, TypeScript, then commit:

```bash
git add src/features/campaign/components/ping-options.tsx src/features/campaign/types.ts src/features/campaign/store.ts src/features/campaign/components/index.tsx e2e/campaign-channel-editor.spec.ts
git commit -m "feat(campaign): add ping options panel"
```

---

### Task 3: Phone Numbers and IVR Visual Dialog

**Files:**
- Create: `src/features/campaign/components/phone-numbers.tsx`
- Create: `src/features/campaign/components/ivr-number-dialog.tsx`
- Modify: `src/features/campaign/types.ts`
- Modify: `src/features/campaign/store.ts`
- Modify: `src/features/campaign/components/index.tsx`
- Test: `e2e/campaign-channel-editor.spec.ts`

**Interfaces:**
- Produces: `PhoneNumbers` and `IvrNumberDialog`.
- Consumes: an always-empty `config.phoneNumbers` collection.

- [ ] **Step 1: Add failing Phone tests**

Assert the Phone Numbers toolbar, columns, `No IVR Numbers`, disabled non-Add actions, and opening/closing `IVR Number Details`. Assert Save closes the modal and the empty state remains.

- [ ] **Step 2: Verify RED**

Expected: Phone Numbers content and modal are absent.

- [ ] **Step 3: Implement empty grid and modal**

Build the exact fields and footer from the approved design. Use local modal state and provide fixed select options sufficient to render `(877) 624-3580`, call-flow, and message-flow placeholders. `Save`, `Cancel`, and `X` call `onClose` only.

- [ ] **Step 4: Verify GREEN and commit**

Run the Phone tests and commit the focused files.

---

### Task 4: Web Chats and Visual Web Chat Dialog

**Files:**
- Create: `src/features/campaign/components/web-chats.tsx`
- Create: `src/features/campaign/components/web-chat-dialog.tsx`
- Create: `public/assets/web-chat-agent.png`
- Modify: `src/features/campaign/types.ts`
- Modify: `src/features/campaign/store.ts`
- Modify: `src/features/campaign/components/index.tsx`
- Test: `e2e/campaign-channel-editor.spec.ts`

**Interfaces:**
- Produces: `WebChats` and `WebChatDialog`.
- Consumes: an always-empty `config.webChats` collection and local avatar asset.

- [ ] **Step 1: Add failing Chat tests**

Assert toolbar, columns, `No Web Chats`, automatic-save note, visual modal tabs, Properties fields/toggles, and that Save leaves the grid empty.

- [ ] **Step 2: Verify RED**

Expected: Web Chats content and dialog are absent.

- [ ] **Step 3: Create the local raster avatar**

Generate or select one local 1:1 headshot matching the approved description and inspect it before use. Save it as `public/assets/web-chat-agent.png`.

- [ ] **Step 4: Implement the grid and modal**

Use local form and selected-tab state. Properties contains every referenced field. Other tabs change active styling and display no invented configuration. Save/Cancel/X close only.

- [ ] **Step 5: Verify GREEN and commit**

Run Chat tests, accessibility tests for the dialog, and commit.

---

### Task 5: Static Channel Completion Window

**Files:**
- Create: `e2e/campaign-next-steps.spec.ts`
- Modify: `src/features/campaign/components/lead-source-next-steps-dialog.tsx`
- Modify: `src/features/campaign/components/campaign-entry.tsx`
- Create: `public/assets/campaign-preview-web.png`
- Create: `public/assets/campaign-preview-ping-post.png`
- Create: `public/assets/campaign-preview-phone.png`
- Create: `public/assets/campaign-preview-chat.png`

**Interfaces:**
- `LeadSourceNextStepsDialog` consumes `campaignName`, `channel`, `onClose`, and `onNext`.
- `onNext` sets the profile completion target and opens the editor.

- [ ] **Step 1: Write failing completion-window tests**

For each channel complete the lead-source wizard, then assert:

```ts
await expect(dialog.getByRole('heading', { name: 'Your lead source has been created!' })).toBeVisible()
await expect(dialog.locator('video')).toHaveCount(0)
await expect(dialog.getByRole('img')).toBeVisible()
await expect(dialog.getByRole('button', { name: 'Next' })).toBeVisible()
```

Assert channel-specific copy. Click Next and assert the target panel title.

- [ ] **Step 2: Verify RED**

Expected: current `Next Steps` window renders two videos, Close instead of Next, and does not route to a target panel.

- [ ] **Step 3: Implement data flow and static window**

Pass channel through `CampaignEntry`. Replace the two-card layout with the approved success layout and a channel copy map. `X` returns to launcher. `Next` calls `setActivePanel({ section: profile.completionTarget })` and opens the editor.

- [ ] **Step 4: Capture local static previews**

Open each implemented channel editor at its target panel at one consistent viewport. Capture the panel element to its corresponding PNG. Re-run completion tests after assets exist.

- [ ] **Step 5: Verify GREEN and commit**

Run both new campaign spec files and commit the completion flow plus PNG assets.

---

### Task 6: Visual QA and Full Verification

**Files:**
- Create: `design-qa.md`
- Modify: only files required to correct P0/P1/P2 findings.

**Interfaces:**
- Consumes the supplied reference screenshots and local captures at matching states.
- Produces a `design-qa.md` whose final line is `final result: passed`.

- [ ] **Step 1: Run complete automated verification**

```bash
npx tsc -b --pretty false
npx playwright test e2e/campaign-channel-editor.spec.ts e2e/campaign-next-steps.spec.ts e2e/campaign-creation-copy.spec.ts --project=chromium
npm run lint
npm run build
```

Record pre-existing lint failures separately; do not claim a clean lint run unless the exit code is zero.

- [ ] **Step 2: Capture matching browser states**

Capture Web General, Ping Options, Phone Numbers, IVR dialog, Web Chats, Web Chat dialog, and every completion window.

- [ ] **Step 3: Perform blocking design QA**

Compare hierarchy, dimensions, navigation, spacing, labels, disabled states, table geometry, modal composition, and footer actions. Document findings in `design-qa.md`; fix every P0/P1/P2 and repeat until it says `final result: passed`.

- [ ] **Step 4: Re-run fresh verification**

Run TypeScript, focused campaign tests, production build, and `git diff --check` after the last visual fix.

- [ ] **Step 5: Final commit**

```bash
git add design-qa.md src/features/campaign e2e/campaign-channel-editor.spec.ts e2e/campaign-next-steps.spec.ts public/assets/campaign-preview-*.png public/assets/web-chat-agent.png
git commit -m "feat(campaign): complete channel-specific campaign flows"
```
